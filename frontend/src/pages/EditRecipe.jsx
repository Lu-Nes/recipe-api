import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRecipeById, updateRecipe } from '../services/api';

function getEntityId(value) {
  if (!value) {
    return null;
  }

  const id = typeof value === 'object' ? value._id ?? value.id : value;

  if (id === undefined || id === null) {
    return null;
  }

  const normalizedId = String(id).trim();
  return normalizedId || null;
}

function isRecipeOwner(recipe, currentUser) {
  const authorId = getEntityId(recipe?.author);
  const userId = getEntityId(currentUser);

  return Boolean(authorId && userId && authorId === userId);
}

function EditRecipe({ currentUser, onSessionExpired }) {
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
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      try {
        setIsLoading(true);
        setError(null);
        setRecipe(null);

        const data = await fetchRecipeById(id);
        console.log('Rezept zum Bearbeiten (Rohdaten):', data);

        const loadedRecipe = data && data.recipe ? data.recipe : data;

        if (!isRecipeOwner(loadedRecipe, currentUser)) {
          setError('Du darfst dieses Rezept nicht bearbeiten.');
          return;
        }

        setRecipe(loadedRecipe);

        setFormData({
          title: loadedRecipe.title || '',
          description: loadedRecipe.description || '',
          // Arrays in Textareas umwandeln (eine Zeile pro Eintrag)
          ingredients: Array.isArray(loadedRecipe.ingredients)
            ? loadedRecipe.ingredients.join('\n')
            : '',
          steps: Array.isArray(loadedRecipe.steps)
            ? loadedRecipe.steps.join('\n')
            : ''
        });
      } catch (error) {
        if (error.status === 401) {
          onSessionExpired();
          return;
        }

        console.error('Fehler beim Laden des Rezepts zum Bearbeiten:', error);
        setError(error.message || 'Rezept konnte nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecipe();
  }, [currentUser, id, onSessionExpired]);

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
      if (error.status === 401) {
        onSessionExpired();
        return;
      }

      if (error.status === 403 || error.status === 404) {
        setRecipe(null);
      }

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

  if (error && !recipe) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="error-text">Fehler: {error}</p>
      </section>
    );
  }

  if (!recipe) {
    return (
      <section className="page">
        <h1>Rezept bearbeiten</h1>
        <p className="error-text">Rezept konnte nicht geladen werden.</p>
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

        <label htmlFor="description">Beschreibung (optional)</label>
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
          required
        />

        <label htmlFor="steps">Zubereitungsschritte</label>
        <textarea
          id="steps"
          name="steps"
          placeholder="Beschreibe die Schritte"
          value={formData.steps}
          onChange={handleChange}
          rows="4"
          required
        />

        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Rezept wird gespeichert...' : 'Änderungen speichern'}
        </button>
      </form>
    </section>
  );
}

export default EditRecipe;
