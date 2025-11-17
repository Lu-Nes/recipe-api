import { API_BASE_URL } from "../services/api"

function getImageUrl(recipe) {
  // Hilfsfunktion, um aus dem image-Feld eine vollständige URL zu machen
  if (!recipe || !recipe.image) {
    return null
  }

  const image = recipe.image

  if (typeof image === "string" && image.startsWith("http")) {
    return image
  }

  if (typeof image === "string" && image.startsWith("/")) {
    return API_BASE_URL + image
  }

  return `${API_BASE_URL}/${image}`
}

function RecipeCard({ recipe }) {
  if (!recipe) {
    return null
  }

  const imageUrl = getImageUrl(recipe)

  let authorName = ""

  if (recipe.author) {
    // Falls bereits ein String (z. B. aus MyRecipes-Normalisierung)
    if (typeof recipe.author === "string") {
      authorName = recipe.author
    } else if (typeof recipe.author === "object" && recipe.author.name) {
      // Falls ein Author-Objekt mit name-Feld
      authorName = recipe.author.name
    }
  }

  return (
    <article className="card">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`Bild von ${recipe.title}`}
          className="card__image"
        />
      )}

      <h3>{recipe.title}</h3>
      <p className="card__meta">Kategorie: {recipe.category ?? "Unbekannt"}</p>
      <p>{recipe.description}</p>
      {authorName && <p className="card__author">Autor: {authorName}</p>}
    </article>
  )
}

export default RecipeCard
