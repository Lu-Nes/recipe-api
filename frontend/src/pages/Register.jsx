import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message
    ? error.message
    : fallbackMessage;
}

function Register({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const navigateToLoginAfterFailedAutomaticLogin = () => {
    navigate("/login", {
      state: {
        email: formData.email,
        message:
          "Dein Konto wurde erstellt, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melde dich an."
      }
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    let registrationSucceeded = false;

    try {
      await registerUser(formData);
      registrationSucceeded = true;

      await loginUser({
        email: formData.email,
        password: formData.password
      });
      const isSessionConfirmed = await setIsLoggedIn(true);

      if (!isSessionConfirmed) {
        navigateToLoginAfterFailedAutomaticLogin();
        return;
      }

      navigate("/my-recipes");
    } catch (error) {
      if (registrationSucceeded) {
        navigateToLoginAfterFailedAutomaticLogin();
        return;
      }

      setErrorMessage(
        getErrorMessage(
          error,
          "Registrierung fehlgeschlagen. Bitte versuche es erneut."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page auth-page" aria-labelledby="register-title">
      <form className="form auth-form" onSubmit={handleSubmit}>
        <header className="auth-form__header">
          <h1 id="register-title">Konto erstellen</h1>
          <p>
            Erstelle ein Konto, um eigene Rezepte zu speichern und zu
            verwalten.
          </p>
        </header>

        {errorMessage !== "" && (
          <p className="form-message form-message--error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Vollständiger Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="E-Mail eingeben"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              aria-describedby="password-hint"
              placeholder="Passwort eingeben"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
            <small id="password-hint">Mindestens 8 Zeichen.</small>
          </div>
        </div>

        <button
          className="button auth-form__submit"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Konto wird eingerichtet..." : "Konto erstellen"}
        </button>

        <p className="auth-form__switch">
          <Link to="/login">Du hast bereits ein Konto? Zum Login</Link>
        </p>
      </form>
    </section>
  );
}

export default Register;
