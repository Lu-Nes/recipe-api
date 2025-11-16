import { useParams, Link } from 'react-router-dom';

function RecipeDetails() {
  const { id } = useParams();
  // TODO: Hier später API-Aufruf ergänzen, um Rezeptdetails zu laden
  const recipe = {
    id,
    title: 'Platzhalter-Rezept',
    description: 'Hier werden bald die echten Details des Rezeptes angezeigt.',
    ingredients: ['Zutat 1', 'Zutat 2', 'Zutat 3'],
    steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
  };

  return (
    <section className="page">
      <h1>Rezeptdetails</h1>
      <p>ID: {id}</p>
      <article className="card">
        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
        <h3>Zutaten</h3>
        <ul>
          {recipe.ingredients.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>Zubereitung</h3>
        <ol>
          {recipe.steps.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </article>
      <div className="page__actions">
        <Link to="/recipes" className="button button--secondary">
          Zurück zur Übersicht
        </Link>
        <Link to={`/edit/${id}`} className="button">
          Rezept bearbeiten
        </Link>
      </div>
    </section>
  );
}

export default RecipeDetails;
