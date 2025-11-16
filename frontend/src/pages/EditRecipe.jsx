import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function EditRecipe() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
  });

  useEffect(() => {
    // TODO: Hier später API-Aufruf ergänzen, um bestehendes Rezept zu laden
    setFormData({
      title: 'Beispielrezept',
      description: 'Dies ist ein Platzhalter für Rezeptbeschreibungen.',
      ingredients: 'Zutat A\nZutat B',
      steps: 'Schritt 1\nSchritt 2',
    });
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Hier später API-Aufruf einfügen
    console.log('Aktualisiertes Rezept', formData);
  };

  return (
    <section className="page">
      <h1>Rezept bearbeiten</h1>
      <p>Bearbeite dein Rezept mit der ID {id}.</p>
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

        <button type="submit">Änderungen speichern</button>
      </form>
    </section>
  );
}

export default EditRecipe;
