import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import RecipeCard from "../components/RecipeCard"

function MyRecipes() {
  // Zustand für eigene Rezepte, Ladeanzeige und Fehler
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Eigene Rezepte beim ersten Render laden
  useEffect(() => {
    async function loadMyRecipes() {
      try {
        setIsLoading(true)
        setError(null)

        // Authentifizierter Request: Cookies müssen mitgeschickt werden
        const response = await fetch("http://localhost:3000/recipes/my-recipes", {
          credentials: "include"
        })

        const text = await response.text()

        // 401: Kein Token / nicht eingeloggt
        if (response.status === 401) {
          console.log("401-Antwort von /recipes/my-recipes:", text)

          let message = "Du bist nicht eingeloggt oder deine Sitzung ist abgelaufen."
          try {
            const json = JSON.parse(text)
            if (json.message) {
              message = json.message
            }
          } catch {
            // Wenn kein gültiges JSON, Standardtext lassen
          }

          throw new Error(message)
        }

        if (!response.ok) {
          console.log("Fehler-Antwort vom Server (my-recipes):", text)
          throw new Error("Fehler beim Laden deiner Rezepte")
        }

        let data
        try {
          data = JSON.parse(text)
        } catch (parseError) {
          console.log("Antwort war kein gültiges JSON (my-recipes):", text)
          throw new Error("Server hat keine gültigen JSON-Daten zurückgegeben.")
        }

        console.log("Antwort-Daten von /recipes/my-recipes:", data)

        if (Array.isArray(data)) {
          setRecipes(data)
        } else if (Array.isArray(data.recipes)) {
          setRecipes(data.recipes)
        } else {
          console.log("Unerwartetes Datenformat von /recipes/my-recipes:", data)
          throw new Error("Server hat ein unerwartetes Datenformat zurückgegeben.")
        }
      } catch (error) {
        setError(error.message)
        setRecipes([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMyRecipes()
  }, [])

  const normalizedRecipes = recipes.map(recipe => {
    return {
      id: recipe._id || recipe.id,
      title: recipe.title,
      category: recipe.category,
      description: recipe.description,
      // Eigene Rezepte: Autor bist du selbst
      author: "Du",
      image: recipe.image
    }
  })

  return (
    <section className="page">
      <h1>Meine Rezepte</h1>
      <p>Hier erscheinen deine gespeicherten Gerichte.</p>

      {isLoading && (
        <p className="info-text">Deine Rezepte werden geladen...</p>
      )}

      {error && !isLoading && (
        <p className="error-text">
          {error}
        </p>
      )}

      {!isLoading && !error && normalizedRecipes.length === 0 && (
        <p className="info-text">
          Noch keine eigenen Rezepte vorhanden. Lege über &quot;Rezept erstellen&quot; dein erstes an.
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

export default MyRecipes
