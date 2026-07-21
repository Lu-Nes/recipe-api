import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LogoIcon from './LogoIcon';
import ThemeToggle from './ThemeToggle';
import { logoutUser } from '../services/api';

// Navigationslinks für Hauptmenü
const primaryLinks = [
  { to: '/', label: 'Startseite' },
  { to: '/recipes', label: 'Rezepte' },
  // Diese beiden Links nur anzeigen, wenn User eingeloggt ist
  { to: '/my-recipes', label: 'Meine Rezepte', auth: true },
  { to: '/create', label: 'Rezept erstellen', auth: true },
  { to: '/impressum', label: 'Impressum' }
];

// Links für Login / Registrierung (nur wenn nicht eingeloggt)
const actionLinks = [
  { to: '/login', label: 'Login', variant: 'outline' },
  { to: '/register', label: 'Registrieren', variant: 'primary' }
];

function getErrorMessage(error, fallbackMessage) {
  return error instanceof Error && error.message
    ? error.message
    : fallbackMessage;
}

function Header({ isLoggedIn, setIsLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    if (isLogoutLoading) {
      return;
    }

    setLogoutError('');
    setIsLogoutLoading(true);

    try {
      await logoutUser();
      await setIsLoggedIn(false);
      closeMenu();
      navigate('/');
    } catch (error) {
      if (error.status === 401) {
        await setIsLoggedIn(false);
        closeMenu();
        navigate('/');
        return;
      }

      setLogoutError(
        getErrorMessage(error, 'Logout fehlgeschlagen. Bitte versuche es erneut.')
      );
    } finally {
      setIsLogoutLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header__layout">
        <div className="header__brand">
          <Link to="/" className="header__logo">
            <span className="header__logo-icon" aria-hidden="true">
              <LogoIcon size={32} />
            </span>
            <span className="header__title">Recipe API</span>
          </Link>
          <p className="header__subtitle">Einfache Verwaltung deiner Rezepte</p>
        </div>

        {/* Desktop-Navigation */}
        <nav className="header__nav--desktop">
          {primaryLinks
            .filter(link => !link.auth || isLoggedIn)
            .map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `header__link${isActive ? ' active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </nav>

        {/* Desktop-Action-Bereich (Login/Registrieren oder Logout) */}
        <div className="header__action-links">
          {!isLoggedIn &&
            actionLinks.map(link => (
              <NavLink
                key={`desktop-${link.to}`}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'header__link',
                    'header__link--action',
                    `header__link--${link.variant}`,
                    isActive ? 'active' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="header__link header__link--action header__link--outline"
            >
              {isLogoutLoading ? 'Wird abgemeldet...' : 'Logout'}
            </button>
          )}
        </div>

        <ThemeToggle />

        {/* Button für mobiles Menü */}
        <button
          type="button"
          className="header__menu"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="hauptnavigation"
        >
          Menü
        </button>
      </div>

      {logoutError !== '' && (
        <p className="form-message form-message--error" role="alert">
          {logoutError}
        </p>
      )}

      {/* Mobiles Menü */}
      <div
        id="hauptnavigation"
        className={`header__mobile${isMenuOpen ? ' open' : ''}`}
      >
        <div className="header__nav-group">
          {primaryLinks
            .filter(link => !link.auth || isLoggedIn)
            .map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `header__link${isActive ? ' active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>

        <div className="header__nav-actions">
          {!isLoggedIn &&
            actionLinks.map(link => (
              <NavLink
                key={`mobile-${link.to}`}
                to={link.to}
                onClick={closeMenu}
                className={({ isActive }) =>
                  [
                    'header__link',
                    'header__link--action',
                    `header__link--${link.variant}`,
                    isActive ? 'active' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}

          {isLoggedIn && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="header__link header__link--action header__link--outline"
            >
              {isLogoutLoading ? 'Wird abgemeldet...' : 'Logout'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
