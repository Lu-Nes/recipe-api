import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message
    ? error.message
    : fallbackMessage;
}

function getSafeReturnTarget(target) {
  const isAuthRoute =
    target?.pathname === "/login" || target?.pathname === "/register";

  if (
    typeof target?.pathname !== "string" ||
    !target.pathname.startsWith("/") ||
    target.pathname.startsWith("//") ||
    isAuthRoute
  ) {
    return "/my-recipes";
  }

  return {
    pathname: target.pathname,
    search: typeof target.search === "string" ? target.search : "",
    hash: typeof target.hash === "string" ? target.hash : ""
  };
}

function Login({ setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({
    email:
      typeof location.state?.email === "string" ? location.state.email : "",
    password: ""
  }));

  const [errorMessage, setErrorMessage] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState(() =>
    typeof location.state?.message === "string"
      ? location.state.message
      : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage("");
    setRegistrationMessage("");
    setIsLoading(true);

    try {
      await loginUser(formData);
      const isSessionConfirmed = await setIsLoggedIn(true);

      if (!isSessionConfirmed) {
        setErrorMessage(
          "Die Anmeldung konnte nicht bestätigt werden. Bitte versuche es erneut."
        );
        return;
      }

      navigate(getSafeReturnTarget(location.state?.from), { replace: true });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Login fehlgeschlagen. Bitte versuche es erneut.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page auth-page" aria-labelledby="login-title">
      <form
        className="form auth-form"
        onSubmit={event => handleSubmit(event)}
      >
        <header className="auth-form__header">
          <h1 id="login-title">Willkommen zurück</h1>
          <p>
            Melde dich an und verwalte deine persönliche Rezeptsammlung.
          </p>
        </header>

        {registrationMessage !== "" && (
          <p className="form-message form-message--success" role="status">
            {registrationMessage}
          </p>
        )}

        {errorMessage !== "" && (
          <p className="form-message form-message--error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="auth-form__fields">
          <div className="auth-form__field">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="E-Mail eingeben"
              value={formData.email}
              onChange={event => handleChange(event)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Passwort eingeben"
              value={formData.password}
              onChange={event => handleChange(event)}
              required
            />
          </div>
        </div>

        <button
          className="button auth-form__submit"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Anmelden..." : "Anmelden"}
        </button>

        <p className="auth-form__switch">
          <Link to="/register">Noch kein Konto? Jetzt registrieren</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
