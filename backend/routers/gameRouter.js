import express from "express";
import GameProgress from "../models/gameProgressModel.js";
import Product from "../models/productModel.js";

const router = express.Router();

// Helper to compare ObjectIds safely
const isObjectIdEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.equals ? id1.equals(id2) : String(id1) === String(id2);
};

// @desc    Submit frequency match game score
// @route   POST /api/game/frequency-match
// @access  Public
router.post("/frequency-match", async (req, res) => {
  try {
    const { score, sessionId, playTime = 0 } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    // Find or create game progress
    let progress = await GameProgress.findOne({ sessionId });

    if (!progress) {
      progress = new GameProgress({
        sessionId,
        frequencyMatchScore: score,
        totalPlayTime: playTime,
        gamesPlayed: 1,
        unlockedContent: [],
        achievements: [],
      });
    } else {
      // Update with best score and total play time
      progress.frequencyMatchScore = Math.max(
        progress.frequencyMatchScore,
        score
      );
      progress.totalPlayTime += playTime;
      progress.gamesPlayed += 1;
      progress.lastActive = new Date();
    }

    // Check for unlocks and achievements
    const newUnlocks = [];
    const newAchievements = [];

    // Earl content unlocks at score 150
    if (score >= 150) {
      const earlProduct = await Product.findOne({
        slug: "earl-analysis-collection",
      });
      const alreadyUnlocked = progress.unlockedContent?.some((id) =>
        isObjectIdEqual(id, earlProduct?._id)
      );
      if (earlProduct && !alreadyUnlocked) {
        progress.unlockedContent.push(earlProduct._id);
        newUnlocks.push(earlProduct);

        // Add achievement
        newAchievements.push({
          name: "Frequency Master",
          description: "Unlocked Earl's exclusive content",
          icon: "🎯",
          unlockedAt: new Date(),
        });
      }
    }

    // Additional achievements
    if (
      score >= 100 &&
      !progress.achievements.some((a) => a.name === "Cosmic Cadet")
    ) {
      newAchievements.push({
        name: "Cosmic Cadet",
        description: "Scored 100+ in Frequency Match",
        icon: "🚀",
        unlockedAt: new Date(),
      });
    }

    if (
      progress.gamesPlayed >= 5 &&
      !progress.achievements.some((a) => a.name === "Dedicated Explorer")
    ) {
      newAchievements.push({
        name: "Dedicated Explorer",
        description: "Played 5 games",
        icon: "⭐",
        unlockedAt: new Date(),
      });
    }

    // Add new achievements
    progress.achievements.push(...newAchievements);

    await progress.save();

    res.json({
      success: true,
      score,
      bestScore: progress.frequencyMatchScore,
      totalPlayTime: progress.totalPlayTime,
      gamesPlayed: progress.gamesPlayed,
      newUnlocks: newUnlocks.map((p) => ({ id: p._id, name: p.name })),
      newAchievements,
      allUnlocks: progress.unlockedContent,
      achievements: progress.achievements,
    });
  } catch (error) {
    console.error("Game score submission error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user game progress
// @route   GET /api/game/progress/:sessionId
// @access  Public
router.get("/progress/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const progress = await GameProgress.findOne({ sessionId }).populate(
      "unlockedContent",
      "name slug price image"
    );

    if (!progress) {
      return res.json({
        frequencyMatchScore: 0,
        totalPlayTime: 0,
        gamesPlayed: 0,
        unlockedContent: [],
        achievements: [],
      });
    }

    res.json({
      frequencyMatchScore: progress.frequencyMatchScore,
      totalPlayTime: progress.totalPlayTime,
      gamesPlayed: progress.gamesPlayed,
      unlockedContent: progress.unlockedContent,
      achievements: progress.achievements,
      lastActive: progress.lastActive,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Check if content is unlocked for session
// @route   GET /api/game/unlock-status/:sessionId/:productId
// @access  Public
router.get("/unlock-status/:sessionId/:productId", async (req, res) => {
  try {
    const { sessionId, productId } = req.params;

    const progress = await GameProgress.findOne({ sessionId });
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check unlock status
    let isUnlocked = false;
    let reason = "";

    if (product.unlockRequirement === "free") {
      isUnlocked = true;
      reason = "Always available";
    } else if (product.unlockRequirement === "game") {
      const unlocked = progress?.unlockedContent?.some((id) =>
        isObjectIdEqual(id, product._id)
      );
      if (unlocked) {
        isUnlocked = true;
        reason = "Unlocked through gaming";
      } else {
        reason = `Score ${
          product.gameScoreRequired || 150
        } points in Frequency Match to unlock`;
      }
    } else if (product.unlockRequirement === "purchase") {
      reason = "Available for purchase";
    }

    res.json({
      isUnlocked,
      reason,
      currentScore: progress?.frequencyMatchScore || 0,
      scoreRequired: product.gameScoreRequired || 150,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
