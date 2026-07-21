import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
    <section className="page">
      <h1>Login</h1>
      <p>Melde dich an, um deine Rezepte zu verwalten.</p>
      <form className="form" onSubmit={event => handleSubmit(event)}>
        {registrationMessage !== "" && (
          <p className="form-message form-message--success" role="status">
            {registrationMessage}
          </p>
        )}

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
          <p className="form-message form-message--error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}

export default Login;
