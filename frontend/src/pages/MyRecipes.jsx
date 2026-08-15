import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { fetchMyRecipes } from "../services/api";

function MyRecipes({ onSessionExpired }) {
  // Zustand für eigene Rezepte, Ladeanzeige und Fehler
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Eigene Rezepte beim ersten Render laden
  useEffect(() => {
    async function loadMyRecipes() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchMyRecipes();

        if (data === null) {
          throw new Error("Server hat keine gültigen JSON-Daten zurückgegeben.");
        }

        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (Array.isArray(data.recipes)) {
          list = data.recipes;
        } else {
          throw new Error("Server hat ein unerwartetes Datenformat zurückgegeben.");
        }

        setRecipes(list);
      } catch (err) {
        if (err.status === 401) {
          onSessionExpired();
          return;
        }

        setError(err.message);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadMyRecipes();
  }, [onSessionExpired]);

  const normalizedRecipes = recipes.map(recipe => ({
    id: recipe._id || recipe.id,
    title: recipe.title,
    category: recipe.category,
    description: recipe.description,
    author: recipe.author && recipe.author.name ? recipe.author.name : "Unbekannt",
    image: recipe.image
  }));

  return (
    <section className="page recipe-overview" aria-labelledby="my-recipes-title">
      <header className="recipe-overview__header">
        <h1 id="my-recipes-title">Meine Rezepte</h1>
        <p>Hier erscheinen deine gespeicherten Gerichte.</p>
      </header>

      {isLoading && (
        <div className="recipe-overview__state" role="status">
          <p>Deine Rezepte werden geladen...</p>
        </div>
      )}

      {error && !isLoading && (
        <div
          className="recipe-overview__state recipe-overview__state--error"
          role="alert"
        >
          <h2>Deine Rezepte konnten nicht geladen werden</h2>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && normalizedRecipes.length === 0 && (
        <div className="recipe-overview__state recipe-overview__state--empty">
          <h2>Dein Food-Journal wartet auf das erste Rezept</h2>
          <p>Halte dein Lieblingsgericht fest und starte deine eigene Sammlung.</p>
          <Link to="/create" className="button recipe-overview__empty-action">
            Erstes Rezept erstellen
          </Link>
        </div>
      )}

      {!isLoading && !error && normalizedRecipes.length > 0 && (
        <div className="recipe-grid">
          {normalizedRecipes.map(recipe => (
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="recipe-card-link"
            >
              <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyRecipes;
