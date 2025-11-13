import { validationResult } from "express-validator";
import Recipe from "../models/Recipe.js";


// POST /recipes (auth) - Rezept anlegen
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
        const author = req.userId;
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


export const updateRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        // Rezept aus der DB holen
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: "Rezept wurde nicht gefunden!" });
        }

        // Autoren-Prüfung: nur der Ersteller darf bearbeiten
        if (recipe.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Du darfst dieses Rezept nicht bearbeiten!" });
        }

        // Felder aus dem Body holen
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

        // Felder aktualisieren (einfache Variante: wenn Wert vorhanden, dann überschreiben)
        if (title) recipe.title = title;
        if (description) recipe.description = description;
        if (image) recipe.image = image;
        if (prepTime) recipe.prepTime = prepTime;
        if (cookTime) recipe.cookTime = cookTime;
        if (servings) recipe.servings = servings;
        if (difficulty) recipe.difficulty = difficulty;
        if (ingredients) recipe.ingredients = ingredients;
        if (steps)recipe.steps = steps;

        // Änderungen speichern
        const updatedRecipe = await recipe.save();

        res.status(200).json({
            message: "Rezept wurde aktualisiert",
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Rezepts:", error);
        res.status(500).json({ message: "Interner serverfehler!" });
    }
};


export const deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ message: "Rezept wurde nicht gefunden!" });
        }

        // Autoren-Prüfung: Nur der Ersteller darf löschen
        if(recipe.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Du hast keine Berechtigung das Rezept zu löschen!" });
        }

        await recipe.deleteOne();

        res.status(200).json({ message: "Rezept wurde gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen des Rezepts!", error);
        res.status(500).json({ message: "Interner Serverfehler!"});      
    }
};