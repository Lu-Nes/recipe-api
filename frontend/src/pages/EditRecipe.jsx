import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipeForm from "../components/RecipeForm";
import { fetchRecipeById, updateRecipe } from "../services/api";

function getEntityId(value) {
  if (!value) {
    return null;
  }

  const id = typeof value === "object" ? value._id ?? value.id : value;

  if (id === undefined || id === null) {
    return null;
  }

  const normalizedId = String(id).trim();
  return normalizedId || null;
}

function isRecipeOwner(recipe, currentUser) {
  const authorId = getEntityId(recipe?.author);
  const userId = getEntityId(currentUser);

  return Boolean(authorId && userId && authorId === userId);
}

function EditRecipe({ currentUser, onSessionExpired }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Rezept wird geladen
  const [isSaving, setIsSaving] = useState(false); // Änderungen werden gespeichert
  const [error, setError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);
        setSubmissionError(null);
        setRecipe(null);
        setFormData(null);

        const data = await fetchRecipeById(id);
        const loadedRecipe = data && data.recipe ? data.recipe : data;

        if (!isRecipeOwner(loadedRecipe, currentUser)) {
          setError("Du darfst dieses Rezept nicht bearbeiten.");
          return;
        }

        setRecipe(loadedRecipe);
        setFormData({
          title: loadedRecipe.title || "",
          description: loadedRecipe.description || "",
          ingredients: Array.isArray(loadedRecipe.ingredients)
            ? loadedRecipe.ingredients
            : [""],
          steps: Array.isArray(loadedRecipe.steps) ? loadedRecipe.steps : [""]
        });
      } catch (error) {
        if (error.status === 401) {
          onSessionExpired();
          return;
        }

        console.error("Fehler beim Laden des Rezepts zum Bearbeiten:", error);
        setError(error.message || "Rezept konnte nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [currentUser, id, onSessionExpired]);

  const handleSubmit = async payload => {
    try {
      setIsSaving(true);
      setSubmissionError(null);

      await updateRecipe(id, payload);
      navigate(`/recipes/${id}`, {
        state: { recipeUpdated: true }
      });
    } catch (error) {
      if (error.status === 401) {
        onSessionExpired();
        return;
      }

      if (error.status === 403 || error.status === 404) {
        setRecipe(null);
        setError(error.message || "Rezept konnte nicht aktualisiert werden.");
        return;
      }

      console.error("Fehler beim Aktualisieren des Rezepts:", error);
      setSubmissionError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="info-text">Rezept wird geladen...</p>
      </section>
    );
  }

  if (error && !recipe) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="error-text">Fehler: {error}</p>
      </section>
    );
  }

  if (!recipe || !formData) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="error-text">Rezept konnte nicht geladen werden.</p>
      </section>
    );
  }

  return (
    <section className="page recipe-form-page">
      <header className="recipe-form-page__header">
        <h1>Rezept bearbeiten</h1>
        <p>Aktualisiere die Angaben zu deinem Rezept.</p>
      </header>

      <RecipeForm
        key={id}
        initialValues={formData}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/recipes/${id}`)}
        isSubmitting={isSaving}
        submissionError={submissionError}
        onErrorClear={() => setSubmissionError(null)}
        submitLabel="Änderungen speichern"
        submittingLabel="Rezept wird gespeichert..."
      />
    </section>
  );
}

export default EditRecipe;
