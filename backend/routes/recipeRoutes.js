import { Router } from "express";
import { body, param, query } from "express-validator";
import { createRecipe, getRecipes, getRecipeById } from "../controllers/recipeController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

// POST /recipes - Rezept erstellen (nur eingeloggte Nutzer)
router.post(
    "/",
    requireAuth,
    [
        body("title").trim().notEmpty().withMessage("Titel ist erforderlich"),
        body("description").trim().notEmpty().withMessage("Beschreibung ist erforderlich"),
        body("difficulty").optional().isIn(["easy", "medium", "hard"]).withMessage("Ungültige Schwierigkeit"),
        body("prepTime").optional().isInt({ min: 0 }).withMessage("prepTime muss >= 0 sein"),
        body("cookTime").optional().isInt({ min: 0 }).withMessage("cookTime muss >= 0 sein"),
        body("servings").optional().isInt({ min: 1 }).withMessage("servings muss >= 1 sein"),
        body("ingredients").optional().isArray().withMessage("ingredients muss ein Array sein"),
        body("steps").optional().isArray().withMessage("steps muss ein Array sein")
    ],
    createRecipe
);

// GET /recipes - Liste, optional ?search=
router.get(
    "/",
    [
        query("search").optional().isString().withMessage("search muss ein String sein!")
    ],
    getRecipes
);

// GET /recipes/:id - einzelnes Rezept
router.get(
    "/:id",
    [
        param("id").isMongoId().withMessage("Ungültige ID!")
    ],
    getRecipeById
);

export default router;
