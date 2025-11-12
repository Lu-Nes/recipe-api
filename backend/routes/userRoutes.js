import { Router } from "express";
import { body } from "express-validator";
import { register, login } from "../controllers/userController.js";


const router = Router();

// Registrierung
router
    .post("/register",
        [
            body("name").trim().notEmpty().withMessage("Name ist erforderlich!"),
            body("email").trim().isEmail().withMessage("Gültige E-Mail ist erforderlich!"),
            body("password").isLength({ min: 8 }).withMessage("Das Passwort muss aus mindestens 8 Zeichen bestehen!")
        ],
        register
    )
    .post("/login",
        [
            body("email").trim().isEmail().withMessage("Gültige E-Mail ist erforderlich"),
            body("password").notEmpty().withMessage("Passwort ist erforderlich")
        ],
        login
    );

    export default router;
