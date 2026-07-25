import { Router } from "express";
import { body, param, query, validationResult } from "express-validator";
import { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe, getMyRecipes, uploadRecipeImage, requireRecipeOwner } from "../controllers/recipeController.js";
import requireAuth from "../middleware/auth.js";
import upload from "../middleware/upload.js";


const router = Router();

const validateRecipeId = param("id")
    .isMongoId()
    .withMessage("Ungültige Rezept-ID");

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const validationErrors = errors.array();
        return res.status(400).json({
            message: validationErrors[0].msg,
            errors: validationErrors
        });
    }

    next();
};

const validateRecipeUpdate = [
    body()
        .custom(value => value !== null && typeof value === "object" && !Array.isArray(value))
        .withMessage("Rezeptdaten müssen als Objekt übermittelt werden"),
    body("title")
        .optional()
        .isString()
        .withMessage("Titel muss ein Text sein")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Titel darf nicht leer sein"),
    body("description")
        .optional()
        .isString()
        .withMessage("Beschreibung muss ein Text sein")
        .bail()
        .trim(),
    body("prepTime")
        .optional({ values: "null" })
        .isInt({ min: 0 })
        .withMessage("prepTime muss >= 0 sein"),
    body("cookTime")
        .optional({ values: "null" })
        .isInt({ min: 0 })
        .withMessage("cookTime muss >= 0 sein"),
    body("servings")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("servings muss >= 1 sein"),
    body("difficulty")
        .optional({ values: "null" })
        .isIn(["easy", "medium", "hard"])
        .withMessage("Ungültige Schwierigkeit"),
    body("ingredients")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Zutaten dürfen nicht leer sein"),
    body("ingredients.*")
        .optional()
        .isString()
        .withMessage("Jede Zutat muss ein Text sein")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Zutaten dürfen keine leeren Einträge enthalten"),
    body("steps")
        .optional()
        .isArray({ min: 1 })
        .withMessage("Zubereitungsschritte dürfen nicht leer sein"),
    body("steps.*")
        .optional()
        .isString()
        .withMessage("Jeder Zubereitungsschritt muss ein Text sein")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Zubereitungsschritte dürfen keine leeren Einträge enthalten")
];

// POST /recipes - Rezept erstellen (nur eingeloggte Nutzer)
router.post(
    "/",
    requireAuth,
    [
        body("title")
            .isString()
            .withMessage("Titel muss ein Text sein")
            .bail()
            .trim()
            .notEmpty()
            .withMessage("Titel ist erforderlich"),
        body("description")
            .optional()
            .isString()
            .withMessage("Beschreibung muss ein Text sein")
            .bail()
            .trim(),
        body("difficulty").optional().isIn(["easy", "medium", "hard"]).withMessage("Ungültige Schwierigkeit"),
        body("prepTime").optional().isInt({ min: 0 }).withMessage("prepTime muss >= 0 sein"),
        body("cookTime").optional().isInt({ min: 0 }).withMessage("cookTime muss >= 0 sein"),
        body("servings").optional().isInt({ min: 1 }).withMessage("servings muss >= 1 sein"),
        body("ingredients")
            .isArray({ min: 1 })
            .withMessage("Zutaten dürfen nicht leer sein"),
        body("ingredients.*")
            .isString()
            .withMessage("Jede Zutat muss ein Text sein")
            .bail()
            .trim()
            .notEmpty()
            .withMessage("Zutaten dürfen keine leeren Einträge enthalten"),
        body("steps")
            .isArray({ min: 1 })
            .withMessage("Zubereitungsschritte dürfen nicht leer sein"),
        body("steps.*")
            .isString()
            .withMessage("Jeder Zubereitungsschritt muss ein Text sein")
            .bail()
            .trim()
            .notEmpty()
            .withMessage("Zubereitungsschritte dürfen keine leeren Einträge enthalten")
    ],
    createRecipe
);


// GET /recipes - Liste, optional ?search=
router
    .get(
        "/",
        [
            query("search").optional().isString().withMessage("search muss ein String sein!")
        ],
        getRecipes
    );


// GET /recipes/my-recipes - Eigene Rezepte des eingeloggten Nutzers
router
    .get("/my-recipes", requireAuth, getMyRecipes);


// POST /recipes/:id/image - Bild für ein Rezept hochladen
router
    .post(
        "/:id/image",
        requireAuth,
        validateRecipeId,
        handleValidationErrors,
        requireRecipeOwner("Du hast keine Berechtigung das Bild dieses Rezepts zu ändern!"),
        // Die Eigentümerschaft wird vor Multer geprüft, damit abgelehnte Requests keine Datei speichern.
        upload.single("image"),
        uploadRecipeImage
    );



// GET /recipes/:id - einzelnes Rezept
router
    .get(
        "/:id",
        validateRecipeId,
        handleValidationErrors,
        getRecipeById
    )

    .put(
        "/:id",
        requireAuth,
        validateRecipeId,
        handleValidationErrors,
        requireRecipeOwner("Du darfst dieses Rezept nicht bearbeiten!"),
        validateRecipeUpdate,
        handleValidationErrors,
        updateRecipe
    )

    .delete(
        "/:id",
        requireAuth,
        validateRecipeId,
        handleValidationErrors,
        requireRecipeOwner("Du hast keine Berechtigung das Rezept zu löschen!"),
        deleteRecipe
    );


export default router;
