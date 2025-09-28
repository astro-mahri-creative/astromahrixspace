import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, match: /^https?:\/\/.+/ },
    alt: { type: String, maxlength: 200 },
    title: { type: String, maxlength: 100 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    size: { type: Number, min: 0 },
    mimeType: { type: String },
    duration: { type: Number, min: 0 }, // for audio/video in seconds
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const externalLinksSchema = new mongoose.Schema(
  {
    youtube: { type: String, match: /^https?:\/\/(www\.)?youtube\.com\/.+/ },
    soundcloud: {
      type: String,
      match: /^https?:\/\/(www\.)?soundcloud\.com\/.+/,
    },
    spotify: { type: String, match: /^https?:\/\/(open\.)?spotify\.com\/.+/ },
    bandcamp: { type: String, match: /^https?:\/\/.+\.bandcamp\.com\/.+/ },
    vimeo: { type: String, match: /^https?:\/\/(www\.)?vimeo\.com\/.+/ },
    custom: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true, match: /^https?:\/\/.+/ },
      },
    ],
  },
  { _id: false }
);

const unlockConfigSchema = new mongoose.Schema(
  {
    requirement: {
      type: String,
      enum: ["free", "game", "purchase", "subscriber", "achievement"],
      default: "free",
    },
    gameScoreRequired: { type: Number, default: 0, min: 0 },
    subscriptionTier: {
      type: String,
      enum: ["basic", "premium", "vip"],
      sparse: true,
    },
    achievementRequired: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
    },
    productRequired: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnhancedProduct",
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

const mediaItemSchema = new mongoose.Schema(
  {
    // Core fields
    title: {
      type: String,
      required: [true, "Media title is required"],
      maxlength: [200, "Title cannot exceed 200 characters"],
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

    // Media classification
    mediaType: {
      type: String,
      required: true,
      enum: {
        values: [
          "audio",
          "video",
          "image",
          "article",
          "session",
          "playlist",
          "interview",
        ],
        message: "Invalid media type",
      },
      index: true,
    },

    category: {
      type: String,
      enum: {
        values: [
          "performance",
          "session",
          "behind-scenes",
          "analysis",
          "tutorial",
          "interview",
          "live",
          "studio",
        ],
        message: "Invalid category",
      },
      index: true,
    },

    // Content
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true,
    },

    longDescription: {
      type: String,
      maxlength: [2000, "Long description cannot exceed 2000 characters"],
      trim: true,
    },

    // Media assets
    thumbnail: {
      type: assetSchema,
      required: true,
    },

    mediaFile: assetSchema,

    // External links
    externalLinks: externalLinksSchema,

    // Relationships
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      index: true,
    },

    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EnhancedProduct",
      },
    ],

    // Series/Collection
    series: {
      name: { type: String, trim: true },
      episode: { type: Number, min: 1 },
      season: { type: Number, min: 1 },
    },

    // Technical metadata
    duration: {
      type: Number,
      min: [0, "Duration cannot be negative"],
    },

    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },

    quality: {
      audio: {
        bitrate: { type: Number, min: 0 },
        sampleRate: { type: Number, min: 0 },
        format: { type: String, enum: ["mp3", "wav", "flac", "aac", "ogg"] },
      },
      video: {
        resolution: {
          type: String,
          enum: ["480p", "720p", "1080p", "1440p", "4K"],
        },
        framerate: { type: Number, min: 1 },
        codec: { type: String },
      },
    },

    // Access control
    unlockConfig: unlockConfigSchema,

    // Taxonomy
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

    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      plays: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 }, // in seconds
      averageWatchTime: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 }, // percentage
      lastViewed: { type: Date },
    },

    // Publication
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    scheduledPublishDate: {
      type: Date,
      sparse: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Comments and engagement
    allowComments: {
      type: Boolean,
      default: true,
    },

    // Meta fields for CMS
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["draft", "scheduled", "published", "archived"],
        default: "published",
        index: true,
      },
      version: { type: Number, default: 1 },
      priority: { type: Number, default: 0, min: 0, max: 10 },
      notes: { type: String, maxlength: 500 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
mediaItemSchema.index({ mediaType: 1, category: 1, isActive: 1 });
mediaItemSchema.index({ artist: 1, publishDate: -1 });
mediaItemSchema.index({ "unlockConfig.requirement": 1 });
mediaItemSchema.index({ publishDate: -1, isFeatured: -1 });
mediaItemSchema.index({ "analytics.views": -1 });

// Text search
mediaItemSchema.index({
  title: "text",
  description: "text",
  longDescription: "text",
  tags: "text",
});

// Compound indexes
mediaItemSchema.index({ "meta.status": 1, isActive: 1, publishDate: -1 });

// Virtuals
mediaItemSchema.virtual("isPublished").get(function () {
  return (
    this.meta.status === "published" &&
    this.isActive &&
    this.publishDate <= new Date()
  );
});

mediaItemSchema.virtual("isScheduled").get(function () {
  return (
    this.meta.status === "scheduled" &&
    this.scheduledPublishDate &&
    this.scheduledPublishDate > new Date()
  );
});

mediaItemSchema.virtual("engagementRate").get(function () {
  if (this.analytics.views === 0) return 0;
  return (
    ((this.analytics.likes + this.analytics.shares) / this.analytics.views) *
    100
  );
});

mediaItemSchema.virtual("averageEngagementTime").get(function () {
  if (this.analytics.plays === 0) return 0;
  return this.analytics.totalWatchTime / this.analytics.plays;
});

// Pre-save middleware
mediaItemSchema.pre("save", function (next) {
  // Auto-generate slug
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Update version
  if (this.isModified() && !this.isNew) {
    this.meta.version += 1;
  }

  // Calculate completion rate
  if (this.duration && this.analytics.totalWatchTime) {
    this.analytics.completionRate =
      (this.analytics.averageWatchTime / this.duration) * 100;
  }

  next();
});

// Static methods
mediaItemSchema.statics.findPublished = function () {
  return this.find({
    isActive: true,
    "meta.status": "published",
    publishDate: { $lte: new Date() },
  }).populate("artist", "name slug avatar");
};

mediaItemSchema.statics.findByType = function (mediaType, options = {}) {
  const { limit = 10, skip = 0, sort = { publishDate: -1 } } = options;

  return this.find({
    mediaType,
    isActive: true,
    "meta.status": "published",
    publishDate: { $lte: new Date() },
  })
    .populate("artist", "name slug avatar")
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

mediaItemSchema.statics.findFeatured = function (limit = 5) {
  return this.find({
    isFeatured: true,
    isActive: true,
    "meta.status": "published",
    publishDate: { $lte: new Date() },
  })
    .populate("artist", "name slug avatar")
    .sort({ "meta.priority": -1, publishDate: -1 })
    .limit(limit);
};

mediaItemSchema.statics.search = function (query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    isActive: true,
    "meta.status": "published",
    publishDate: { $lte: new Date() },
    ...filters,
  };

  return this.find(searchQuery, { score: { $meta: "textScore" } })
    .populate("artist", "name slug")
    .sort({ score: { $meta: "textScore" } });
};

mediaItemSchema.statics.findTrending = function (timeframe = 7, limit = 10) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.find({
    isActive: true,
    "meta.status": "published",
    publishDate: { $gte: startDate },
  })
    .sort({ "analytics.views": -1, "analytics.plays": -1 })
    .populate("artist", "name slug avatar")
    .limit(limit);
};

// Instance methods
mediaItemSchema.methods.incrementView = function () {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

mediaItemSchema.methods.recordPlay = function (watchTime = 0) {
  this.analytics.plays += 1;
  if (watchTime > 0) {
    this.analytics.totalWatchTime += watchTime;
    this.analytics.averageWatchTime =
      this.analytics.totalWatchTime / this.analytics.plays;
  }
  return this.save();
};

mediaItemSchema.methods.incrementShare = function () {
  this.analytics.shares += 1;
  return this.save();
};

mediaItemSchema.methods.toggleLike = function (increment = true) {
  this.analytics.likes += increment ? 1 : -1;
  if (this.analytics.likes < 0) this.analytics.likes = 0;
  return this.save();
};

mediaItemSchema.methods.publish = function () {
  this.meta.status = "published";
  this.isActive = true;
  this.publishDate = new Date();
  return this.save();
};

mediaItemSchema.methods.schedule = function (publishDate) {
  this.meta.status = "scheduled";
  this.scheduledPublishDate = publishDate;
  return this.save();
};

mediaItemSchema.methods.archive = function () {
  this.meta.status = "archived";
  this.isActive = false;
  return this.save();
};

const MediaItem = mongoose.model("MediaItem", mediaItemSchema);

export default MediaItem;
