import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import LogoIcon from './LogoIcon';
import ThemeToggle from './ThemeToggle';

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

function Header({ isLoggedIn, setIsLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Logout-Funktion: Login-Status zurücksetzen
  const handleLogout = () => {
    // Login-Status im localStorage entfernen
    localStorage.removeItem('isLoggedIn');
    // React-State aktualisieren, damit UI sich anpasst
    setIsLoggedIn(false);
    // Mobiles Menü schließen (falls offen)
    closeMenu();
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
              className="header__link header__link--action header__link--outline"
            >
              Logout
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
              className="header__link header__link--action header__link--outline"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
