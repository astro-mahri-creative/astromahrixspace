import { connectDB } from "./utils/db.js";
import GameProgress from "./models/gameProgressModel.js";
import Product from "./models/productModel.js";
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from "./utils/response.js";

// Helper to compare ObjectIds safely
const isObjectIdEqual = (id1, id2) => {
  if (!id1 || !id2) return false;
  return id1.equals ? id1.equals(id2) : String(id1) === String(id2);
};

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    await connectDB();

    const { httpMethod, path, body } = event;
    const pathSegments = path.split("/").filter(Boolean);
    const apiPath = pathSegments.slice(3); // Remove '.netlify', 'functions', 'api-game'

    switch (httpMethod) {
      case "POST":
        if (apiPath[0] === "frequency-match") {
          return await submitFrequencyScore(JSON.parse(body));
        }
        break;

      case "GET":
        if (apiPath[0] === "progress" && apiPath[1]) {
          return await getGameProgress(apiPath[1]);
        }
        if (apiPath[0] === "unlock-status" && apiPath[1] && apiPath[2]) {
          return await checkUnlockStatus(apiPath[1], apiPath[2]);
        }
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Game route not found", 404);
  } catch (error) {
    console.error("Game function error:", error);
    return errorResponse(error.message);
  }
};

const submitFrequencyScore = async (data) => {
  const { score, sessionId, playTime = 0 } = data;

  if (!sessionId) {
    return errorResponse("Session ID required", 400);
  }

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
    progress.frequencyMatchScore = Math.max(
      progress.frequencyMatchScore,
      score
    );
    progress.totalPlayTime += playTime;
    progress.gamesPlayed += 1;
    progress.lastActive = new Date();
  }

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

  progress.achievements.push(...newAchievements);
  await progress.save();

  return successResponse({
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
};

const getGameProgress = async (sessionId) => {
  const progress = await GameProgress.findOne({ sessionId }).populate(
    "unlockedContent",
    "name slug price image"
  );

  if (!progress) {
    return successResponse({
      frequencyMatchScore: 0,
      totalPlayTime: 0,
      gamesPlayed: 0,
      unlockedContent: [],
      achievements: [],
    });
  }

  return successResponse({
    frequencyMatchScore: progress.frequencyMatchScore,
    totalPlayTime: progress.totalPlayTime,
    gamesPlayed: progress.gamesPlayed,
    unlockedContent: progress.unlockedContent,
    achievements: progress.achievements,
    lastActive: progress.lastActive,
  });
};

const checkUnlockStatus = async (sessionId, productId) => {
  const progress = await GameProgress.findOne({ sessionId });
  const product = await Product.findById(productId);

  if (!product) {
    return errorResponse("Product not found", 404);
  }

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

  return successResponse({
    isUnlocked,
    reason,
    currentScore: progress?.frequencyMatchScore || 0,
    scoreRequired: product.gameScoreRequired || 150,
  });
};
