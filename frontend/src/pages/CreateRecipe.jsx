import { useState } from 'react';

function CreateRecipe() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    steps: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Hier später API-Aufruf einfügen
    console.log('Neues Rezept', formData);
  };

  return (
    <section className="page">
      <h1>Rezept erstellen</h1>
      <p>Trage die wichtigsten Infos zu deinem Rezept ein.</p>
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

        <button type="submit">Rezept speichern</button>
      </form>
    </section>
  );
}

export default CreateRecipe;
