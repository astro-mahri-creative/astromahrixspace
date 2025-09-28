import mongoose from "mongoose";

const gameProgressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous gaming
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    frequencyMatchScore: {
      type: Number,
      default: 0,
    },
    totalPlayTime: {
      type: Number,
      default: 0, // in seconds
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    unlockedContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    achievements: [
      {
        name: String,
        unlockedAt: Date,
        description: String,
        icon: String,
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
gameProgressSchema.index({ sessionId: 1 });
gameProgressSchema.index({ user: 1 });

const GameProgress = mongoose.model("GameProgress", gameProgressSchema);

export default GameProgress;
