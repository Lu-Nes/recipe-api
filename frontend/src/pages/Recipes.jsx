import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { fetchRecipes } from "../services/api";

function Recipes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage] = useState(() =>
    location.state?.recipeDeleted ? "Rezept erfolgreich gelöscht." : null
  );

  // Der Router-State wird nach dem Übernehmen entfernt, damit die Erfolgsmeldung nach einem Reload nicht erneut erscheint.
  useEffect(() => {
    if (!location.state?.recipeDeleted) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash
      },
      { replace: true, state: null }
    );
  }, [location.hash, location.pathname, location.search, location.state, navigate]);

  // Rezepte aus Backend laden
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchRecipes();

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
        setError(err.message);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipes();
  }, []);

  const normalizedRecipes = recipes.map(recipe => ({
    id: recipe._id || recipe.id,
    title: recipe.title,
    category: recipe.category,
    description: recipe.description,
    author: recipe.author && recipe.author.name ? recipe.author.name : "Unbekannt",
    image: recipe.image
  }));

  return (
    <section className="page recipe-overview" aria-labelledby="recipes-title">
      <header className="recipe-overview__header">
        <h1 id="recipes-title">Alle Rezepte</h1>
        <p>Entdecke neue Ideen und lass dich inspirieren.</p>
      </header>

      {successMessage && (
        <p className="recipe-overview__success" role="status">
          {successMessage}
        </p>
      )}

      {isLoading && (
        <div className="recipe-overview__state" role="status">
          <p>Rezepte werden geladen...</p>
        </div>
      )}

      {error && !isLoading && (
        <div
          className="recipe-overview__state recipe-overview__state--error"
          role="alert"
        >
          <h2>Rezepte konnten nicht geladen werden</h2>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && normalizedRecipes.length === 0 && (
        <div className="recipe-overview__state">
          <h2>Noch keine Rezepte vorhanden</h2>
          <p>Sobald Rezepte veröffentlicht wurden, findest du sie hier.</p>
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

export default Recipes;
