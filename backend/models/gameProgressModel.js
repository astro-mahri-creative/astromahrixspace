import mongoose from "mongoose";

// Track achievements unlocked via games
const achievementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    unlockedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Track per-session game progress and unlocked content
const gameProgressSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    frequencyMatchScore: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }, // seconds
    gamesPlayed: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    // Products unlocked by gameplay
    unlockedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    achievements: [achievementSchema],
  },
  { timestamps: true }
);

const GameProgress = mongoose.model("GameProgress", gameProgressSchema);

export default GameProgress;
