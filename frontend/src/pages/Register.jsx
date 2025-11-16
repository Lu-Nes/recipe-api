import { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Hier später API-Aufruf einfügen
    console.log('Registrierungs-Daten', formData);
  };

  return (
    <section className="page">
      <h1>Registrieren</h1>
      <p>Lege jetzt einen Account an, um eigene Rezepte zu speichern.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Vollständiger Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">E-Mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="E-Mail eingeben"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mindestens 8 Zeichen"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Account erstellen</button>
      </form>
    </section>
  );
}

export default Register;
