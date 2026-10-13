import multer from "multer";


// Speicher-Konfiguration für Multer
const storage = multer.memoryStorage();

// Multer-Instanz
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      const error = new Error("Nur JPEG-, PNG- und WebP-Bilder sind erlaubt!");
      error.code = "INVALID_FILE_TYPE";
      return cb(error);
    }

    cb(null, true);
  }
});


export default upload;
