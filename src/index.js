// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import authRoutes from "./routes/auth.js";
// import gameRoutes from "./routes/games.js";
// import playerRoutes from "./routes/player.js";
// import publicRoutes from "./routes/public.js";
// const app = express();
// const GAME_NAME = process.env.GAME_NAME || "BUBBLE BLAST ADVENTURE";
// app.use(
//   cors({
//     origin: ["http://localhost:5173"], // Replace with your frontend URL
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     credentials: true,
//   }),
// );
// app.use(express.json({ limit: "100kb" }));
// app.get("/api/health", (req, res) =>
//   res.json({ ok: true, gameName: GAME_NAME }),
// );
// app.use("/api/auth", authRoutes);
// app.use("/api/games", gameRoutes);
// app.use("/api/player", playerRoutes);
// app.use("/api", publicRoutes);
// app.use((err, req, res, next) => {
//   console.error(err.message);
//   res.status(500).json({ message: "Something went wrong. Please try again." });
// });
// const port = process.env.PORT || 5001;
// console.log(process.env.MONGODB_URI);
// if (process.env.MONGODB_URI) {
//   mongoose
//     .connect(process.env.MONGODB_URI)
//     .then(() => console.log("MongoDB connected"))
//     .catch((e) => console.error("MongoDB connection failed:", e.message));
// }
// app.listen(port, () => console.log(`${GAME_NAME} API listening on ${port}`));










import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import playerRoutes from "./routes/player.js";
import publicRoutes from "./routes/public.js";

const app = express();
const GAME_NAME = process.env.GAME_NAME || "BUBBLE BLAST ADVENTURE";



app.use(
  cors({
    origin: 'https://bubble-blast-shubham.netlify.app',
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => res.json({ ok: true, gameName: GAME_NAME }));

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/player", playerRoutes);
app.use("/api", publicRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status && err.status < 500 ? err.status : 500;
  res.status(status).json({
    message:
      status === 500
        ? "Something went wrong. Please try again."
        : "Invalid request.",
  });
});

const port = process.env.PORT || 5001;

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((e) => console.error("MongoDB connection failed:", e.message));
} else {
  console.warn("MONGODB_URI is not set.");
}

app.listen(port, () => console.log(`${GAME_NAME} API listening on ${port}`));