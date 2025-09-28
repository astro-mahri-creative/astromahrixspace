#!/usr/bin/env node

/**
 * MongoDB CMS Migration Script
 * Run this script to migrate from legacy models to enhanced CMS models
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { CMSMigration } from "../backend/utils/cmsMigration.js";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost/astromahrixspace";

async function main() {
  console.log("🚀 MongoDB CMS Migration Tool");
  console.log("================================\n");

  try {
    // Connect to MongoDB
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB\n");

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || "full";

    switch (command) {
      case "full":
      case "migrate":
        console.log("🔄 Running full CMS migration...\n");
        await CMSMigration.runFullMigration();
        await CMSMigration.createIndexes();
        await CMSMigration.validateMigration();
        break;

      case "artists":
        console.log("🎨 Migrating artists only...\n");
        await CMSMigration.migrateUsersToArtists();
        break;

      case "products":
        console.log("📦 Migrating products only...\n");
        await CMSMigration.migrateProductsToEnhanced();
        break;

      case "achievements":
        console.log("🏆 Creating achievements only...\n");
        await CMSMigration.createDefaultAchievements();
        break;

      case "media":
        console.log("🎬 Creating media items only...\n");
        await CMSMigration.createDefaultMediaItems();
        break;

      case "config":
        console.log("⚙️ Creating site configuration only...\n");
        await CMSMigration.createSiteConfiguration();
        break;

      case "sections":
        console.log("📄 Creating landing sections only...\n");
        await CMSMigration.createLandingSections();
        break;

      case "indexes":
        console.log("🔍 Creating performance indexes only...\n");
        await CMSMigration.createIndexes();
        break;

      case "validate":
        console.log("🔍 Validating migration integrity only...\n");
        const isValid = await CMSMigration.validateMigration();
        process.exit(isValid ? 0 : 1);
        break;

      case "status":
        console.log("📊 Checking migration status...\n");
        await showMigrationStatus();
        break;

      default:
        console.log("❌ Unknown command:", command);
        console.log("\nAvailable commands:");
        console.log("  full, migrate   - Run complete migration (default)");
        console.log("  artists         - Migrate users to artists only");
        console.log(
          "  products        - Migrate products to enhanced model only"
        );
        console.log("  achievements    - Create default achievements only");
        console.log("  media           - Create default media items only");
        console.log("  config          - Create site configuration only");
        console.log("  sections        - Create landing sections only");
        console.log("  indexes         - Create performance indexes only");
        console.log("  validate        - Validate migration integrity only");
        console.log("  status          - Check migration status");
        process.exit(1);
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    if (process.env.NODE_ENV !== "production") {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
  }
}

async function showMigrationStatus() {
  const { default: Artist } = await import(
    "../backend/models/contentModels/ArtistModel.js"
  );
  const { default: EnhancedProduct } = await import(
    "../backend/models/contentModels/EnhancedProductModel.js"
  );
  const { default: Achievement } = await import(
    "../backend/models/contentModels/AchievementModel.js"
  );
  const { default: MediaItem } = await import(
    "../backend/models/contentModels/MediaItemModel.js"
  );
  const { CMS } = await import("../backend/models/contentModels/CMSModel.js");

  // Legacy models
  const { default: Product } = await import(
    "../backend/models/productModel.js"
  );
  const { default: User } = await import("../backend/models/userModel.js");

  const [
    // Legacy counts
    legacyProducts,
    legacySellers,

    // New CMS counts
    artists,
    enhancedProducts,
    achievements,
    mediaItems,
    siteConfigs,
    landingSections,
  ] = await Promise.all([
    Product.countDocuments(),
    User.countDocuments({ isSeller: true }),

    Artist.countDocuments(),
    EnhancedProduct.countDocuments(),
    Achievement.countDocuments(),
    MediaItem.countDocuments(),
    CMS.SiteConfig.countDocuments(),
    CMS.LandingSection.countDocuments(),
  ]);

  console.log("Legacy Models:");
  console.log(`  Products: ${legacyProducts}`);
  console.log(`  Sellers: ${legacySellers}`);
  console.log("\nCMS Models:");
  console.log(`  Artists: ${artists}`);
  console.log(`  Enhanced Products: ${enhancedProducts}`);
  console.log(`  Achievements: ${achievements}`);
  console.log(`  Media Items: ${mediaItems}`);
  console.log(`  Site Configs: ${siteConfigs}`);
  console.log(`  Landing Sections: ${landingSections}`);

  console.log("\nMigration Status:");
  console.log(
    `  Artists Migration: ${
      artists >= legacySellers ? "✅ Complete" : "⚠️ Incomplete"
    }`
  );
  console.log(
    `  Products Migration: ${
      enhancedProducts >= legacyProducts ? "✅ Complete" : "⚠️ Incomplete"
    }`
  );
  console.log(
    `  CMS Setup: ${
      siteConfigs > 0 && landingSections > 0 ? "✅ Complete" : "⚠️ Incomplete"
    }`
  );
  console.log(
    `  Content Creation: ${
      achievements > 0 && mediaItems > 0 ? "✅ Complete" : "⚠️ Incomplete"
    }`
  );
}

// Run the migration
main();
