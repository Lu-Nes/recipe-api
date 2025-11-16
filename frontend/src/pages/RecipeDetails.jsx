import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRecipeById, deleteRecipe } from "../services/api";

function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Rezept aus Backend laden
  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchRecipeById(id);
        console.log("Rezeptdetails (Rohdaten):", data);

        // Backend liefert ein Objekt wie { recipe: {...} }
        if (data && data.recipe) {
          setRecipe(data.recipe);
        } else {
          // Fallback, falls das Backend später direkt das Rezept zurückgibt
          setRecipe(data);
        }
      } catch (error) {
        console.error("Fehler beim Laden des Rezepts:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Möchtest du dieses Rezept wirklich löschen?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await deleteRecipe(id);
      console.log("Rezept erfolgreich gelöscht");

      // Nach dem Löschen zurück zur Übersicht
      navigate("/recipes");
    } catch (error) {
      console.error("Fehler beim Löschen des Rezepts:", error);
      setError(error.message || "Rezept konnte nicht gelöscht werden.");
      setIsDeleting(false);
    }
  };

  return (
    <section className="page">
      <h1>Rezeptdetails</h1>

      {isLoading && <p className="info-text">Rezept wird geladen...</p>}

      {error && !isLoading && <p className="error-text">Fehler: {error}</p>}

      {!isLoading && !error && recipe && (
        <>
          <article className="card">
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <>
                <h3>Zutaten</h3>
                <ul>
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            {recipe.steps && recipe.steps.length > 0 && (
              <>
                <h3>Zubereitung</h3>
                <ol>
                  {recipe.steps.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              </>
            )}
          </article>

          <div
            className="page__actions"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {/* Linke Buttons */}
            <Link to="/recipes" className="button button--secondary">
              Zurück zur Übersicht
            </Link>

            <Link to={`/edit/${id}`} className="button">
              Rezept bearbeiten
            </Link>

            {/* Unsichtbarer Spacer schiebt den Löschbutton nach rechts */}
            <div style={{ flex: 1 }}></div>

            {/* Löschbutton rechts, gleiche Größe & Schrift */}
            <button
              type="button"
              className="button button--danger"
              style={{ fontSize: "1rem" }}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Rezept wird gelöscht..." : "Rezept löschen"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default RecipeDetails;
