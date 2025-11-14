import multer from "multer";
import path from "path";
import fs from "fs";


// Ordner für Uploads (wird erstellt, falls nicht vorhanden)
const uploadsDir = "uploads";

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Speicher-Konfiguration für Multer
const storage = multer.diskStorage({
    // Zielordner für die Bilder
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },

    // Dateiname (z.B. 1731523456789-dateiname.jpg)
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const filename = Date.now() + "-" + baseName + ext;
        cb(null, filename);
    }
});

// Multer-Instanz
const upload = multer({ storage });


export default upload;