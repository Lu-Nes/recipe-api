import { validationResult } from "express-validator";
import { unlink } from "node:fs/promises";
import path from "node:path";
import Recipe from "../models/Recipe.js";
// import User from "../models/User.js";


const uploadsDirectory = path.resolve("uploads");


const getComparableId = value => {
    if (!value) {
        return null;
    }

    if (typeof value === "object") {
        if (value._id) {
            return String(value._id);
        }

        if (typeof value.toHexString === "function") {
            return value.toHexString();
        }

        if (value.id) {
            return String(value.id);
        }

        return null;
    }

    return String(value);
};

export const requireRecipeOwner = forbiddenMessage => async (req, res, next) => {
    try {
        // Rezept aus der DB holen
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: "Rezept wurde nicht gefunden!" });
        }

        const authorId = getComparableId(recipe.author);
        const userId = getComparableId(req.userId);

        // Autoren-Prüfung: Nur der Ersteller darf geschützte Rezeptaktionen ausführen
        if (!authorId || !userId || authorId !== userId) {
            return res.status(403).json({ message: forbiddenMessage });
        }

        req.recipe = recipe;
        next();
    } catch (error) {
        console.error("Fehler bei der Rezeptautorisierung:", error);
        return res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


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
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
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
    try {
        const recipe = req.recipe;
        const updatableFields = [
            "title",
            "description",
            "prepTime",
            "cookTime",
            "servings",
            "difficulty",
            "ingredients",
            "steps"
        ];

        // Nur ausdrücklich übermittelte fachliche Felder werden aktualisiert.
        updatableFields.forEach(field => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                recipe[field] = req.body[field];
            }
        });

        const hasRequiredContent =
            typeof recipe.title === "string" &&
            recipe.title.trim() !== "" &&
            Array.isArray(recipe.ingredients) &&
            recipe.ingredients.length > 0 &&
            recipe.ingredients.every(item => typeof item === "string" && item.trim() !== "") &&
            Array.isArray(recipe.steps) &&
            recipe.steps.length > 0 &&
            recipe.steps.every(item => typeof item === "string" && item.trim() !== "");

        if (!hasRequiredContent) {
            return res.status(400).json({
                message: "Titel, Zutaten und Zubereitungsschritte dürfen nicht leer sein"
            });
        }

        // Änderungen speichern
        const updatedRecipe = await recipe.save();

        res.status(200).json({
            message: "Rezept wurde aktualisiert",
            recipe: updatedRecipe
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: "Ungültige Rezeptdaten" });
        }

        console.error("Fehler beim Aktualisieren des Rezepts:", error);
        res.status(500).json({ message: "Interner serverfehler!" });
    }
};


export const deleteRecipe = async (req, res) => {
    try {
        const recipe = req.recipe;

        await recipe.deleteOne();

        res.status(200).json({ message: "Rezept wurde gelöscht" });
    } catch (error) {
        console.error("Fehler beim Löschen des Rezepts!", error);
        res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


// GET /recipes/my-recipes (auth) - Eigene Rezepte des eingeloggten Users
export const getMyRecipes = async (req, res) => {
    try {
        // User-ID aus dem Token
        const userId = req.userId;

        // Alle Rezepte finden, bei denen author = aktuelle User-ID
        const recipes = await Recipe.find({ author: userId })
            .sort({ createdAt: -1 })
            .populate("author", "name");   // Autor-Name wie bei getRecipes

        res.status(200).json({
            message: "Eigene Rezepte geladen",
            count: recipes.length,
            recipes
        });
    } catch (error) {
        console.error("Fehler beim Laden der eigenen Rezepte:", error);
        res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


// POST /recipes/:id/image (auth) - Bild zu einem rezept hochladen
export const uploadRecipeImage = async (req, res) => {
    try {
        const recipe = req.recipe;

        if (!req.file) {
            return res.status(400).json({ message: "Kein Bild hochgeladen!" });
        }

        // Pfad, unter dem das Bild erreichbar ist
        const imagePath = "/uploads/" + req.file.filename;
        recipe.image = imagePath;

        const updatedRecipe = await recipe.save();

        res.status(200).json({
            message: "Rezeptbild wurde aktualisiert",
            recipe: updatedRecipe
        });
    } catch (error) {
        console.error("Fehler beim Hochladen des Rezeptbildes:", error);
        res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


// DELETE /recipes/:id/image (auth) - Bild eines Rezepts entfernen
export const deleteRecipeImage = async (req, res) => {
  try {
    const recipe = req.recipe;
    const storedImagePath =
      typeof recipe.image === "string" ? recipe.image.trim() : "";

    if (!storedImagePath) {
      return res.status(400).json({ message: "Dieses Rezept hat kein Bild." });
    }

    const normalizedImagePath = storedImagePath.replace(/\\/g, "/");
    const imageFileName = path.posix.basename(normalizedImagePath);
    const expectedImagePath = `/uploads/${imageFileName}`;

    if (
      !imageFileName ||
      imageFileName === "." ||
      imageFileName === ".." ||
      normalizedImagePath !== expectedImagePath
    ) {
      return res.status(400).json({ message: "Der gespeicherte Bildpfad ist ungültig." });
    }

    const imageFilePath = path.resolve(uploadsDirectory, imageFileName);

    if (path.dirname(imageFilePath) !== uploadsDirectory) {
      return res.status(400).json({ message: "Der gespeicherte Bildpfad ist ungültig." });
    }

    try {
      await unlink(imageFilePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    recipe.image = "";
    const updatedRecipe = await recipe.save();

    res.status(200).json({
      message: "Rezeptbild wurde entfernt.",
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error("Fehler beim Entfernen des Rezeptbildes:", error);
    res.status(500).json({ message: "Interner Serverfehler!" });
  }
};
