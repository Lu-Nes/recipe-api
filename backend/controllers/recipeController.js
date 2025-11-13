import { validationResult } from "express-validator";
import Recipe from "../models/Recipe.js";


// POST /recipe (auth) - Rezept anlegen
export const createRecipe = async (req, res) => {
    const errors = validationResult(req);
    // Validierungfehler aus den Routerregeln einsammeln
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    //body-Felder auslesen
    const {
        title,
        description,
        image,
        prepTime,
        cookTime,
        servings,
        difficulty,
        ingredients,
        steps
    } = req.body;

    try {
        const author = req.user?.id;
        if (!author)
            return res.status(401).json({ message: "Nicht autorisiert!" });

        const recipe = await Recipe.create({
            title,
            description,
            author,
            image: image || "",
            prepTime: Number(prepTime) || 0,
            cookTime: Number(cookTime) || 0,
            servings: Number(servings) || 1,
            difficulty: difficulty || "easy",
            ingredients: Array.isArray(ingredients) ? ingredients : [],
            steps: Array.isArray(steps) ? steps : []
        });

        res.status(201).json({ message: "Rezept erstellt", recipe });
    } catch (error) {
        console.error("Fehler beim Erstellen des Rezepts:", error);
        res.status(500).json({ message: "Interner Serverfehler" });
    }
};


// GET /recipes (public) - Liste mit optionaler suche (?search=...)
export const getRecipes = async (req, res) => {
    try {
        const { search } = req.query;

        // Einfache Textsuche über Titel & Beschreibung
        const filter = search
            ? {
                $or: [
                    { title: {$regex: search, $options: "i" } },
                    { description: {$regex: search, $options: "i" 
                    } }
                ]
            }
            : {};

            const recipes = await Recipe.find(filter)
                .sort({ createdAt: -1 })
                .populate("author", "name");           // Nur den Namen des Autors anzeigen

        res.status(200).json({ recipes, count: recipes.length });
    } catch (error) {
        console.error("Fehler beim Laden der Rezepte:", error);
        res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


// GET /recipes/:id (public) - einzelnes Rezept
export const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate("author", "name");
        if (!recipe)
            return res.status(404).json({ message: "Rezept nicht gefunden" });

        res.status(200).json({ recipe });
    } catch (error) {
        console.error("Fehler beim Laden des Rezepts:", error);
        res.status(500).json({ message: "Interner Serverfehler!" });
    }
};