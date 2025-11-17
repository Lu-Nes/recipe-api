import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import RecipeCard from "../components/RecipeCard"
import { fetchRecipes } from "../services/api"

function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Rezepte aus Backend laden
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true)
        setError(null)

        const data = await fetchRecipes()
        console.log("Antwort-Daten von /recipes:", data)

        let list = []
        if (Array.isArray(data)) {
          list = data
        } else if (Array.isArray(data.recipes)) {
          list = data.recipes
        } else {
          throw new Error("Server hat ein unerwartetes Datenformat zurückgegeben.")
        }

        setRecipes(list)
      } catch (err) {
        setError(err.message)
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipes()
  }, [])

  const normalizedRecipes = recipes.map(recipe => ({
    id: recipe._id || recipe.id,
    title: recipe.title,
    category: recipe.category,
    description: recipe.description,
    author: recipe.author && recipe.author.name ? recipe.author.name : "Unbekannt",
    image: recipe.image
  }))

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Alle Rezepte</h1>
          <p>Entdecke neue Ideen und lass dich inspirieren.</p>
        </div>
      </div>

      {isLoading && (
        <p className="info-text">Rezepte werden geladen...</p>
      )}

      {error && !isLoading && (
        <p className="error-text">
          {error}
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
            <Link
              key={recipe.id}
              to={`/recipes/${recipe.id}`}
              className="card-link"
            >
              <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default Recipes
