import { useEffect, useState } from "react";

const STORAGE_KEY = "recipe-theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";
  const accessibleLabel = isDark
    ? "Dunkles Farbschema aktiv. Helles Farbschema einschalten."
    : "Helles Farbschema aktiv. Dunkles Farbschema einschalten.";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      aria-label={accessibleLabel}
      title={isDark ? "Helles Farbschema" : "Dunkles Farbschema"}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
