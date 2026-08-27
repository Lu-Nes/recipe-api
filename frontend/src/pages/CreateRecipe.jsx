import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import { createRecipe, uploadRecipeImage } from "../services/api";

const createDraftStorageKey = "recipe-app:create-draft-after-session-expiry";
const createdRecipeStorageKey =
  "recipe-app:created-recipe-after-image-upload-session-expiry";

const emptyInitialValues = {
  title: "",
  description: "",
  ingredients: [""],
  steps: [""]
};

function getSessionStorageItem(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (error) {
    console.warn("SessionStorage konnte nicht gelesen werden:", error);
    return null;
  }
}

function setSessionStorageItem(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn("SessionStorage konnte nicht geschrieben werden:", error);
  }
}

function removeSessionStorageItem(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (error) {
    console.warn("SessionStorage konnte nicht bereinigt werden:", error);
  }
}

function isValidStringList(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(item => typeof item === "string")
  );
}

function isValidCreateDraft(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.title === "string" &&
      typeof value.description === "string" &&
      isValidStringList(value.ingredients) &&
      isValidStringList(value.steps) &&
      typeof value.hadImage === "boolean"
  );
}

function readCreateRecoveryState() {
  const storedRecipeId = getSessionStorageItem(createdRecipeStorageKey);
  const recipeId =
    typeof storedRecipeId === "string" &&
    /^[a-f\d]{24}$/i.test(storedRecipeId.trim())
      ? storedRecipeId.trim()
      : null;

  if (recipeId) {
    return {
      recipeId,
      draft: null,
      shouldClearRecipeId: true,
      shouldClearDraft: true
    };
  }

  const storedDraft = getSessionStorageItem(createDraftStorageKey);

  if (storedDraft === null) {
    return {
      recipeId: null,
      draft: null,
      shouldClearRecipeId: storedRecipeId !== null,
      shouldClearDraft: false
    };
  }

  try {
    const parsedDraft = JSON.parse(storedDraft);

    if (isValidCreateDraft(parsedDraft)) {
      return {
        recipeId: null,
        draft: parsedDraft,
        shouldClearRecipeId: storedRecipeId !== null,
        shouldClearDraft: true
      };
    }
  } catch (error) {
    console.warn("Gespeicherter Rezeptentwurf ist ungültig:", error);
  }

  return {
    recipeId: null,
    draft: null,
    shouldClearRecipeId: storedRecipeId !== null,
    shouldClearDraft: true
  };
}

function storeCreateDraft(payload, hadImage) {
  removeSessionStorageItem(createdRecipeStorageKey);
  setSessionStorageItem(
    createDraftStorageKey,
    JSON.stringify({
      title: payload.title,
      description: payload.description,
      ingredients: payload.ingredients,
      steps: payload.steps,
      hadImage
    })
  );
}

function storeCreatedRecipeId(recipeId) {
  // Das Rezept existiert bereits; ein alter Create-Entwurf darf deshalb nicht erneut angeboten werden.
  removeSessionStorageItem(createDraftStorageKey);
  setSessionStorageItem(createdRecipeStorageKey, recipeId);
}

function CreateRecipe({ onSessionExpired }) {
  const [recoveryState] = useState(readCreateRecoveryState);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const hasHandledRecoveryRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (hasHandledRecoveryRef.current) {
      return;
    }

    hasHandledRecoveryRef.current = true;

    if (recoveryState.shouldClearRecipeId) {
      removeSessionStorageItem(createdRecipeStorageKey);
    }

    if (recoveryState.shouldClearDraft) {
      removeSessionStorageItem(createDraftStorageKey);
    }

    if (recoveryState.recipeId) {
      navigate(`/recipes/${recoveryState.recipeId}`, {
        replace: true,
        state: { imageUploadFailed: true }
      });
    }
  }, [navigate, recoveryState]);

  const handleSubmit = async ({ imageFile, ...payload }) => {
    try {
      setIsLoading(true);
      setSubmissionError(null);

      let response;

      try {
        response = await createRecipe(payload);
      } catch (error) {
        if (error.status === 401) {
          storeCreateDraft(payload, Boolean(imageFile));
          onSessionExpired();
          return;
        }

        throw error;
      }

      const recipeId = response?.recipe?._id;

      if (!recipeId) {
        throw new Error("Die neue Rezept-ID konnte nicht ermittelt werden.");
      }

      if (imageFile) {
        try {
          await uploadRecipeImage(recipeId, imageFile);
        } catch (uploadError) {
          if (uploadError.status === 401) {
            storeCreatedRecipeId(recipeId);
            onSessionExpired();
            return;
          }

          console.error("Fehler beim Hochladen des Rezeptbildes:", uploadError);
          navigate(`/recipes/${recipeId}`, {
            state: { imageUploadFailed: true }
          });
          return;
        }
      }

      navigate(`/recipes/${recipeId}`, {
        state: { recipeCreated: true }
      });
    } catch (error) {
      if (error.status === 401) {
        onSessionExpired();
        return;
      }

      console.error("Fehler beim Erstellen des Rezepts:", error);
      setSubmissionError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (recoveryState.recipeId) {
    return null;
  }

  const initialValues = recoveryState.draft || emptyInitialValues;
  let recoveryMessage = null;

  if (recoveryState.draft) {
    recoveryMessage =
      "Deine Eingaben wurden nach dem erneuten Anmelden wiederhergestellt.";

    if (recoveryState.draft.hadImage) {
      recoveryMessage += " Bitte wähle das Rezeptbild erneut aus.";
    }
  }

  return (
    <section className="page recipe-form-page">
      <header className="recipe-form-page__header">
        <h1>Rezept erstellen</h1>
        <p>Trage die wichtigsten Infos zu deinem Rezept ein.</p>
      </header>

      {recoveryMessage && (
        <p className="info-text" role="status">
          {recoveryMessage}
        </p>
      )}

      <RecipeForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/my-recipes")}
        isSubmitting={isLoading}
        submissionError={submissionError}
        onErrorClear={() => setSubmissionError(null)}
        submitLabel="Rezept speichern"
        submittingLabel="Rezept wird gespeichert..."
        showImageInput
      />
    </section>
  );
}

export default CreateRecipe;
