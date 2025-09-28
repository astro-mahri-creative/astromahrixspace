import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    website: { type: String, match: /^https?:\/\/.+/ },
    twitter: { type: String, match: /^https?:\/\/(www\.)?twitter\.com\/.+/ },
    instagram: {
      type: String,
      match: /^https?:\/\/(www\.)?instagram\.com\/.+/,
    },
    soundcloud: {
      type: String,
      match: /^https?:\/\/(www\.)?soundcloud\.com\/.+/,
    },
    spotify: { type: String, match: /^https?:\/\/(open\.)?spotify\.com\/.+/ },
    youtube: { type: String, match: /^https?:\/\/(www\.)?youtube\.com\/.+/ },
  },
  { _id: false }
);

const artistSchema = new mongoose.Schema(
  {
    // Core fields
    name: {
      type: String,
      required: [true, "Artist name is required"],
      unique: true,
      maxlength: [100, "Artist name cannot exceed 100 characters"],
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

    // Content fields
    bio: {
      type: String,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
      trim: true,
    },

    // Media fields
    avatar: {
      url: { type: String, match: /^https?:\/\/.+/ },
      alt: { type: String, maxlength: 200 },
      width: { type: Number, min: 1 },
      height: { type: Number, min: 1 },
    },
    coverImage: {
      url: { type: String, match: /^https?:\/\/.+/ },
      alt: { type: String, maxlength: 200 },
      width: { type: Number, min: 1 },
      height: { type: Number, min: 1 },
    },

    // Social links
    socialLinks: socialLinksSchema,

    // Seller information (from existing model)
    seller: {
      name: { type: String, trim: true },
      logo: { type: String },
      description: { type: String, maxlength: 500 },
      rating: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
        validate: {
          validator: function (v) {
            return v === 0 || (v >= 0.1 && v <= 5);
          },
          message: "Rating must be 0 or between 0.1 and 5",
        },
      },
      numReviews: {
        type: Number,
        default: 0,
        min: [0, "Number of reviews cannot be negative"],
      },
    },

    // CMS fields
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
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
      tags: [
        {
          type: String,
          trim: true,
          lowercase: true,
          maxlength: 50,
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
artistSchema.index({ name: "text", bio: "text" }); // Full-text search
artistSchema.index({ "meta.status": 1, isActive: 1 });
artistSchema.index({ createdAt: -1 });

// Virtuals
artistSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "artist",
  count: true,
});

// Pre-save middleware
artistSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.isModified("slug")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  if (this.isModified() && !this.isNew) {
    this.meta.version += 1;
  }

  next();
});

// Static methods
artistSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    "meta.status": "published",
  }).select("-meta");
};

artistSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Instance methods
artistSchema.methods.publish = function () {
  this.meta.status = "published";
  this.isActive = true;
  return this.save();
};

artistSchema.methods.archive = function () {
  this.meta.status = "archived";
  this.isActive = false;
  return this.save();
};

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
