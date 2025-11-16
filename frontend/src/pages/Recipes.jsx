import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';

function Recipes() {
  // TODO: Später API-Aufruf nutzen, um Rezepte zu laden
  const recipes = [
    {
      id: 1,
      title: 'Hausgemachte Pasta',
      category: 'Italienisch',
      description: 'Frische Pasta mit cremiger Tomatensauce.',
      author: 'Anna',
    },
    {
      id: 2,
      title: 'Veganes Curry',
      category: 'Asiatisch',
      description: 'Aromatisches Gemüse-Curry in Kokosmilch.',
      author: 'Lukas',
    },
  ];

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Alle Rezepte</h1>
          <p>Entdecke neue Ideen und lass dich inspirieren.</p>
        </div>
        <Link to="/create" className="button">
          Neues Rezept
        </Link>
      </div>
      <div className="grid">
        {recipes.map((recipe) => (
          <Link to={`/recipes/${recipe.id}`} key={recipe.id}>
            <RecipeCard recipe={recipe} />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Recipes;
