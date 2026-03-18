import mongoose from "mongoose";

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

const SiteConfig =
  mongoose.models.SiteConfig ||
  mongoose.model("SiteConfig", siteConfigSchema);

export { SiteConfig, siteConfigSchema };
export default SiteConfig;
