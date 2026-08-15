import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  fetchRecipeById,
  deleteRecipe,
  uploadRecipeImage,
  getImageUrl
} from "../services/api";

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

function RecipeDetails({ currentUser, onSessionExpired }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const deleteDialogRef = useRef(null);
  const imageInputRef = useRef(null);

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const data = await fetchRecipeById(id);

        if (data && data.recipe) {
          setRecipe(data.recipe);
        } else {
          setRecipe(data);
        }
      } catch (error) {
        console.error("Fehler beim Laden des Rezepts:", error);
        setLoadError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  const openDeleteDialog = () => {
    setDeleteError(null);
    deleteDialogRef.current?.showModal();
  };

  const closeDeleteDialog = () => {
    deleteDialogRef.current?.close();
  };

  const handleDeleteDialogCancel = event => {
    if (isDeleting) {
      event.preventDefault();
    }
  };

  const handleDelete = async event => {
    event.preventDefault();

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await deleteRecipe(id);
      navigate("/recipes", { state: { recipeDeleted: true } });
    } catch (error) {
      if (error.status === 401) {
        onSessionExpired();
        return;
      }

      console.error("Fehler beim Löschen des Rezepts:", error);
      setDeleteError(error.message || "Rezept konnte nicht gelöscht werden.");
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageFileChange = event => {
    setImageFile(event.target.files[0] || null);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleImageUpload = async event => {
    event.preventDefault();

    if (!recipe || !imageFile) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const data = await uploadRecipeImage(recipe._id || recipe.id, imageFile);

      if (data && data.recipe) {
        // Da die Upload-Antwort den Autor nicht immer populiert zurückliefert, bleibt der bereits geladene Autor für die Eigentümerprüfung erhalten.
        setRecipe(currentRecipe => ({
          ...data.recipe,
          author: currentRecipe?.author ?? data.recipe.author
        }));
      }

      setImageFile(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      setUploadSuccess(data?.message || "Das Rezeptbild wurde aktualisiert.");
    } catch (error) {
      if (error.status === 401) {
        onSessionExpired();
        return;
      }

      console.error("Fehler beim Hochladen des Bildes:", error);
      setUploadError(error.message || "Bild konnte nicht hochgeladen werden.");
    } finally {
      setIsUploading(false);
    }
  };

  const imageUrl = getImageUrl(recipe?.image);
  const showRecipeImage = Boolean(
    imageUrl && failedImageUrl !== imageUrl
  );
  const hasDescription =
    typeof recipe?.description === "string" && recipe.description.trim() !== "";
  const authorName =
    typeof recipe?.author?.name === "string" && recipe.author.name.trim()
      ? recipe.author.name.trim()
      : "Unbekannt";
  const isOwner = isRecipeOwner(recipe, currentUser);
  const recipeId = recipe?._id || recipe?.id;

  return (
    <section className="page recipe-details">
      <Link to="/recipes" className="recipe-details__back-link">
        <span aria-hidden="true">←</span>
        Zur Rezeptübersicht
      </Link>

      {isLoading && (
        <div className="recipe-details__state" role="status" aria-busy="true">
          <p>Rezept wird geladen...</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div
          className="recipe-details__state recipe-details__state--error"
          role="alert"
        >
          <h1>Rezept konnte nicht geladen werden</h1>
          <p>{loadError}</p>
        </div>
      )}

      {!isLoading && !loadError && recipe && (
        <>
          <article className="recipe-details__article">
            <div className="recipe-details__hero">
              <div className="recipe-details__media">
                {showRecipeImage ? (
                  <img
                    className="recipe-details__image"
                    src={imageUrl}
                    alt={recipe.title}
                    onError={() => setFailedImageUrl(imageUrl)}
                  />
                ) : (
                  <div
                    className="recipe-details__image-placeholder"
                    role="img"
                    aria-label={`Kein Bild für ${recipe.title} verfügbar`}
                  >
                    <span>Kein Rezeptbild verfügbar</span>
                  </div>
                )}
              </div>

              <header className="recipe-details__intro">
                <p className="recipe-details__eyebrow">Rezept</p>
                <h1 id="recipe-title">{recipe.title}</h1>
                <p className="recipe-details__author">
                  <span>Autor</span>
                  {authorName}
                </p>
                {hasDescription && (
                  <p className="recipe-details__description">
                    {recipe.description}
                  </p>
                )}
              </header>
            </div>

            <div className="recipe-details__content">
              {recipe.ingredients?.length > 0 && (
                <section
                  className="recipe-details__section"
                  aria-labelledby="ingredients-title"
                >
                  <h2 id="ingredients-title">Zutaten</h2>
                  <ul className="recipe-details__list">
                    {recipe.ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              {recipe.steps?.length > 0 && (
                <section
                  className="recipe-details__section"
                  aria-labelledby="steps-title"
                >
                  <h2 id="steps-title">Zubereitung</h2>
                  <ol className="recipe-details__list recipe-details__steps">
                    {recipe.steps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </article>

          {isOwner && (
            <section
              className="recipe-management"
              aria-labelledby="recipe-management-title"
            >
              <header className="recipe-management__header">
                <p className="recipe-management__eyebrow">Dein Rezept</p>
                <h2 id="recipe-management-title">Rezept verwalten</h2>
              </header>

              {deleteError && (
                <p
                  className="recipe-management__feedback recipe-management__feedback--error"
                  role="alert"
                >
                  {deleteError}
                </p>
              )}

              <div className="recipe-management__layout">
                <form
                  className="recipe-management__upload"
                  onSubmit={handleImageUpload}
                >
                  <div>
                    <h3>Rezeptbild aktualisieren</h3>
                    <p className="recipe-management__hint">
                      Wähle eine Bilddatei von deinem Gerät aus.
                    </p>
                  </div>

                  <input
                    ref={imageInputRef}
                    id="image-upload"
                    className="recipe-management__file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                  />
                  <label
                    className="recipe-management__file-label"
                    htmlFor="image-upload"
                  >
                    Bild auswählen
                  </label>

                  {imageFile && (
                    <p className="recipe-management__selected-file">
                      Gewählte Datei: <strong>{imageFile.name}</strong>
                    </p>
                  )}

                  <button
                    type="submit"
                    className="button recipe-management__upload-button"
                    disabled={!imageFile || isUploading}
                  >
                    {isUploading ? "Bild wird hochgeladen..." : "Bild hochladen"}
                  </button>

                  {uploadError && (
                    <p
                      className="recipe-management__feedback recipe-management__feedback--error"
                      role="alert"
                    >
                      {uploadError}
                    </p>
                  )}

                  {uploadSuccess && (
                    <p
                      className="recipe-management__feedback recipe-management__feedback--success"
                      role="status"
                    >
                      {uploadSuccess}
                    </p>
                  )}
                </form>

                <div className="recipe-management__actions">
                  <div className="recipe-management__edit-action">
                    <h3>Rezept bearbeiten</h3>
                    <p>Ändere Titel, Beschreibung, Zutaten oder Zubereitung.</p>
                    <Link to={`/edit/${recipeId}`} className="button">
                      Rezept bearbeiten
                    </Link>
                  </div>

                  <div className="recipe-management__danger-zone">
                    <h3>Rezept löschen</h3>
                    <p>Das Rezept wird dauerhaft aus deiner Sammlung entfernt.</p>
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={openDeleteDialog}
                    >
                      Rezept löschen
                    </button>
                  </div>
                </div>
              </div>

              <dialog
                ref={deleteDialogRef}
                className="delete-recipe-dialog"
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                onCancel={handleDeleteDialogCancel}
              >
                <form
                  className="delete-recipe-dialog__content"
                  onSubmit={handleDelete}
                >
                  <div>
                    <h2 id="delete-dialog-title">Rezept wirklich löschen?</h2>
                    <p id="delete-dialog-description">
                      „{recipe.title}“ wird dauerhaft gelöscht. Diese Aktion kann
                      nicht rückgängig gemacht werden.
                    </p>
                  </div>

                  <div className="delete-recipe-dialog__actions">
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={closeDeleteDialog}
                      disabled={isDeleting}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="button button--danger"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Rezept wird gelöscht..." : "Endgültig löschen"}
                    </button>
                  </div>
                </form>
              </dialog>
            </section>
          )}
        </>
      )}
    </section>
  );
}

export default RecipeDetails;
