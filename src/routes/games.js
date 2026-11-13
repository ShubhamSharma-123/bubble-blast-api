
// import { Router } from "express";
// import mongoose from "mongoose";
// import auth from "../middleware/auth.js";
// import GameSession from "../models/GameSession.js";
// import User from "../models/User.js";

// const router = Router();

// router.use(auth);

// const MAX_LEVEL = 40;

// function isValidNumber(value, min, max) {
//   return (
//     typeof value === "number" &&
//     Number.isFinite(value) &&
//     value >= min &&
//     value <= max
//   );
// }

// // START GAME
// router.post("/start", async (req, res) => {
//   try {
//     const levelId = req.body.levelId;

//     if (!Number.isInteger(levelId) || levelId < 1 || levelId > MAX_LEVEL) {
//       return res.status(400).json({ message: "Invalid level." });
//     }

//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     if (levelId > user.currentLevel) {
//       return res.status(403).json({
//         message: "Complete previous levels first.",
//       });
//     }

//     const session = await GameSession.create({
//       userId: req.user.id,
//       levelId,
//     });

//     return res.status(201).json({
//       sessionId: session._id,
//       levelId: session.levelId,
//       startedAt: session.startedAt,
//     });
//   } catch (error) {
//     console.error("START GAME ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to start game.",
//     });
//   }
// });

// // COMPLETE GAME
// router.post("/complete", async (req, res) => {
//   try {
//     const { sessionId, score, shotsUsed, bubblesPopped, completed } =
//       req.body;

//     if (
//       !mongoose.isValidObjectId(sessionId) ||
//       !isValidNumber(score, 0, 50000) ||
//       !isValidNumber(shotsUsed, 0, 100) ||
//       !isValidNumber(bubblesPopped, 0, 500) ||
//       typeof completed !== "boolean"
//     ) {
//       return res.status(400).json({
//         message: "Invalid game result.",
//       });
//     }

//     const session = await GameSession.findOne({
//       _id: sessionId,
//       userId: req.user.id,
//       status: "active",
//     });

//     if (!session) {
//       return res.status(404).json({
//         message: "Active session not found or already submitted.",
//       });
//     }

//     const elapsed =
//       (Date.now() - session.startedAt.getTime()) / 1000;

//     if (elapsed < 2) {
//       return res.status(400).json({
//         message: "Session is too short to submit.",
//       });
//     }

//     const maxShots = Math.max(12, 25 - Math.floor((session.levelId - 1) / 4));

//     if (shotsUsed > maxShots) {
//       return res.status(400).json({
//         message: "Shot count exceeds level limits.",
//       });
//     }

//     const verifiedScore = Math.min(
//       score,
//       shotsUsed * 300 + bubblesPopped * 50
//     );

//     const stars = completed
//       ? verifiedScore >= session.levelId * 300
//         ? 3
//         : verifiedScore >= session.levelId * 150
//           ? 2
//           : 1
//       : 0;

//     // Atomic session completion prevents duplicate submissions.
//     const updatedSession = await GameSession.findOneAndUpdate(
//       {
//         _id: sessionId,
//         userId: req.user.id,
//         status: "active",
//       },
//       {
//         $set: {
//           score: verifiedScore,
//           shotsUsed,
//           bubblesPopped,
//           completed,
//           status: completed ? "completed" : "failed",
//           completedAt: new Date(),
//           stars,
//         },
//       },
//       { new: true }
//     );

//     if (!updatedSession) {
//       return res.status(409).json({
//         message: "Game session already submitted.",
//       });
//     }

//     const progressUpdate = {
//       $inc: {
//         totalScore: verifiedScore,
//         bubblesPopped,
//         totalStars: stars,
//       },
//     };

//     if (completed) {
//       progressUpdate.$max = {
//         completedLevels: session.levelId,
//         currentLevel: Math.min(MAX_LEVEL, session.levelId + 1),
//       };
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       progressUpdate,
//       { new: true, runValidators: true }
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found.",
//       });
//     }

//     return res.json({
//       success: true,
//       sessionId: updatedSession._id,
//       score: verifiedScore,
//       stars,
//       completed,
//       progress: {
//         currentLevel: user.currentLevel,
//         completedLevels: user.completedLevels,
//         totalScore: user.totalScore,
//         totalStars: user.totalStars,
//         bubblesPopped: user.bubblesPopped,
//       },
//     });
//   } catch (error) {
//     console.error("COMPLETE GAME ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to save game result.",
//     });
//   }
// });

// // GAME HISTORY
// router.get("/history", async (req, res) => {
//   try {
//     const history = await GameSession.find({
//       userId: req.user.id,
//     })
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .lean();

//     return res.json({ history });
//   } catch (error) {
//     console.error("GAME HISTORY ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to fetch game history.",
//     });
//   }
// });

// // SINGLE SESSION
// router.get("/:id", async (req, res) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return res.status(400).json({
//         message: "Invalid session ID.",
//       });
//     }

//     const session = await GameSession.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!session) {
//       return res.status(404).json({
//         message: "Session not found.",
//       });
//     }

//     return res.json({ session });
//   } catch (error) {
//     console.error("GET SESSION ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to fetch session.",
//     });
//   }
// });






// // GET USER PROGRESS
// router.get("/progress", async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select(
//       "currentLevel completedLevels totalScore totalStars bubblesPopped"
//     );

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found.",
//       });
//     }

//     return res.json({
//       progress: {
//         currentLevel: user.currentLevel,
//         completedLevels: user.completedLevels,
//         totalScore: user.totalScore,
//         totalStars: user.totalStars,
//         bubblesPopped: user.bubblesPopped,
//       },
//     });
//   } catch (error) {
//     console.error("PROGRESS ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to load progress.",
//     });
//   }
// });

// // GET USER ACHIEVEMENTS
// router.get("/achievements", async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         message: "User not found.",
//       });
//     }

//     const perfectAim = await GameSession.exists({
//       userId: req.user.id,
//       status: "completed",
//       completed: true,
//       shotsUsed: { $lte: 5 },
//     });

//     const achievements = [
//       {
//         id: "first-pop",
//         title: "First Pop",
//         description: "Pop your first bubble.",
//         icon: "🫧",
//         unlocked: user.bubblesPopped >= 1,
//         available: true,
//       },
//       {
//         id: "beginner",
//         title: "Bubble Beginner",
//         description: "Complete 5 levels.",
//         icon: "🌱",
//         unlocked: user.completedLevels >= 5,
//         available: true,
//       },
//       {
//         id: "perfect-aim",
//         title: "Perfect Aim",
//         description: "Complete a level using 5 or fewer shots.",
//         icon: "🎯",
//         unlocked: Boolean(perfectAim),
//         available: true,
//       },
//       {
//         id: "combo-master",
//         title: "Combo Master",
//         description: "Reach a x10 combo.",
//         icon: "🔥",
//         unlocked: false,
//         available: false,
//       },
//       {
//         id: "rescue-hero",
//         title: "Rescue Hero",
//         description: "Rescue 25 buddies.",
//         icon: "🐲",
//         unlocked: false,
//         available: false,
//       },
//       {
//         id: "star-collector",
//         title: "Star Collector",
//         description: "Earn 50 stars.",
//         icon: "⭐",
//         unlocked: user.totalStars >= 50,
//         available: true,
//       },
//       {
//         id: "booster-expert",
//         title: "Booster Expert",
//         description: "Use 25 boosters.",
//         icon: "💣",
//         unlocked: false,
//         available: false,
//       },
//       {
//         id: "level-master",
//         title: "Level Master",
//         description: "Complete all 40 levels.",
//         icon: "🏆",
//         unlocked: user.completedLevels >= 40,
//         available: true,
//       },
//       {
//         id: "bubble-hunter",
//         title: "Bubble Hunter",
//         description: "Pop 1,000 bubbles.",
//         icon: "💥",
//         unlocked: user.bubblesPopped >= 1000,
//         available: true,
//       },
//       {
//         id: "bubble-legend",
//         title: "Bubble Legend",
//         description: "Earn 100,000 points.",
//         icon: "👑",
//         unlocked: user.totalScore >= 100000,
//         available: true,
//       },
//     ];

//     return res.json({
//       achievements,
//       unlockedCount: achievements.filter(
//         (item) => item.unlocked
//       ).length,
//       totalAchievements: achievements.length,
//     });
//   } catch (error) {
//     console.error("ACHIEVEMENTS ERROR:", error);

//     return res.status(500).json({
//       message: "Unable to load achievements.",
//     });
//   }
// });





// export default router;













import { Router } from "express";
import mongoose from "mongoose";
import auth from "../middleware/auth.js";
import GameSession from "../models/GameSession.js";
import User from "../models/User.js";
import { MAX_LEVEL, getLevelConfig, calcStars } from "../config/levels.js";
import { formatProgress } from "../utils/progress.js";

const router = Router();
router.use(auth);

const isNum = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

/* ---------------- START GAME ---------------- */
router.post("/start", async (req, res) => {
  try {
    const levelId = req.body.levelId;

    if (!isInt(levelId, 1, MAX_LEVEL)) {
      return res.status(400).json({ message: "Invalid level." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (levelId > user.currentLevel) {
      return res
        .status(403)
        .json({ message: "Complete previous levels first." });
    }

    // purane abandoned sessions saaf karo
    await GameSession.deleteMany({
      userId: req.user.id,
      status: "active",
      startedAt: { $lt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    });

    const session = await GameSession.create({
      userId: req.user.id,
      levelId,
    });

    return res.status(201).json({
      sessionId: session._id,
      levelId: session.levelId,
      startedAt: session.startedAt,
    });
  } catch (error) {
    console.error("START GAME ERROR:", error);
    return res.status(500).json({ message: "Unable to start game." });
  }
});

/* ---------------- COMPLETE GAME ---------------- */
router.post("/complete", async (req, res) => {
  try {
    const {
      sessionId,
      score,
      shotsUsed,
      bubblesPopped,
      completed,
      maxCombo = 0,
    } = req.body;

    if (
      !mongoose.isValidObjectId(sessionId) ||
      !isNum(score, 0, 50000) ||
      !isInt(shotsUsed, 0, 100) ||
      !isInt(bubblesPopped, 0, 500) ||
      !isInt(maxCombo, 0, 100) ||
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({ message: "Invalid game result." });
    }

    const session = await GameSession.findOne({
      _id: sessionId,
      userId: req.user.id,
      status: "active",
    });

    if (!session) {
      return res.status(404).json({
        message: "Active session not found or already submitted.",
      });
    }

    const level = getLevelConfig(session.levelId);
    const elapsed = (Date.now() - session.startedAt.getTime()) / 1000;

    if (elapsed < 2 || elapsed < shotsUsed * 0.35) {
      return res
        .status(400)
        .json({ message: "Session is too short to submit." });
    }

    if (shotsUsed > level.shots) {
      return res
        .status(400)
        .json({ message: "Shot count exceeds level limits." });
    }

    if (completed && (shotsUsed < 1 || bubblesPopped < 3)) {
      return res.status(400).json({ message: "Invalid completion data." });
    }

    // score = pops/drops + combo bonus + bachi hui shots ka bonus (10/shot)
    const verifiedScore = Math.round(
      Math.min(
        score,
        bubblesPopped * 50 + Math.max(0, level.shots - shotsUsed) * 10
      )
    );

    const stars = completed ? calcStars(shotsUsed, level.shots) : 0;

    // is level ka pehle ka best star (farming rokne ke liye)
    const previousBest = await GameSession.findOne({
      userId: req.user.id,
      levelId: session.levelId,
      status: "completed",
    })
      .sort({ stars: -1 })
      .select("stars")
      .lean();
    const starDelta = Math.max(0, stars - (previousBest?.stars || 0));

    // Atomic: duplicate submit nahi ho sakta
    const updatedSession = await GameSession.findOneAndUpdate(
      { _id: sessionId, userId: req.user.id, status: "active" },
      {
        $set: {
          score: verifiedScore,
          shotsUsed,
          bubblesPopped,
          completed,
          status: completed ? "completed" : "failed",
          completedAt: new Date(),
          stars,
        },
      },
      { new: true }
    );

    if (!updatedSession) {
      return res
        .status(409)
        .json({ message: "Game session already submitted." });
    }

    const update = {
      $inc: {
        totalScore: verifiedScore,
        bubblesPopped,
        totalStars: starDelta,
      },
    };

    const maxUpdate = {};
    if (maxCombo > 0) maxUpdate.bestCombo = maxCombo;
    if (completed) {
      maxUpdate.completedLevels = session.levelId;
      maxUpdate.currentLevel = Math.min(MAX_LEVEL, session.levelId + 1);
    }
    if (Object.keys(maxUpdate).length) update.$max = maxUpdate;

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({
      success: true,
      sessionId: updatedSession._id,
      score: verifiedScore,
      stars,
      completed,
      progress: formatProgress(user),
    });
  } catch (error) {
    console.error("COMPLETE GAME ERROR:", error);
    return res.status(500).json({ message: "Unable to save game result." });
  }
});

/* ---------------- HISTORY ---------------- */
router.get("/history", async (req, res) => {
  try {
    const history = await GameSession.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return res.json({ history });
  } catch (error) {
    console.error("GAME HISTORY ERROR:", error);
    return res.status(500).json({ message: "Unable to fetch game history." });
  }
});

/* ---------------- ACHIEVEMENTS ----------------
   ⚠️ Ye route "/:id" se PEHLE hona zaroori hai, warna "/:id" isse pakad leta hai */
router.get("/achievements", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const threeStar = await GameSession.exists({
      userId: req.user.id,
      status: "completed",
      stars: 3,
    });

    const achievements = [
      {
        id: "first-pop",
        title: "First Pop",
        description: "Pop your first bubble.",
        icon: "🫧",
        unlocked: user.bubblesPopped >= 1,
        available: true,
      },
      {
        id: "beginner",
        title: "Bubble Beginner",
        description: "Complete 5 levels.",
        icon: "🌱",
        unlocked: user.completedLevels >= 5,
        available: true,
      },
      {
        id: "perfect-aim",
        title: "Perfect Aim",
        description: "Earn 3 stars on any level.",
        icon: "🎯",
        unlocked: Boolean(threeStar),
        available: true,
      },
      {
        id: "combo-master",
        title: "Combo Master",
        description: "Reach a x5 combo.",
        icon: "🔥",
        unlocked: (user.bestCombo || 0) >= 5,
        available: true,
      },
      {
        id: "rescue-hero",
        title: "Rescue Hero",
        description: "Rescue 25 buddies.",
        icon: "🐲",
        unlocked: false,
        available: false,
      },
      {
        id: "star-collector",
        title: "Star Collector",
        description: "Earn 50 stars.",
        icon: "⭐",
        unlocked: user.totalStars >= 50,
        available: true,
      },
      {
        id: "booster-expert",
        title: "Booster Expert",
        description: "Use 25 boosters.",
        icon: "💣",
        unlocked: false,
        available: false,
      },
      {
        id: "level-master",
        title: "Level Master",
        description: "Complete all 40 levels.",
        icon: "🏆",
        unlocked: user.completedLevels >= 40,
        available: true,
      },
      {
        id: "bubble-hunter",
        title: "Bubble Hunter",
        description: "Pop 1,000 bubbles.",
        icon: "💥",
        unlocked: user.bubblesPopped >= 1000,
        available: true,
      },
      {
        id: "bubble-legend",
        title: "Bubble Legend",
        description: "Earn 100,000 points.",
        icon: "👑",
        unlocked: user.totalScore >= 100000,
        available: true,
      },
    ];

    return res.json({
      achievements,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
      totalAchievements: achievements.length,
    });
  } catch (error) {
    console.error("ACHIEVEMENTS ERROR:", error);
    return res.status(500).json({ message: "Unable to load achievements." });
  }
});

/* ---------------- SINGLE SESSION (hamesha sabse last) ---------------- */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID." });
    }

    const session = await GameSession.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!session) return res.status(404).json({ message: "Session not found." });

    return res.json({ session });
  } catch (error) {
    console.error("GET SESSION ERROR:", error);
    return res.status(500).json({ message: "Unable to fetch session." });
  }
});

export default router;