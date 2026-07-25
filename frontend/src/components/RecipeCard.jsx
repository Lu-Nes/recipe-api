import { getImageUrl } from "../services/api"

function RecipeCard({ recipe }) {
  if (!recipe) {
    return null
  }

  const imageUrl = getImageUrl(recipe.image)
  const hasDescription =
    typeof recipe.description === "string" && recipe.description.trim() !== ""

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
      {hasDescription && <p>{recipe.description}</p>}
      {recipe.author && (
        <p className="card__author">
          Autor: {recipe.author}
        </p>
      )}
    </article>
  )
}

export default RecipeCard
