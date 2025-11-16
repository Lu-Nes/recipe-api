import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./libs/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

dbConnect();

// Erlaubte Ursprünge für CORS
// - Lokales Vite-Frontend
// - Später: Deploytes Frontend aus der .env (FRONTEND_URL)
const allowedOrigins = ["http://localhost:5173"];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads")); // Bilder aus dem Uploads-Ordner statisch ausliefern
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);

// Health-Route
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "Recipe API läuft",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server läuft unter http://localhost:${PORT}`);
  console.log(`Healthcheck:  http://localhost:${PORT}/health`);
  console.log(`CORS erlaubt:  ${allowedOrigins.join(", ")}`);
});
