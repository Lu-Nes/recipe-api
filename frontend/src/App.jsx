import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Recipes from './pages/Recipes';
import RecipeDetails from './pages/RecipeDetails';
import MyRecipes from './pages/MyRecipes';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Impressum from './pages/Impressum';

function App() {
  return (
    <div className="app-layout">
      <Header />
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeDetails />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/create" element={<CreateRecipe />} />
          <Route path="/edit/:id" element={<EditRecipe />} />
          <Route path="/impressum" element={<Impressum />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
