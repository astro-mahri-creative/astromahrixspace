import mongoose from "mongoose";

// ============================================================================
// ARTIST MODEL
// ============================================================================
const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, maxlength: 100, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    bio: { type: String, maxlength: 1000, trim: true },
    avatar: {
      url: { type: String },
      alt: { type: String, maxlength: 200 },
      width: { type: Number },
      height: { type: Number },
    },
    coverImage: {
      url: { type: String },
      alt: { type: String, maxlength: 200 },
      width: { type: Number },
      height: { type: Number },
    },
    socialLinks: {
      website: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      soundcloud: { type: String },
      spotify: { type: String },
      youtube: { type: String },
    },
    seller: {
      name: { type: String, trim: true },
      logo: { type: String },
      description: { type: String, maxlength: 500 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      numReviews: { type: Number, default: 0, min: 0 },
    },
    isActive: { type: Boolean, default: true, index: true },
    publishDate: { type: Date, default: Date.now },
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
      version: { type: Number, default: 1 },
      tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

artistSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }
  if (this.isModified() && !this.isNew) { this.meta.version += 1; }
  next();
});

// ============================================================================
// ENHANCED PRODUCT MODEL
// ============================================================================
const assetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, maxlength: 200 },
    title: { type: String, maxlength: 100 },
    width: { type: Number },
    height: { type: Number },
    size: { type: Number },
    mimeType: { type: String },
    duration: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const enhancedProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, maxlength: 200, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
    image: assetSchema,
    gallery: [assetSchema],
    category: {
      type: String, required: true,
      enum: ["Music", "Exclusive Content", "Merch", "Digital Downloads", "Games", "Experiences"],
      index: true,
    },
    contentType: { type: String, enum: ["music", "content", "merch", "game", "experience"], default: "content", index: true },
    description: { type: String, required: true, maxlength: 500, trim: true },
    longDescription: { type: String, maxlength: 2000, trim: true },
    features: [{ type: String, maxlength: 200, trim: true }],
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      salePrice: { type: Number, min: 0 },
      currency: { type: String, default: "USD", enum: ["USD", "EUR", "GBP"] },
      isOnSale: { type: Boolean, default: false },
      saleStartDate: { type: Date },
      saleEndDate: { type: Date },
    },
    inventory: {
      countInStock: { type: Number, required: true, min: 0 },
      trackInventory: { type: Boolean, default: true },
      allowBackorder: { type: Boolean, default: false },
      lowStockThreshold: { type: Number, default: 5, min: 0 },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    unlockConfig: {
      requirement: { type: String, enum: ["free", "game", "purchase", "subscription", "achievement"], default: "purchase" },
      gameScoreRequired: { type: Number, default: 0, min: 0, max: 1000 },
    },
    streamUrl: { type: String },
    digitalFiles: [{
      name: { type: String, required: true, trim: true },
      url: { type: String, required: true },
      size: { type: Number },
      format: { type: String, trim: true },
      quality: { type: String, enum: ["low", "medium", "high", "lossless"] },
    }],
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 50, index: true }],
    seo: {
      title: { type: String, maxlength: 60 },
      description: { type: String, maxlength: 160 },
      keywords: [{ type: String, trim: true, lowercase: true }],
    },
    isActive: { type: Boolean, default: true, index: true },
    publishDate: { type: Date, default: Date.now, index: true },
    analytics: {
      views: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      lastViewed: { type: Date },
    },
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },
      version: { type: Number, default: 1 },
      priority: { type: Number, default: 0, min: 0, max: 10 },
      featured: { type: Boolean, default: false, index: true },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

enhancedProductSchema.virtual("currentPrice").get(function () {
  if (!this.pricing) return 0;
  if (this.pricing.isOnSale && this.pricing.salePrice) {
    const now = new Date();
    const saleValid =
      (!this.pricing.saleStartDate || now >= this.pricing.saleStartDate) &&
      (!this.pricing.saleEndDate || now <= this.pricing.saleEndDate);
    if (saleValid) return this.pricing.salePrice;
  }
  return this.pricing.basePrice;
});

enhancedProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }
  if (this.isModified() && !this.isNew) { this.meta.version += 1; }
  next();
});

// ============================================================================
// MEDIA ITEM MODEL
// ============================================================================
const mediaItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    mediaType: {
      type: String, required: true,
      enum: ["audio", "video", "image", "article", "session", "playlist", "interview"],
      index: true,
    },
    category: {
      type: String,
      enum: ["performance", "session", "behind-scenes", "analysis", "tutorial", "interview", "live", "studio"],
      index: true,
    },
    description: { type: String, maxlength: 500, trim: true },
    longDescription: { type: String, maxlength: 2000, trim: true },
    thumbnail: assetSchema,
    mediaFile: assetSchema,
    externalLinks: {
      youtube: { type: String },
      soundcloud: { type: String },
      spotify: { type: String },
      bandcamp: { type: String },
      vimeo: { type: String },
      custom: [{ name: { type: String }, url: { type: String } }],
    },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", index: true },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "EnhancedProduct" }],
    series: { name: { type: String }, episode: { type: Number }, season: { type: Number } },
    duration: { type: Number, min: 0 },
    fileSize: { type: Number, min: 0 },
    quality: {
      audio: { bitrate: { type: Number }, sampleRate: { type: Number }, format: { type: String, enum: ["mp3", "wav", "flac", "aac", "ogg"] } },
      video: { resolution: { type: String, enum: ["480p", "720p", "1080p", "1440p", "4K"] }, framerate: { type: Number }, codec: { type: String } },
    },
    unlockConfig: {
      requirement: { type: String, enum: ["free", "game", "purchase", "subscriber", "achievement"], default: "free" },
      gameScoreRequired: { type: Number, default: 0, min: 0 },
    },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 50, index: true }],
    seo: {
      title: { type: String, maxlength: 60 },
      description: { type: String, maxlength: 160 },
      keywords: [{ type: String, trim: true, lowercase: true }],
    },
    analytics: {
      views: { type: Number, default: 0 },
      plays: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      totalWatchTime: { type: Number, default: 0 },
      averageWatchTime: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      lastViewed: { type: Date },
    },
    publishDate: { type: Date, default: Date.now, index: true },
    scheduledPublishDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    allowComments: { type: Boolean, default: true },
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["draft", "scheduled", "published", "archived"], default: "published", index: true },
      version: { type: Number, default: 1 },
      priority: { type: Number, default: 0, min: 0, max: 10 },
      notes: { type: String, maxlength: 500 },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

mediaItemSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.isModified("slug")) {
    this.slug = this.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }
  if (this.isModified() && !this.isNew) { this.meta.version += 1; }
  next();
});

// ============================================================================
// ACHIEVEMENT MODEL (lightweight for counts)
// ============================================================================
const achievementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ============================================================================
// LANDING SECTION MODEL
// ============================================================================
const landingSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

// ============================================================================
// EXPORTS (serverless-safe with model caching)
// ============================================================================
const Artist = mongoose.models.Artist || mongoose.model("Artist", artistSchema);
const EnhancedProduct = mongoose.models.EnhancedProduct || mongoose.model("EnhancedProduct", enhancedProductSchema);
const MediaItem = mongoose.models.MediaItem || mongoose.model("MediaItem", mediaItemSchema);
const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
const LandingSection = mongoose.models.LandingSection || mongoose.model("LandingSection", landingSectionSchema);

export { Artist, EnhancedProduct, MediaItem, Achievement, LandingSection };
