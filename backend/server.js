import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(cors({
    origin: FRONTEND_URL,        // Frontend-URL aus .env
    credentials: true            // erlaubt Cookies über CORS
}));

app.use(express.json());       // JSON-Body parsen
app.use(cookieParser());       // Cookies lesen/schreiben


// 🩺 Health-Check (einfach zum Testen)
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Recipe API läuft",
    time: new Date().toISOString(),
  });
});


app.listen(PORT, () => {
    console.log(`Server lauscht auf Port ${PORT}`)
});