import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, "Review comment cannot exceed 1000 characters"],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const assetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, match: /^https?:\/\/.+/ },
    alt: { type: String, maxlength: 200 },
    title: { type: String, maxlength: 100 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    size: { type: Number, min: 0 }, // File size in bytes
    mimeType: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const digitalFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, match: /^https?:\/\/.+/ },
    size: { type: Number, min: 0 },
    format: { type: String, trim: true },
    quality: { type: String, enum: ["low", "medium", "high", "lossless"] },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const pricingSchema = new mongoose.Schema(
  {
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, default: "USD", enum: ["USD", "EUR", "GBP"] },
    isOnSale: { type: Boolean, default: false },
    saleStartDate: { type: Date },
    saleEndDate: { type: Date },
  },
  { _id: false }
);

const unlockConfigSchema = new mongoose.Schema(
  {
    requirement: {
      type: String,
      enum: ["free", "game", "purchase", "subscription", "achievement"],
      default: "purchase",
      required: true,
    },
    gameScoreRequired: {
      type: Number,
      default: 0,
      min: [0, "Game score cannot be negative"],
      max: [1000, "Game score cannot exceed 1000"],
    },
    achievementRequired: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
    },
    subscriptionTier: {
      type: String,
      enum: ["basic", "premium", "vip"],
      sparse: true,
    },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String, trim: true, lowercase: true }],
    canonicalUrl: { type: String, match: /^https?:\/\/.+/ },
  },
  { _id: false }
);

const enhancedProductSchema = new mongoose.Schema(
  {
    // Core commerce fields (enhanced)
    name: {
      type: String,
      required: [true, "Product name is required"],
      unique: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ],
      index: true,
    },

    // Enhanced relationships
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Artist is required"],
      index: true,
    },

    // Enhanced media
    image: assetSchema,
    gallery: [assetSchema],

    // Enhanced categorization
    category: {
      type: String,
      required: true,
      enum: {
        values: [
          "Music",
          "Exclusive Content",
          "Merch",
          "Digital Downloads",
          "Games",
          "Experiences",
        ],
        message:
          "Category must be one of: Music, Exclusive Content, Merch, Digital Downloads, Games, Experiences",
      },
      index: true,
    },
    contentType: {
      type: String,
      enum: {
        values: ["music", "content", "merch", "game", "experience"],
        message:
          "Content type must be one of: music, content, merch, game, experience",
      },
      default: "content",
      index: true,
    },

    // Enhanced content fields
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },
    longDescription: {
      type: String,
      maxlength: [2000, "Long description cannot exceed 2000 characters"],
      trim: true,
    },
    features: [
      {
        type: String,
        maxlength: [200, "Feature description cannot exceed 200 characters"],
        trim: true,
      },
    ],

    // Enhanced pricing
    pricing: pricingSchema,

    // Inventory
    inventory: {
      countInStock: {
        type: Number,
        required: true,
        min: [0, "Stock count cannot be negative"],
      },
      trackInventory: { type: Boolean, default: true },
      allowBackorder: { type: Boolean, default: false },
      lowStockThreshold: { type: Number, default: 5, min: 0 },
    },

    // Enhanced ratings and reviews
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Number of reviews cannot be negative"],
    },
    reviews: [reviewSchema],

    // Enhanced gaming/unlock system
    unlockConfig: unlockConfigSchema,

    // Media and streaming
    streamUrl: {
      type: String,
      match: [/^https?:\/\/.+/, "Stream URL must be a valid URL"],
      sparse: true,
    },
    digitalFiles: [digitalFileSchema],

    // Enhanced taxonomy
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 50,
        index: true,
      },
    ],

    // SEO
    seo: seoSchema,

    // CMS fields
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      lastViewed: { type: Date },
    },

    // Meta fields for CMS
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
      priority: {
        type: Number,
        default: 0,
        min: [0, "Priority cannot be negative"],
        max: [10, "Priority cannot exceed 10"],
      },
      featured: { type: Boolean, default: false, index: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
enhancedProductSchema.index({ category: 1, "meta.status": 1, isActive: 1 });
enhancedProductSchema.index({ artist: 1, publishDate: -1 });
enhancedProductSchema.index({ "pricing.basePrice": 1, "pricing.salePrice": 1 });
enhancedProductSchema.index({
  "unlockConfig.requirement": 1,
  "unlockConfig.gameScoreRequired": 1,
});
enhancedProductSchema.index({ rating: -1, numReviews: -1 });
enhancedProductSchema.index({ publishDate: -1, "meta.priority": -1 });

// Text search index
enhancedProductSchema.index({
  name: "text",
  description: "text",
  longDescription: "text",
  tags: "text",
});

// Virtuals
enhancedProductSchema.virtual("currentPrice").get(function () {
  if (this.pricing.isOnSale && this.pricing.salePrice) {
    const now = new Date();
    const saleValid =
      (!this.pricing.saleStartDate || now >= this.pricing.saleStartDate) &&
      (!this.pricing.saleEndDate || now <= this.pricing.saleEndDate);

    if (saleValid) {
      return this.pricing.salePrice;
    }
  }
  return this.pricing.basePrice;
});

enhancedProductSchema.virtual("isOnSale").get(function () {
  return this.pricing.isOnSale && this.currentPrice < this.pricing.basePrice;
});

enhancedProductSchema.virtual("isInStock").get(function () {
  return (
    !this.inventory.trackInventory ||
    this.inventory.countInStock > 0 ||
    this.inventory.allowBackorder
  );
});

enhancedProductSchema.virtual("isLowStock").get(function () {
  return (
    this.inventory.trackInventory &&
    this.inventory.countInStock <= this.inventory.lowStockThreshold &&
    this.inventory.countInStock > 0
  );
});

// Pre-save middleware
enhancedProductSchema.pre("save", function (next) {
  // Auto-generate slug from name if not provided
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Update version on modification
  if (this.isModified() && !this.isNew) {
    this.meta.version += 1;
  }

  // Calculate conversion rate
  if (this.analytics.views > 0) {
    this.analytics.conversionRate =
      (this.analytics.purchases / this.analytics.views) * 100;
  }

  next();
});

// Static methods
enhancedProductSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    "meta.status": "published",
  }).populate("artist", "name slug avatar");
};

enhancedProductSchema.statics.findFeatured = function () {
  return this.find({
    isActive: true,
    "meta.status": "published",
    "meta.featured": true,
  }).sort({ "meta.priority": -1, publishDate: -1 });
};

enhancedProductSchema.statics.search = function (query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    "meta.status": "published",
    ...filters,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .populate("artist", "name slug")
    .sort({ score: { $meta: "textScore" } });
};

enhancedProductSchema.statics.findByCategory = function (
  category,
  options = {}
) {
  const {
    limit = 10,
    skip = 0,
    sort = { publishDate: -1 },
    populate = true,
  } = options;

  let query = this.find({
    category,
    isActive: true,
    "meta.status": "published",
  })
    .limit(limit)
    .skip(skip)
    .sort(sort);

  if (populate) {
    query = query.populate("artist", "name slug avatar");
  }

  return query;
};

enhancedProductSchema.statics.findUnlockableByScore = function (score) {
  return this.find({
    "unlockConfig.requirement": "game",
    "unlockConfig.gameScoreRequired": { $lte: score },
    isActive: true,
    "meta.status": "published",
  }).populate("artist", "name slug");
};

// Instance methods
enhancedProductSchema.methods.incrementView = function () {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

enhancedProductSchema.methods.addReview = function (userId, reviewData) {
  this.reviews.push({
    user: userId,
    ...reviewData,
  });

  // Recalculate rating
  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.rating = totalRating / this.reviews.length;
  this.numReviews = this.reviews.length;

  return this.save();
};

enhancedProductSchema.methods.publish = function () {
  this.meta.status = "published";
  this.isActive = true;
  this.publishDate = new Date();
  return this.save();
};

enhancedProductSchema.methods.archive = function () {
  this.meta.status = "archived";
  this.isActive = false;
  return this.save();
};

const EnhancedProduct = mongoose.model(
  "EnhancedProduct",
  enhancedProductSchema
);

export default EnhancedProduct;
