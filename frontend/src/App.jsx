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

function App() {
  // Login-Status für die gesamte App
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Beim ersten Laden prüfen, ob im localStorage schon ein Login-Status vorhanden ist
  useEffect(() => {
    const storedStatus = localStorage.getItem("isLoggedIn");
    if (storedStatus === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Kleine Schutz-Komponente: blockiert Zugriff, wenn User nicht eingeloggt ist
  function ProtectedRoute({ children }) {
    // Wenn der User nicht eingeloggt ist, zeigen wir das Login-Formular
    if (!isLoggedIn) {
      return <Login setIsLoggedIn={setIsLoggedIn} />;
    }

    // Wenn eingeloggt, dann geschützten Inhalt anzeigen
    return children;
  }

  return (
    <div className="app-layout">
      {/* Header bekommt Login-Status und Setter */}
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Login bekommt setIsLoggedIn als Prop, damit der Header nach erfolgreichem Login umschalten kann */}
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />

          {/* Geschützte Bereiche */}
          <Route
            path="/my-recipes"
            element={
              <ProtectedRoute>
                <MyRecipes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
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
