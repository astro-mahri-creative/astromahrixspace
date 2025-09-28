import mongoose from "mongoose";

// Site Configuration Model
const siteConfigSchema = new mongoose.Schema(
  {
    // Core site info
    siteName: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },

    siteDescription: {
      type: String,
      maxlength: 300,
      trim: true,
    },

    siteUrl: {
      type: String,
      match: /^https?:\/\/.+/,
    },

    // Branding
    logo: {
      url: { type: String, match: /^https?:\/\/.+/ },
      alt: { type: String, maxlength: 100 },
    },

    favicon: {
      url: { type: String, match: /^https?:\/\/.+/ },
      sizes: { type: String },
    },

    // Social links
    socialLinks: {
      twitter: { type: String, match: /^https?:\/\/(www\.)?twitter\.com\/.+/ },
      instagram: {
        type: String,
        match: /^https?:\/\/(www\.)?instagram\.com\/.+/,
      },
      youtube: { type: String, match: /^https?:\/\/(www\.)?youtube\.com\/.+/ },
      soundcloud: {
        type: String,
        match: /^https?:\/\/(www\.)?soundcloud\.com\/.+/,
      },
      spotify: { type: String, match: /^https?:\/\/(open\.)?spotify\.com\/.+/ },
      bandcamp: { type: String, match: /^https?:\/\/.+\.bandcamp\.com\/.+/ },
      discord: { type: String, match: /^https?:\/\/discord\.gg\/.+/ },
    },

    // Contact information
    contactInfo: {
      email: { type: String, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      phone: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: "US" },
      },
    },

    // Game settings
    gameSettings: {
      defaultGameDuration: { type: Number, default: 30, min: 10, max: 300 },
      globalUnlockThreshold: { type: Number, default: 150, min: 0 },
      achievementPointsMultiplier: {
        type: Number,
        default: 1,
        min: 0.1,
        max: 10,
      },
      leaderboardEnabled: { type: Boolean, default: true },
      anonymousPlayEnabled: { type: Boolean, default: true },
    },

    // E-commerce settings
    commerceSettings: {
      currency: { type: String, default: "USD", enum: ["USD", "EUR", "GBP"] },
      taxRate: { type: Number, default: 0, min: 0, max: 1 },
      shippingEnabled: { type: Boolean, default: true },
      digitalDownloadsEnabled: { type: Boolean, default: true },
      inventoryTracking: { type: Boolean, default: true },
    },

    // Payment settings (stored references, not sensitive data)
    paymentSettings: {
      stripeEnabled: { type: Boolean, default: true },
      paypalEnabled: { type: Boolean, default: true },
      cryptoEnabled: { type: Boolean, default: false },
      testMode: { type: Boolean, default: true },
    },

    // SEO settings
    seo: {
      defaultTitle: { type: String, maxlength: 60 },
      defaultDescription: { type: String, maxlength: 160 },
      defaultKeywords: [{ type: String, trim: true, lowercase: true }],
      googleAnalyticsId: { type: String },
      googleTagManagerId: { type: String },
      facebookPixelId: { type: String },
    },

    // Feature flags
    features: {
      blogEnabled: { type: Boolean, default: false },
      podcastEnabled: { type: Boolean, default: false },
      eventsEnabled: { type: Boolean, default: false },
      membershipEnabled: { type: Boolean, default: false },
      newsletterEnabled: { type: Boolean, default: true },
    },

    // Maintenance
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: { type: String, maxlength: 500 },
      allowedIPs: [{ type: String }],
      scheduledStart: { type: Date },
      scheduledEnd: { type: Date },
    },

    // API settings
    apiSettings: {
      rateLimit: { type: Number, default: 100 }, // requests per minute
      cacheTTL: { type: Number, default: 300 }, // seconds
      enableCors: { type: Boolean, default: true },
      allowedOrigins: [{ type: String }],
    },
  },
  {
    timestamps: true,
    collection: "site_config",
  }
);

// Landing Section Model for dynamic page building
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

// Navigation Menu Model
const navigationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true,
    },

    location: {
      type: String,
      enum: ["header", "footer", "sidebar", "mobile"],
      required: true,
      index: true,
    },

    items: [
      {
        label: { type: String, required: true, maxlength: 50 },
        url: { type: String, required: true },
        external: { type: Boolean, default: false },
        openNewTab: { type: Boolean, default: false },
        icon: { type: String },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },

        // Nested menu support
        children: [
          {
            label: { type: String, required: true, maxlength: 50 },
            url: { type: String, required: true },
            external: { type: Boolean, default: false },
            openNewTab: { type: Boolean, default: false },
            icon: { type: String },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true },
          },
        ],

        // Access control
        requiresAuth: { type: Boolean, default: false },
        allowedRoles: [{ type: String, enum: ["admin", "seller", "user"] }],
      },
    ],

    isActive: { type: Boolean, default: true },

    meta: {
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      version: { type: Number, default: 1 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
landingSectionSchema.index({ sectionId: 1, isVisible: 1, displayOrder: 1 });
landingSectionSchema.index({ "meta.status": 1, publishDate: 1 });
navigationSchema.index({ location: 1, isActive: 1 });

// Create models
const SiteConfig = mongoose.model("SiteConfig", siteConfigSchema);
const LandingSection = mongoose.model("LandingSection", landingSectionSchema);
const Navigation = mongoose.model("Navigation", navigationSchema);

// Export models
export { SiteConfig, LandingSection, Navigation };

// Also export a combined CMS object for convenience
export const CMS = {
  SiteConfig,
  LandingSection,
  Navigation,
};

export default CMS;
