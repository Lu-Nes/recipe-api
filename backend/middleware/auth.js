import jwt from "jsonwebtoken";


const auth = (req, res, next) => {
    const token = req.cookies && req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: "Nicht autorisiert: Keine gültige Session" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Geschützte Controller benötigen die geprüfte User-ID aus der Session.
        req.userId = decoded.id;

        next();
    } catch (error) {
        // Das ungültige Cookie wird entfernt, damit es nicht bei jedem Request erneut geprüft wird.
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        });

        console.error("Ungültiges oder abgelaufenes Token:", error.message);
        return res.status(401).json({ message: "Nicht autorisiert: Keine gültige Session" });
    }
};

export default auth;
