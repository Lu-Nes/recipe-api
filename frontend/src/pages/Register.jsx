import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api';

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message
    ? error.message
    : fallbackMessage;
}

function Register({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const navigateToLoginAfterFailedAutomaticLogin = () => {
    navigate('/login', {
      state: {
        email: formData.email,
        message:
          'Dein Konto wurde erstellt, aber die automatische Anmeldung ist fehlgeschlagen. Bitte melde dich an.',
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    let registrationSucceeded = false;

    try {
      await registerUser(formData);
      registrationSucceeded = true;

      await loginUser({
        email: formData.email,
        password: formData.password,
      });
      const isSessionConfirmed = await setIsLoggedIn(true);

      if (!isSessionConfirmed) {
        navigateToLoginAfterFailedAutomaticLogin();
        return;
      }

      navigate('/my-recipes');
    } catch (error) {
      if (registrationSucceeded) {
        navigateToLoginAfterFailedAutomaticLogin();
        return;
      }

      setErrorMessage(
        getErrorMessage(error, 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'),
      );
    } finally {
      setIsLoading(false);
    }
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Konto wird eingerichtet...' : 'Account erstellen'}
        </button>

        {errorMessage !== '' && (
          <p className="form-message form-message--error" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </section>
  );
}

export default Register;
