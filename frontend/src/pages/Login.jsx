import { useState } from 'react';

function Login() {
  const [formData, setFormData] = useState({
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
    console.log('Login-Daten', formData);
  };

  return (
    <section className="page">
      <h1>Login</h1>
      <p>Melde dich an, um deine Rezepte zu verwalten.</p>
      <form className="form" onSubmit={handleSubmit}>
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
          placeholder="Passwort eingeben"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Anmelden</button>
      </form>
    </section>
  );
}

export default Login;
