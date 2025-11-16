import { useEffect, useState } from 'react';

const STORAGE_KEY = 'recipe-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label="Theme wechseln"
      title="Theme wechseln"
    >
      <span aria-hidden="true">{isDark ? '🌙' : '☀️'}</span>
    </button>
  );
}
