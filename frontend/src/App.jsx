import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
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

function ProtectedRoute({ children, isLoggedIn, setIsLoggedIn }) {
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return children;
}

function App() {
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
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={updateAuthStatus} />}
          />
          <Route
            path="/register"
            element={<Register setIsLoggedIn={updateAuthStatus} />}
          />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Geschützte Bereiche */}
          <Route
            path="/my-recipes"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={updateAuthStatus}
              >
                <MyRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={updateAuthStatus}
              >
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={updateAuthStatus}
              >
                <EditRecipe />
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
