const API_BASE_URL = "http://localhost:3000"

function getImageUrl(recipe) {
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
      <p className="card__meta">
        Kategorie: {recipe.category ?? "Unbekannt"}
      </p>
      <p>{recipe.description}</p>
      {recipe.author && (
        <p className="card__author">
          Autor: {recipe.author}
        </p>
      )}
    </article>
  )
}

export default RecipeCard
