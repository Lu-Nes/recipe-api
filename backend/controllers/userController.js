import User from "../models/User.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";


export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ msg: "E-Mail ist bereits registriert!" });

        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashed });
        const { password: _, ...safeUser } = user.toObject();

        return res.status(201).json({
            msg: "Registrierung erfolgreich",
            user : safeUser
        });
    } catch (error) {
        console.error("Fehler bei der registrierung:", error);
        return res.status(500).json({ msg: "Interner Serverfehler!" });
    }
};