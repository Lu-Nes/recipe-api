import RecipeCard from '../components/RecipeCard';

function MyRecipes() {
  // TODO: Hier später API-Aufruf ergänzen, um eigene Rezepte zu laden
  const myRecipes = [];

  return (
    <section className="page">
      <h1>Meine Rezepte</h1>
      <p>Hier erscheinen deine gespeicherten Gerichte.</p>
      {myRecipes.length === 0 ? (
        <p className="info-text">
          Noch keine eigenen Rezepte vorhanden. Lege über &quot;Rezept erstellen&quot; dein erstes an.
        </p>
      ) : (
        <div className="grid">
          {myRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MyRecipes;
