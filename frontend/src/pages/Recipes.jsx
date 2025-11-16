import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { fetchRecipes } from "../services/api";

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Rezepte aus Backend laden
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchRecipes(); // ← API-Layer verwenden
        console.log("Antwort-Daten von /recipes:", data);

        if (Array.isArray(data.recipes)) {
          setRecipes(data.recipes);
        } else if (Array.isArray(data)) {
          setRecipes(data);
        } else {
          setRecipes([]);
          setError("Server hat ein unerwartetes Datenformat zurückgegeben.");
        }
      } catch (error) {
        console.error("Fehler beim Laden der Rezepte:", error);
        setError(error.message);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, []);

  // Vereinheitlichte Daten für RecipeCard
  const normalizedRecipes = recipes.map(recipe => {
    return {
      id: recipe._id || recipe.id,
      title: recipe.title,
      category: recipe.category,
      description: recipe.description,
      author: recipe.author?.name || "Unbekannt"
    };
  });

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Alle Rezepte</h1>
          <p>Entdecke neue Ideen und lass dich inspirieren.</p>
        </div>
        <Link to="/create" className="button">
          Neues Rezept
        </Link>
      </div>

      {isLoading && (
        <p className="info-text">Rezepte werden geladen...</p>
      )}

      {error && !isLoading && (
        <p className="error-text">
          Fehler beim Laden der Rezepte: {error}
        </p>
      )}

      {!isLoading && !error && normalizedRecipes.length === 0 && (
        <p className="info-text">
          Noch keine Rezepte vorhanden.
        </p>
      )}

      {!isLoading && !error && normalizedRecipes.length > 0 && (
        <div className="grid">
          {normalizedRecipes.map(recipe => (
            <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default Recipes;
