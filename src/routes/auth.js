// import { Router } from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";
// import auth from "../middleware/auth.js";
// const router = Router();
// const publicUser = (u) => ({
//   id: u._id,
//   name: u.name,
//   email: u.email,
//   currentLevel: u.currentLevel,
//   totalScore: u.totalScore,
//   totalStars: u.totalStars,
//   bubblesPopped: u.bubblesPopped,
//   completedLevels: u.completedLevels,
// });
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password || password.length < 8)
//       return res
//         .status(400)
//         .json({
//           message:
//             "Name, valid email and password (8+ characters) are required.",
//         });
//     if (await User.findOne({ email: email.toLowerCase() }))
//       return res
//         .status(409)
//         .json({ message: "An account with this email already exists." });
//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       passwordHash: await bcrypt.hash(password, 12),
//     });
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.status(201).json({ token, user: publicUser(user) });
//   } catch (e) {
//     res.status(500).json({ message: "Could not create account." });
//   }
// });
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email: (email || "").toLowerCase() });
//     if (!user || !(await bcrypt.compare(password || "", user.passwordHash)))
//       return res
//         .status(401)
//         .json({ message: "Email or password is incorrect." });
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });
//     res.json({ token, user: publicUser(user) });
//   } catch {
//     res.status(500).json({ message: "Could not log in." });
//   }
// });
// router.get("/me", auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "Player not found." });
//   res.json({ user: publicUser(user) });
// });
// router.post("/logout", (req, res) =>
//   res.json({ message: "Logged out. Remove the token from the client." }),
// );
// export default router;










import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  currentLevel: u.currentLevel,
  totalScore: u.totalScore,
  totalStars: u.totalStars,
  bubblesPopped: u.bubblesPopped,
  completedLevels: u.completedLevels,
});

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const str = (v) => (typeof v === "string" ? v.trim() : "");

router.post("/register", async (req, res) => {
  try {
    const name = str(req.body.name);
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2 || name.length > 40) {
      return res.status(400).json({ message: "Name must be 2-40 characters." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    if (e?.code === 11000) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }
    console.error("REGISTER ERROR:", e);
    res.status(500).json({ message: "Could not create account." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === "string" ? req.body.password : "";

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({ message: "Could not log in." });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Player not found." });
    res.json({ user: publicUser(user) });
  } catch (e) {
    console.error("ME ERROR:", e);
    res.status(500).json({ message: "Could not load profile." });
  }
});

router.post("/logout", (req, res) =>
  res.json({ message: "Logged out. Remove the token from the client." })
);

export default router;