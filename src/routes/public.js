// import { Router } from "express";
// import User from "../models/User.js";
// import GameSession from "../models/GameSession.js";
// import auth from "../middleware/auth.js";
// const router = Router();
// router.get("/levels", (req, res) =>
//   res.json({
//     levels: Array.from({ length: 40 }, (_, i) => ({
//       id: i + 1,
//       difficulty:
//         i < 5
//           ? "Tutorial"
//           : i < 10
//             ? "Beginner"
//             : i < 20
//               ? "Easy"
//               : i < 30
//                 ? "Medium"
//                 : i < 35
//                   ? "Hard"
//                   : "Expert",
//       shots: Math.max(12, 25 - Math.floor(i / 4)),
//       targetScore: 300 + i * 150,
//     })),
//   }),
// );
// router.get("/levels/:id", (req, res) => {
//   const id = Number(req.params.id);
//   if (!Number.isInteger(id) || id < 1 || id > 40)
//     return res.status(404).json({ message: "Level not found." });
//   res.json({
//     level: {
//       id,
//       difficulty:
//         id <= 5
//           ? "Tutorial"
//           : id <= 10
//             ? "Beginner"
//             : id <= 20
//               ? "Easy"
//               : id <= 30
//                 ? "Medium"
//                 : id <= 35
//                   ? "Hard"
//                   : "Expert",
//       shots: Math.max(12, 25 - Math.floor((id - 1) / 4)),
//       targetScore: 300 + (id - 1) * 150,
//     },
//   });
// });
// router.get("/leaderboard", async (req, res) => {
//   const leaderboard = await User.find()
//     .sort({ totalScore: -1 })
//     .limit(100)
//     .select("name totalScore totalStars currentLevel completedLevels");
//   res.json({ leaderboard });
// });
// router.get("/leaderboard/me", auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   const rank =
//     (await User.countDocuments({ totalScore: { $gt: user.totalScore } })) + 1;
//   res.json({ rank, totalScore: user.totalScore });
// });
// const achievements = [
//   ["First Pop", "Pop your first bubble"],
//   ["Bubble Beginner", "Complete 5 levels"],
//   ["Perfect Aim", "Finish efficiently"],
//   ["Combo Master", "Reach a x10 combo"],
//   ["Rescue Hero", "Rescue 25 buddies"],
//   ["Star Collector", "Earn 50 stars"],
//   ["Booster Expert", "Use 25 boosters"],
//   ["Level Master", "Complete 40 levels"],
//   ["Bubble Hunter", "Pop 1,000 bubbles"],
//   ["Bubble Legend", "Earn 100,000 points"],
// ];
// router.get("/achievements", (req, res) =>
//   res.json({
//     achievements: achievements.map(([name, description], i) => ({
//       id: i + 1,
//       name,
//       description,
//     })),
//   }),
// );
// router.get("/achievements/me", auth, async (req, res) => {
//   const user = await User.findById(req.user.id);
//   const unlocked = achievements.map(([name, description], i) => ({
//     id: i + 1,
//     name,
//     description,
//     unlocked:
//       i === 0
//         ? user.bubblesPopped > 0
//         : i === 1
//           ? user.completedLevels >= 5
//           : i === 5
//             ? user.totalStars >= 50
//             : i === 7
//               ? user.completedLevels >= 40
//               : i === 8
//                 ? user.bubblesPopped >= 1000
//                 : i === 9
//                   ? user.totalScore >= 100000
//                   : false,
//   }));
//   res.json({ achievements: unlocked });
// });
// export default router;









import { Router } from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { MAX_LEVEL, getLevelConfig } from "../config/levels.js";

const router = Router();

router.get("/levels", (req, res) =>
  res.json({
    levels: Array.from({ length: MAX_LEVEL }, (_, i) => getLevelConfig(i + 1)),
  })
);

router.get("/levels/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1 || id > MAX_LEVEL) {
    return res.status(404).json({ message: "Level not found." });
  }
  res.json({ level: getLevelConfig(id) });
});

router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ totalScore: -1 })
      .limit(100)
      .select("name totalScore totalStars currentLevel completedLevels")
      .lean();
    res.json({ leaderboard });
  } catch (error) {
    console.error("LEADERBOARD ERROR:", error);
    res.status(500).json({ message: "Unable to load leaderboard." });
  }
});

router.get("/leaderboard/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Player not found." });
    const rank =
      (await User.countDocuments({ totalScore: { $gt: user.totalScore } })) + 1;
    res.json({ rank, totalScore: user.totalScore });
  } catch (error) {
    console.error("RANK ERROR:", error);
    res.status(500).json({ message: "Unable to load rank." });
  }
});

export default router;