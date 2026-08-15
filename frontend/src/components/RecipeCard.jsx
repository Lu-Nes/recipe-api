import { useState } from "react";
import { getImageUrl } from "../services/api";

function RecipeCard({ recipe }) {
  const [failedImageUrl, setFailedImageUrl] = useState(null);

  if (!recipe) {
    return null;
  }

  const imageUrl = getImageUrl(recipe.image);
  const hasImageError = imageUrl === failedImageUrl;
  const hasDescription =
    typeof recipe.description === "string" && recipe.description.trim() !== "";
  const title = recipe.title || "Unbenanntes Rezept";
  const category = recipe.category || "Ohne Kategorie";
  const author = recipe.author || "Unbekannt";

  return (
    <article className="recipe-card">
      <div className="recipe-card__media">
        <div className="recipe-card__placeholder" aria-hidden="true">
          <span>Kein Bild verfügbar</span>
        </div>
        {imageUrl && !hasImageError && (
          <img
            src={imageUrl}
            alt={`Bild von ${title}`}
            className="recipe-card__image"
            onError={() => setFailedImageUrl(imageUrl)}
          />
        )}
      </div>

      <div className="recipe-card__content">
        <p className="recipe-card__category">{category}</p>
        <h2 className="recipe-card__title">{title}</h2>
        {hasDescription && (
          <p className="recipe-card__description">{recipe.description.trim()}</p>
        )}
        <p className="recipe-card__author">
          <span>Von</span> {author}
        </p>
      </div>
    </article>
  );
}

export default RecipeCard;
