import { useCallback, useState, useEffect } from "react";
import {
  Navigate,
  Routes,
  Route,
  useLocation,
  useNavigate
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipes from "./pages/Recipes";
import RecipeDetails from "./pages/RecipeDetails";
import MyRecipes from "./pages/MyRecipes";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import Impressum from "./pages/Impressum";
import { getCurrentUser } from "./services/api";

function getSessionErrorMessage(error) {
  return error instanceof Error && error.message
    ? error.message
    : "Der Anmeldestatus konnte nicht geprüft werden.";
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

function ProtectedRoute({ children, isLoggedIn }) {
  const location = useLocation();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: getSafeReturnTarget(location) }}
      />
    );
  }

  return children;
}

function GuestRoute({ children, isLoggedIn }) {
  const location = useLocation();

  if (isLoggedIn) {
    return (
      <Navigate
        to={
          location.pathname === "/login"
            ? getSafeReturnTarget(location.state?.from)
            : "/my-recipes"
        }
        replace
      />
    );
  }

  return children;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isLoggedIn = currentUser !== null;

  // Erst das Backend kann verlässlich bestätigen, ob das HttpOnly-Cookie eine gültige Session enthält.
  useEffect(() => {
    let isActive = true;

    getCurrentUser()
      .then(user => {
        if (isActive) {
          setCurrentUser(user);
        }
      })
      .catch(error => {
        if (isActive) {
          setAuthError(getSessionErrorMessage(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const updateAuthStatus = async nextIsLoggedIn => {
    if (!nextIsLoggedIn) {
      setCurrentUser(null);
      return true;
    }

    try {
      const user = await getCurrentUser();

      if (!user) {
        return false;
      }

      setCurrentUser(user);
      return true;
    } catch {
      return false;
    }
  };

  const handleSessionExpired = useCallback(() => {
    setCurrentUser(null);

    if (location.pathname === "/login" || location.pathname === "/register") {
      return;
    }

    navigate("/login", {
      replace: true,
      state: { from: getSafeReturnTarget(location) }
    });
  }, [location, navigate]);

  if (isAuthLoading) {
    return (
      <main className="content" aria-busy="true">
        <p role="status">Anmeldestatus wird geprüft...</p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="content">
        <section className="page" aria-labelledby="auth-error-title">
          <h1 id="auth-error-title">Sessionprüfung fehlgeschlagen</h1>
          <p role="alert">{authError}</p>
        </section>
      </main>
    );
  }

  return (
    <div className="app-layout">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={updateAuthStatus} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route
            path="/login"
            element={
              <GuestRoute isLoggedIn={isLoggedIn}>
                <Login setIsLoggedIn={updateAuthStatus} />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute isLoggedIn={isLoggedIn}>
                <Register setIsLoggedIn={updateAuthStatus} />
              </GuestRoute>
            }
          />
          <Route path="/recipes" element={<Recipes />} />
          <Route
            path="/recipes/:id"
            element={
              <RecipeDetails
                currentUser={currentUser}
                onSessionExpired={handleSessionExpired}
              />
            }
          />

          {/* Geschützte Bereiche */}
          <Route
            path="/my-recipes"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <MyRecipes onSessionExpired={handleSessionExpired} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CreateRecipe onSessionExpired={handleSessionExpired} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <EditRecipe
                  currentUser={currentUser}
                  onSessionExpired={handleSessionExpired}
                />
              </ProtectedRoute>
            }
          />

          <Route path="/impressum" element={<Impressum />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
