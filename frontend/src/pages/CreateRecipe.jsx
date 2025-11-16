import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecipe } from '../services/api';

function CreateRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    // Textareas in Arrays umwandeln (eine Zeile = ein Eintrag)
    const ingredientsArray = formData.ingredients
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');

    const stepsArray = formData.steps
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');

    const payload = {
      title: formData.title,
      description: formData.description,
      ingredients: ingredientsArray,
      steps: stepsArray
      // Falls dein Backend noch mehr Felder erwartet (prepTime, cookTime, ...),
      // können wir die später ergänzen.
    };

    try {
      setIsLoading(true);
      setError(null);

      const savedRecipe = await createRecipe(payload);
      console.log('Neues Rezept gespeichert:', savedRecipe);

      // Nach dem Speichern zurück zur Übersicht
      navigate('/recipes');
    } catch (error) {
      console.error('Fehler beim Erstellen des Rezepts:', error);
      setError(error.message || 'Rezept konnte nicht erstellt werden.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page">
      <h1>Rezept erstellen</h1>
      <p>Trage die wichtigsten Infos zu deinem Rezept ein.</p>

      {error && (
        <p className="error-text">
          Fehler beim Speichern: {error}
        </p>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="title">Titel</label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Titel des Rezepts"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Beschreibung</label>
        <textarea
          id="description"
          name="description"
          placeholder="Kurze Beschreibung"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />

        <label htmlFor="ingredients">Zutaten</label>
        <textarea
          id="ingredients"
          name="ingredients"
          placeholder="Eine Zutat pro Zeile"
          value={formData.ingredients}
          onChange={handleChange}
          rows="4"
        />

        <label htmlFor="steps">Zubereitungsschritte</label>
        <textarea
          id="steps"
          name="steps"
          placeholder="Beschreibe die Schritte"
          value={formData.steps}
          onChange={handleChange}
          rows="4"
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Rezept wird gespeichert...' : 'Rezept speichern'}
        </button>
      </form>
    </section>
  );
}

export default CreateRecipe;
