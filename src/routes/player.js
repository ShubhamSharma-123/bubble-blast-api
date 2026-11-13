// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import User from "../models/User.js";
// import GameSession from "../models/GameSession.js";
// const router = Router();
// router.use(auth);
// router.get("/progress", async (req, res) => {
//   const user = await User.findById(req.user.id).select("-passwordHash");
//   if (!user) return res.status(404).json({ message: "Player not found." });
//   res.json({
//     progress: {
//       currentLevel: user.currentLevel,
//       totalScore: user.totalScore,
//       totalStars: user.totalStars,
//       bubblesPopped: user.bubblesPopped,
//       bestCombo: user.bestCombo,
//       completedLevels: user.completedLevels,
//     },
//   });
// });
// export default router;









import { Router } from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import GameSession from "../models/GameSession.js";
import { formatProgress } from "../utils/progress.js";

const router = Router();
router.use(auth);

router.get("/progress", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "Player not found." });
    res.json({ progress: formatProgress(user) });
  } catch (error) {
    console.error("PROGRESS ERROR:", error);
    res.status(500).json({ message: "Unable to load progress." });
  }
});

// Har level ka best stars / best score (Level map ke liye)
router.get("/levels", async (req, res) => {
  try {
    const rows = await GameSession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$levelId",
          stars: { $max: "$stars" },
          bestScore: { $max: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      levels: rows.map((r) => ({
        levelId: r._id,
        stars: r.stars,
        bestScore: r.bestScore,
      })),
    });
  } catch (error) {
    console.error("LEVEL STATS ERROR:", error);
    res.status(500).json({ message: "Unable to load level stats." });
  }
});

export default router;