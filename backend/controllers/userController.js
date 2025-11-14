import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ message: "E-Mail ist bereits registriert!" });

        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashed });
        const { password: _, ...safeUser } = user.toObject();

        return res.status(201).json({
            message: "Registrierung erfolgreich",
            user: safeUser
        });
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
        return res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Ungültige Zugangsdaten!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Ungültige Zugangsdaten!" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie("token", token, {httpOnly: true, sameSite: "none", secure: true });
        return res.status(200).json({ message: "Login erfolgreich" });
    } catch (error) {
        console.error("Fehler beim Login:", error);
        return res.status(500).json({ message: "Interner Serverfehler!" });
    }
};


export const getProfile = async (req, res) => {
    // re.userId kommt aus der auth-Middleware
    try {
        const user = await User.findById(req.userId).select("-password")    // gibt alle Felder unter der User-Id zurück, außer das Passwort
        if (!user) {
            return res.status(404).json({ message: "User nicht gefunden!" });
        }

        return res.status(200).json({ message: "Profil geladen", user });
    } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        return res.status(500).json({ message: "Interner Serverfehler" });
    }
};