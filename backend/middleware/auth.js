import jwt from "jsonwebtoken";


const auth = (req, res, next) => {
    //Cookie "token" auslesen
    const token = req.cookies && req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: "Nicht autorisiert: Kein Token gefunden! "});
    }

    try {
        // Token prüfen (Signatur und Ablauf)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User-ID aus dem Token in die Request legen (für Controller nutzbar)
        req.userId = decoded.id;

        next();
    } catch (error) {
        console.error("Ungültiges, oder abgelaufenes Token:", error.message);
        return res.status(401).json({ message: "Nicht autorisiert: Ungültiges Token" });
    }
};

export default auth;