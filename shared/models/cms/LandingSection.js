import mongoose from "mongoose";

const landingSectionSchema = new mongoose.Schema(
  {
    // Identification
    sectionId: {
      type: String,
      required: true,
      enum: {
        values: [
          "hero",
          "about",
          "media",
          "games",
          "merch",
          "contact",
          "features",
          "testimonials",
          "newsletter",
        ],
        message: "Invalid section ID",
      },
      index: true,
    },

    // Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },

    subtitle: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    content: {
      type: String, // Rich text stored as HTML
      maxlength: 5000,
    },

    // Media
    backgroundImage: {
      url: { type: String, match: /^https?:\/\/.+/ },
      alt: { type: String, maxlength: 200 },
      position: {
        type: String,
        enum: ["center", "top", "bottom", "left", "right"],
        default: "center",
      },
      overlay: {
        enabled: { type: Boolean, default: false },
        color: { type: String, default: "rgba(0,0,0,0.5)" },
        opacity: { type: Number, min: 0, max: 1, default: 0.5 },
      },
    },

    // Call-to-Action buttons
    ctaButtons: [
      {
        text: { type: String, required: true, maxlength: 50 },
        url: { type: String, required: true },
        style: {
          type: String,
          enum: ["primary", "secondary", "outline", "ghost"],
          default: "primary",
        },
        external: { type: Boolean, default: false },
        trackingId: { type: String }, // For analytics
      },
    ],

    // Featured items (references to other content)
    featuredItems: [
      {
        contentType: {
          type: String,
          enum: ["product", "media", "achievement", "artist"],
          required: true,
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "featuredItems.contentType",
          required: true,
        },
        displayOrder: { type: Number, default: 0 },
      },
    ],

    // Layout and styling
    layout: {
      template: {
        type: String,
        enum: ["default", "full-width", "sidebar", "grid", "carousel"],
        default: "default",
      },
      columns: { type: Number, min: 1, max: 6, default: 1 },
      spacing: {
        type: String,
        enum: ["tight", "normal", "loose"],
        default: "normal",
      },
    },

    styling: {
      cssClasses: { type: String, maxlength: 200 },
      customCSS: { type: String, maxlength: 1000 },
      theme: {
        type: String,
        enum: ["default", "dark", "light", "cosmic", "neon"],
        default: "default",
      },
    },

    // Display settings
    displayOrder: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      index: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Responsive settings
    responsive: {
      hideOnMobile: { type: Boolean, default: false },
      hideOnTablet: { type: Boolean, default: false },
      hideOnDesktop: { type: Boolean, default: false },
    },

    // Scheduling
    publishDate: { type: Date, default: Date.now },
    unpublishDate: { type: Date, sparse: true },

    // Analytics
    analytics: {
      views: { type: Number, default: 0 },
      interactions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
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
      notes: { type: String, maxlength: 500 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
landingSectionSchema.index({ sectionId: 1, isVisible: 1, displayOrder: 1 });
landingSectionSchema.index({ "meta.status": 1, publishDate: 1 });

const LandingSection =
  mongoose.models.LandingSection ||
  mongoose.model("LandingSection", landingSectionSchema);

export { LandingSection, landingSectionSchema };
export default LandingSection;
