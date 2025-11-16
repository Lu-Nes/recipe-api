function RecipeCard({ recipe }) {
  if (!recipe) {
    return null;
  }

  return (
    <article className="card">
      <h3>{recipe.title}</h3>
      <p className="card__meta">Kategorie: {recipe.category ?? 'Unbekannt'}</p>
      <p>{recipe.description}</p>
      {recipe.author && <p className="card__author">Autor: {recipe.author}</p>}
    </article>
  );
}

export default RecipeCard;
