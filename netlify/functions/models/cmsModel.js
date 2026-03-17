import mongoose from "mongoose";

// Site Configuration Model
const siteConfigSchema = new mongoose.Schema(
  {
    siteName: { type: String, required: true, maxlength: 100, trim: true },
    siteDescription: { type: String, maxlength: 300, trim: true },
    siteUrl: { type: String },
    logo: {
      url: { type: String },
      alt: { type: String, maxlength: 100 },
    },
    favicon: {
      url: { type: String },
      sizes: { type: String },
    },
    socialLinks: {
      twitter: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      soundcloud: { type: String },
      spotify: { type: String },
      bandcamp: { type: String },
      discord: { type: String },
    },
    contactInfo: {
      email: { type: String },
      phone: { type: String },
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: { type: String, default: "US" },
      },
    },
    gameSettings: {
      defaultGameDuration: { type: Number, default: 30 },
      globalUnlockThreshold: { type: Number, default: 150 },
      achievementPointsMultiplier: { type: Number, default: 1 },
      leaderboardEnabled: { type: Boolean, default: true },
      anonymousPlayEnabled: { type: Boolean, default: true },
    },
    commerceSettings: {
      currency: { type: String, default: "USD" },
      taxRate: { type: Number, default: 0 },
      shippingEnabled: { type: Boolean, default: true },
      digitalDownloadsEnabled: { type: Boolean, default: true },
    },
    paymentSettings: {
      stripeEnabled: { type: Boolean, default: true },
      paypalEnabled: { type: Boolean, default: true },
      testMode: { type: Boolean, default: true },
    },
    features: {
      blogEnabled: { type: Boolean, default: false },
      newsletterEnabled: { type: Boolean, default: true },
    },
    maintenanceMode: {
      enabled: { type: Boolean, default: false },
      message: { type: String, maxlength: 500 },
    },
  },
  { timestamps: true, collection: "site_config" }
);

// Navigation Menu Model
const navigationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100, trim: true },
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
  { timestamps: true }
);

navigationSchema.index({ location: 1, isActive: 1 });

const SiteConfig =
  mongoose.models.SiteConfig ||
  mongoose.model("SiteConfig", siteConfigSchema);
const Navigation =
  mongoose.models.Navigation ||
  mongoose.model("Navigation", navigationSchema);

export { SiteConfig, Navigation };
export default { SiteConfig, Navigation };
