import mongoose from "mongoose";

const triggerConditionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: [
          "score_threshold",
          "games_played",
          "perfect_matches",
          "content_unlocked",
          "time_played",
          "consecutive_days",
          "social_share",
        ],
        message: "Invalid trigger condition type",
      },
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: [1, "Trigger value must be at least 1"],
    },
    gameType: {
      type: String,
      enum: ["frequency-match", "star-navigation", "circuit-building", "any"],
      sparse: true,
    },
  },
  { _id: false }
);

const rewardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["product_unlock", "discount", "badge", "points", "content_access"],
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnhancedProduct",
      sparse: true,
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      sparse: true,
    },
    points: {
      type: Number,
      min: 1,
      sparse: true,
    },
    badgeIcon: { type: String, sparse: true },
    contentAccess: [
      {
        contentType: String,
        duration: Number, // in days, null for permanent
      },
    ],
  },
  { _id: false }
);

const achievementSchema = new mongoose.Schema(
  {
    // Core fields
    name: {
      type: String,
      required: [true, "Achievement name is required"],
      unique: true,
      maxlength: [100, "Achievement name cannot exceed 100 characters"],
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Achievement description is required"],
      maxlength: [300, "Achievement description cannot exceed 300 characters"],
      trim: true,
    },

    // Visual representation
    icon: {
      type: String,
      required: [true, "Achievement icon is required"],
      maxlength: [10, "Icon should be a short emoji or symbol"],
      trim: true,
    },

    // Achievement classification
    rarity: {
      type: String,
      enum: {
        values: ["common", "rare", "epic", "legendary"],
        message: "Rarity must be one of: common, rare, epic, legendary",
      },
      default: "common",
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: ["gaming", "social", "collection", "milestone", "special"],
        message:
          "Category must be one of: gaming, social, collection, milestone, special",
      },
      default: "gaming",
      index: true,
    },

    // Trigger configuration
    triggerCondition: triggerConditionSchema,

    // Rewards
    rewards: [rewardSchema],

    // Achievement points
    points: {
      type: Number,
      required: true,
      min: [1, "Points must be at least 1"],
      max: [1000, "Points cannot exceed 1000"],
      default: 10,
    },

    // Prerequisites
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Achievement",
      },
    ],

    // Difficulty and progression
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      default: "medium",
      index: true,
    },

    isSecret: {
      type: Boolean,
      default: false,
      index: true,
    },

    isRepeatable: {
      type: Boolean,
      default: false,
    },

    // Unlock statistics
    stats: {
      totalUnlocks: { type: Number, default: 0 },
      uniqueUnlocks: { type: Number, default: 0 },
      firstUnlockedAt: { type: Date },
      lastUnlockedAt: { type: Date },
      averageTimeToUnlock: { type: Number }, // in minutes
    },

    // CMS fields
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    validFrom: {
      type: Date,
      default: Date.now,
    },

    validUntil: {
      type: Date,
      sparse: true,
    },

    // Meta fields
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "published",
        index: true,
      },
      version: { type: Number, default: 1 },
      tags: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: 50,
        },
      ],
      notes: { type: String, maxlength: 500 }, // Internal notes for admins
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
achievementSchema.index({ rarity: 1, category: 1, isActive: 1 });
achievementSchema.index({
  "triggerCondition.type": 1,
  "triggerCondition.value": 1,
});
achievementSchema.index({ points: -1, difficulty: 1 });
achievementSchema.index({ validFrom: 1, validUntil: 1 });
achievementSchema.index({ "stats.totalUnlocks": -1 });

// Text search
achievementSchema.index({
  name: "text",
  description: "text",
});

// Virtuals
achievementSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.meta.status === "published" &&
    now >= this.validFrom &&
    (!this.validUntil || now <= this.validUntil)
  );
});

achievementSchema.virtual("unlockRate").get(function () {
  // This would need to be calculated against total user base
  // For now, return a placeholder calculation
  return this.stats.uniqueUnlocks || 0;
});

achievementSchema.virtual("difficultyScore").get(function () {
  const difficultyMap = { easy: 1, medium: 2, hard: 3, expert: 4 };
  const rarityMap = { common: 1, rare: 2, epic: 3, legendary: 4 };
  return (difficultyMap[this.difficulty] || 2) + (rarityMap[this.rarity] || 1);
});

// Pre-save middleware
achievementSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.meta.version += 1;
  }
  next();
});

// Static methods
achievementSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    "meta.status": "published",
  }).select("-meta.notes");
};

achievementSchema.statics.findByCategory = function (category) {
  return this.find({
    category,
    isActive: true,
    "meta.status": "published",
  }).sort({ points: -1 });
};

achievementSchema.statics.findByRarity = function (rarity) {
  return this.find({
    rarity,
    isActive: true,
    "meta.status": "published",
  }).sort({ points: -1 });
};

achievementSchema.statics.findEligible = function (userProgress) {
  // Find achievements that user is eligible for but hasn't unlocked
  const { frequencyMatchScore, gamesPlayed, totalPlayTime } = userProgress;

  return this.find({
    isActive: true,
    "meta.status": "published",
    $or: [
      {
        "triggerCondition.type": "score_threshold",
        "triggerCondition.value": { $lte: frequencyMatchScore },
      },
      {
        "triggerCondition.type": "games_played",
        "triggerCondition.value": { $lte: gamesPlayed },
      },
      {
        "triggerCondition.type": "time_played",
        "triggerCondition.value": { $lte: Math.floor(totalPlayTime / 60) }, // Convert to minutes
      },
    ],
  }).populate("rewards.productId", "name slug");
};

achievementSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({
    isActive: true,
    "meta.status": "published",
  })
    .sort({ "stats.totalUnlocks": -1 })
    .limit(limit);
};

// Instance methods
achievementSchema.methods.recordUnlock = function (sessionId) {
  this.stats.totalUnlocks += 1;
  this.stats.lastUnlockedAt = new Date();

  if (!this.stats.firstUnlockedAt) {
    this.stats.firstUnlockedAt = new Date();
  }

  // Note: Unique unlocks would need to be calculated separately
  // by checking GameProgress collection for unique sessionIds

  return this.save();
};

achievementSchema.methods.checkEligibility = function (userProgress) {
  if (!this.isValid) return false;

  const { type, value, gameType } = this.triggerCondition;

  switch (type) {
    case "score_threshold":
      return userProgress.frequencyMatchScore >= value;
    case "games_played":
      return userProgress.gamesPlayed >= value;
    case "time_played":
      return Math.floor(userProgress.totalPlayTime / 60) >= value;
    case "perfect_matches":
      return (userProgress.perfectMatches || 0) >= value;
    default:
      return false;
  }
};

achievementSchema.methods.getRewards = function () {
  return this.rewards.filter((reward) => {
    // Filter based on validity, availability, etc.
    return true; // For now, return all rewards
  });
};

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
