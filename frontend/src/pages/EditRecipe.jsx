import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRecipeById, updateRecipe } from '../services/api';

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: ''
  });

  const [isLoading, setIsLoading] = useState(true);   // Rezept wird geladen
  const [isSaving, setIsSaving] = useState(false);    // Änderungen werden gespeichert
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchRecipeById(id);
        console.log('Rezept zum Bearbeiten (Rohdaten):', data);

        const recipe = data && data.recipe ? data.recipe : data;

        setFormData({
          title: recipe.title || '',
          description: recipe.description || '',
          // Arrays in Textareas umwandeln (eine Zeile pro Eintrag)
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients.join('\n')
            : '',
          steps: Array.isArray(recipe.steps)
            ? recipe.steps.join('\n')
            : ''
        });
      } catch (error) {
        console.error('Fehler beim Laden des Rezepts zum Bearbeiten:', error);
        setError(error.message || 'Rezept konnte nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [id]);

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
    };

    try {
      setIsSaving(true);
      setError(null);

      const updatedRecipe = await updateRecipe(id, payload);
      console.log('Aktualisiertes Rezept:', updatedRecipe);

      // Nach dem Speichern zurück zur Detailseite
      navigate(`/recipes/${id}`);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Rezepts:', error);
      setError(error.message || 'Rezept konnte nicht aktualisiert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="info-text">Rezept wird geladen...</p>
      </section>
    );
  }

  return (
    <section className="page">
      <h1>Rezept bearbeiten</h1>
      <p>Bearbeite dein Rezept mit der ID {id}.</p>

      {error && (
        <p className="error-text">
          Fehler: {error}
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

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Rezept wird gespeichert...' : 'Änderungen speichern'}
        </button>
      </form>
    </section>
  );
}

export default EditRecipe;
