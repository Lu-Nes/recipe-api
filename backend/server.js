import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./libs/dbConnect.js";
import userRoutes from "./routes/userRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";


const app = express();
const PORT = process.env.PORT || 3000;

dbConnect();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));             // Bilder aus dem Uploads-Ordner statisch ausliefern
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
  console.log(`CORS erlaubt:  ${process.env.FRONTEND_URL}`);
});