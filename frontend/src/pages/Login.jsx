import { useState } from "react";
import { loginUser } from "../services/api";

// setIsLoggedIn kommt als Prop von App.jsx
function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Meldungen und Ladezustand für UI
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    // Verhindert Neuladen der Seite
    event.preventDefault();

    // Alte Meldungen zurücksetzen
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // API-Aufruf ans Backend mit Formular-Daten
      const result = await loginUser(formData);

      const message =
        result && result.message ? result.message : "Login erfolgreich";

      // Einfacher Login-Status im localStorage (für spätere Navigation / UI-Anpassungen)
      localStorage.setItem("isLoggedIn", "true");

      // Wenn die Funktion aus App.jsx übergeben wurde, Login-Status im React-State aktualisieren
      if (typeof setIsLoggedIn === "function") {
        setIsLoggedIn(true);
      }

      setSuccessMessage(message);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page">
      <h1>Login</h1>
      <p>Melde dich an, um deine Rezepte zu verwalten.</p>
      <form className="form" onSubmit={event => handleSubmit(event)}>
        <label htmlFor="email">E-Mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="E-Mail eingeben"
          value={formData.email}
          onChange={event => handleChange(event)}
          required
        />

        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Passwort eingeben"
          value={formData.password}
          onChange={event => handleChange(event)}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Anmelden..." : "Anmelden"}
        </button>

        {errorMessage !== "" && (
          <p className="form-message form-message--error">{errorMessage}</p>
        )}

        {successMessage !== "" && (
          <p className="form-message form-message--success">
            {successMessage}
          </p>
        )}
      </form>
    </section>
  );
}

export default Login;
