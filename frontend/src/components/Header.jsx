import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import LogoIcon from './LogoIcon';
import ThemeToggle from './ThemeToggle';

const primaryLinks = [
  { to: '/', label: 'Startseite' },
  { to: '/recipes', label: 'Rezepte' },
  { to: '/my-recipes', label: 'Meine Rezepte' },
  { to: '/create', label: 'Rezept erstellen' },
  { to: '/impressum', label: 'Impressum' },
];

const actionLinks = [
  { to: '/login', label: 'Login', variant: 'outline' },
  { to: '/register', label: 'Registrieren', variant: 'primary' },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
        <nav className="header__nav--desktop">
          {primaryLinks.map((link) => (
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
        <div className="header__action-links">
          {actionLinks.map((link) => (
            <NavLink
              key={`desktop-${link.to}`}
              to={link.to}
              className={({ isActive }) =>
                [
                  'header__link',
                  'header__link--action',
                  `header__link--${link.variant}`,
                  isActive ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <ThemeToggle />
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
      <div
        id="hauptnavigation"
        className={`header__mobile${isMenuOpen ? ' open' : ''}`}
      >
        <div className="header__nav-group">
          {primaryLinks.map((link) => (
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
          {actionLinks.map((link) => (
            <NavLink
              key={`mobile-${link.to}`}
              to={link.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                [
                  'header__link',
                  'header__link--action',
                  `header__link--${link.variant}`,
                  isActive ? 'active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
