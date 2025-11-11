import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./libs/dbConnect.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 🇩🇪 Health-Route (Livecoding nutzt kein /api im Server)
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