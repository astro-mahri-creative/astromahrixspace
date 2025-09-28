import mongoose from "mongoose";

/**
 * MongoDB CMS Migration and Setup Utilities
 * Provides tools to migrate from existing models to enhanced CMS models
 */

import Artist from "../models/contentModels/ArtistModel.js";
import EnhancedProduct from "../models/contentModels/EnhancedProductModel.js";
import Achievement from "../models/contentModels/AchievementModel.js";
import MediaItem from "../models/contentModels/MediaItemModel.js";
import { CMS } from "../models/contentModels/CMSModel.js";

// Legacy models (existing)
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import GameProgress from "../models/gameProgressModel.js";

export class CMSMigration {
  /**
   * Migrate existing User sellers to new Artist model
   */
  static async migrateUsersToArtists() {
    console.log("🎨 Migrating sellers to artists...");

    const sellers = await User.find({
      isSeller: true,
      "seller.name": { $exists: true },
    });

    const artistPromises = sellers.map(async (seller) => {
      const existingArtist = await Artist.findOne({
        $or: [
          { name: seller.seller.name },
          { slug: seller.seller.name.toLowerCase().replace(/\s+/g, "-") },
        ],
      });

      if (existingArtist) {
        console.log(`Artist ${seller.seller.name} already exists, skipping...`);
        return existingArtist;
      }

      const artist = new Artist({
        name: seller.seller.name,
        bio:
          seller.seller.description ||
          "Artist and creator on Astro Mahri Space",
        avatar: {
          url: seller.seller.logo || "/images/default-avatar.jpg",
          alt: `${seller.seller.name} avatar`,
        },
        seller: {
          name: seller.seller.name,
          logo: seller.seller.logo,
          description: seller.seller.description,
          rating: seller.seller.rating || 0,
          numReviews: seller.seller.numReviews || 0,
        },
        meta: {
          createdBy: seller._id,
          status: "published",
        },
      });

      const savedArtist = await artist.save();
      console.log(`✅ Created artist: ${artist.name}`);
      return savedArtist;
    });

    const artists = await Promise.all(artistPromises);
    console.log(`🎨 Migrated ${artists.length} artists`);
    return artists;
  }

  /**
   * Migrate existing Products to EnhancedProduct model
   */
  static async migrateProductsToEnhanced() {
    console.log("📦 Migrating products to enhanced model...");

    const products = await Product.find().populate("seller");

    const productPromises = products.map(async (product) => {
      // Find corresponding artist
      let artist = null;
      if (
        product.seller &&
        product.seller.seller &&
        product.seller.seller.name
      ) {
        artist = await Artist.findOne({ name: product.seller.seller.name });
      }

      if (!artist) {
        // Create a default artist if none found
        artist = await Artist.findOne({ name: "Astro Mahri" });
        if (!artist) {
          artist = new Artist({
            name: "Astro Mahri",
            bio: "Primary artist and creator",
            meta: { status: "published" },
          });
          await artist.save();
        }
      }

      const existingEnhanced = await EnhancedProduct.findOne({
        $or: [{ name: product.name }, { slug: product.slug }],
      });

      if (existingEnhanced) {
        console.log(
          `Product ${product.name} already exists in enhanced model, skipping...`
        );
        return existingEnhanced;
      }

      const enhancedProduct = new EnhancedProduct({
        name: product.name,
        slug: product.slug,
        artist: artist._id,
        image: {
          url: product.image,
          alt: `${product.name} image`,
        },
        category: product.category,
        description: product.description,
        longDescription: product.longDescription,
        features: product.features || [],
        pricing: {
          basePrice: product.price,
          currency: "USD",
        },
        inventory: {
          countInStock: product.countInStock,
          trackInventory: true,
        },
        rating: product.rating || 0,
        numReviews: product.numReviews || 0,
        reviews: product.reviews || [],
        unlockConfig: {
          requirement: product.unlockRequirement || "purchase",
          gameScoreRequired: product.gameScoreRequired || 0,
        },
        streamUrl: product.streamUrl,
        contentType: product.contentType || "content",
        tags: product.tags || [],
        meta: {
          status: "published",
          featured: false,
        },
      });

      const savedProduct = await enhancedProduct.save();
      console.log(`✅ Migrated product: ${product.name}`);
      return savedProduct;
    });

    const enhancedProducts = await Promise.all(productPromises);
    console.log(`📦 Migrated ${enhancedProducts.length} products`);
    return enhancedProducts;
  }

  /**
   * Create achievements based on existing game mechanics
   */
  static async createDefaultAchievements() {
    console.log("🏆 Creating default achievements...");

    const defaultAchievements = [
      {
        name: "Cosmic Cadet",
        description: "Score 100+ points in Frequency Match",
        icon: "🚀",
        category: "gaming",
        rarity: "common",
        triggerCondition: {
          type: "score_threshold",
          value: 100,
          gameType: "frequency-match",
        },
        points: 50,
        difficulty: "easy",
      },
      {
        name: "Frequency Master",
        description: "Score 150+ points and unlock exclusive content",
        icon: "🎯",
        category: "gaming",
        rarity: "rare",
        triggerCondition: {
          type: "score_threshold",
          value: 150,
          gameType: "frequency-match",
        },
        points: 100,
        difficulty: "medium",
        rewards: [
          {
            type: "content_access",
            contentAccess: [{ contentType: "exclusive", duration: null }],
          },
        ],
      },
      {
        name: "Dedicated Explorer",
        description: "Play 5 or more games",
        icon: "⭐",
        category: "gaming",
        rarity: "common",
        triggerCondition: {
          type: "games_played",
          value: 5,
          gameType: "any",
        },
        points: 75,
        difficulty: "easy",
      },
      {
        name: "Perfect Pitch",
        description: "Achieve 3 perfect frequency matches",
        icon: "🎵",
        category: "gaming",
        rarity: "epic",
        triggerCondition: {
          type: "perfect_matches",
          value: 3,
          gameType: "frequency-match",
        },
        points: 200,
        difficulty: "hard",
      },
      {
        name: "Time Traveler",
        description: "Play for 30+ minutes total",
        icon: "⏰",
        category: "gaming",
        rarity: "rare",
        triggerCondition: {
          type: "time_played",
          value: 30,
          gameType: "any",
        },
        points: 150,
        difficulty: "medium",
      },
    ];

    const achievementPromises = defaultAchievements.map(async (achData) => {
      const existing = await Achievement.findOne({ name: achData.name });
      if (existing) {
        console.log(`Achievement ${achData.name} already exists, skipping...`);
        return existing;
      }

      const achievement = new Achievement({
        ...achData,
        meta: { status: "published" },
      });

      const saved = await achievement.save();
      console.log(`✅ Created achievement: ${achData.name}`);
      return saved;
    });

    const achievements = await Promise.all(achievementPromises);
    console.log(`🏆 Created ${achievements.length} achievements`);
    return achievements;
  }

  /**
   * Create default media items for existing content
   */
  static async createDefaultMediaItems() {
    console.log("🎬 Creating default media items...");

    const astroArtist = await Artist.findOne({ name: "Astro Mahri" });
    if (!astroArtist) {
      throw new Error(
        "Astro Mahri artist not found. Run artist migration first."
      );
    }

    const defaultMedia = [
      {
        title: "Session 01: Analog Synth Drift",
        mediaType: "video",
        category: "session",
        description: "Analog synth drift with pixel bloom visuals.",
        thumbnail: {
          url: "/images/p1.jpg",
          alt: "Session 01 thumbnail",
        },
        artist: astroArtist._id,
        tags: ["synth", "analog", "visual", "session"],
        unlockConfig: { requirement: "free" },
      },
      {
        title: "Session 02: Live Loop Performance",
        mediaType: "video",
        category: "performance",
        description: "Live loop performance from the Neon Atrium.",
        thumbnail: {
          url: "/images/p2.jpg",
          alt: "Session 02 thumbnail",
        },
        artist: astroArtist._id,
        tags: ["live", "loop", "performance", "neon"],
        unlockConfig: { requirement: "free" },
      },
      {
        title: "Session 03: Glitch Sketches",
        mediaType: "video",
        category: "behind-scenes",
        description: "Glitch sketches and process notes.",
        thumbnail: {
          url: "/images/p3.jpg",
          alt: "Session 03 thumbnail",
        },
        artist: astroArtist._id,
        tags: ["glitch", "process", "sketches", "experimental"],
        unlockConfig: { requirement: "free" },
      },
    ];

    const mediaPromises = defaultMedia.map(async (mediaData) => {
      const existing = await MediaItem.findOne({ title: mediaData.title });
      if (existing) {
        console.log(
          `Media item ${mediaData.title} already exists, skipping...`
        );
        return existing;
      }

      const mediaItem = new MediaItem({
        ...mediaData,
        meta: { status: "published" },
      });

      const saved = await mediaItem.save();
      console.log(`✅ Created media item: ${mediaData.title}`);
      return saved;
    });

    const mediaItems = await Promise.all(mediaPromises);
    console.log(`🎬 Created ${mediaItems.length} media items`);
    return mediaItems;
  }

  /**
   * Create default site configuration
   */
  static async createSiteConfiguration() {
    console.log("⚙️ Creating site configuration...");

    const existing = await CMS.SiteConfig.findOne();
    if (existing) {
      console.log("Site configuration already exists, skipping...");
      return existing;
    }

    const siteConfig = new CMS.SiteConfig({
      siteName: "ASTRO MAHRI.SPACE",
      siteDescription:
        "Retro-futuristic media, games, and gear from a neon-lit future.",
      siteUrl: "https://astromahri.space",
      logo: {
        url: "/images/logo2.png",
        alt: "Astro Mahri Logo",
      },
      socialLinks: {
        soundcloud: "https://soundcloud.com/astromahri",
        twitter: "https://twitter.com/astromahri",
        instagram: "https://instagram.com/astromahri",
      },
      contactInfo: {
        email: "hello@astromahri.space",
      },
      gameSettings: {
        defaultGameDuration: 30,
        globalUnlockThreshold: 150,
        achievementPointsMultiplier: 1,
        leaderboardEnabled: true,
        anonymousPlayEnabled: true,
      },
      commerceSettings: {
        currency: "USD",
        taxRate: 0,
        shippingEnabled: true,
        digitalDownloadsEnabled: true,
        inventoryTracking: true,
      },
      features: {
        blogEnabled: false,
        podcastEnabled: false,
        eventsEnabled: false,
        membershipEnabled: false,
        newsletterEnabled: true,
      },
    });

    const saved = await siteConfig.save();
    console.log("✅ Created site configuration");
    return saved;
  }

  /**
   * Create default landing sections
   */
  static async createLandingSections() {
    console.log("📄 Creating landing sections...");

    const sections = [
      {
        sectionId: "hero",
        title: "ASTRO MAHRI.SPACE",
        subtitle:
          "Retro-futuristic media, games, and gear from a neon-lit future.",
        displayOrder: 1,
        ctaButtons: [
          { text: "Explore Media", url: "/#media", style: "primary" },
          { text: "Shop Merch", url: "/#merch", style: "secondary" },
        ],
      },
      {
        sectionId: "about",
        title: "About the Mission",
        subtitle:
          "Creating cosmic experiences through music, games, and small-batch gear.",
        displayOrder: 2,
      },
      {
        sectionId: "media",
        title: "Media + Content",
        subtitle: "Audio sessions, performance clips, and behind-the-scenes.",
        displayOrder: 3,
      },
      {
        sectionId: "games",
        title: "Game Library",
        subtitle:
          "Micro-games and experiments. Unlock achievements, compare scores, and discover secrets.",
        displayOrder: 4,
      },
      {
        sectionId: "merch",
        title: "Featured Merch",
        subtitle: "Retro-futuristic gear and accessories.",
        displayOrder: 5,
      },
      {
        sectionId: "contact",
        title: "Get In Touch",
        subtitle: "Reach out for collaborations, ideas, and feedback.",
        displayOrder: 6,
      },
    ];

    const sectionPromises = sections.map(async (sectionData) => {
      const existing = await CMS.LandingSection.findOne({
        sectionId: sectionData.sectionId,
      });
      if (existing) {
        console.log(
          `Section ${sectionData.sectionId} already exists, skipping...`
        );
        return existing;
      }

      const section = new CMS.LandingSection({
        ...sectionData,
        meta: { status: "published" },
      });

      const saved = await section.save();
      console.log(`✅ Created section: ${sectionData.sectionId}`);
      return saved;
    });

    const landingSections = await Promise.all(sectionPromises);
    console.log(`📄 Created ${landingSections.length} landing sections`);
    return landingSections;
  }

  /**
   * Run complete migration
   */
  static async runFullMigration() {
    console.log("🚀 Starting MongoDB CMS migration...\n");

    try {
      // Step 1: Migrate users to artists
      await this.migrateUsersToArtists();

      // Step 2: Migrate products to enhanced products
      await this.migrateProductsToEnhanced();

      // Step 3: Create default achievements
      await this.createDefaultAchievements();

      // Step 4: Create default media items
      await this.createDefaultMediaItems();

      // Step 5: Create site configuration
      await this.createSiteConfiguration();

      // Step 6: Create landing sections
      await this.createLandingSections();

      console.log("\n✅ MongoDB CMS migration completed successfully!");

      // Print summary
      const counts = await Promise.all([
        Artist.countDocuments(),
        EnhancedProduct.countDocuments(),
        Achievement.countDocuments(),
        MediaItem.countDocuments(),
        CMS.SiteConfig.countDocuments(),
        CMS.LandingSection.countDocuments(),
      ]);

      console.log("\n📊 Migration Summary:");
      console.log(`Artists: ${counts[0]}`);
      console.log(`Products: ${counts[1]}`);
      console.log(`Achievements: ${counts[2]}`);
      console.log(`Media Items: ${counts[3]}`);
      console.log(`Site Configs: ${counts[4]}`);
      console.log(`Landing Sections: ${counts[5]}`);
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  /**
   * Create indexes for performance optimization
   */
  static async createIndexes() {
    console.log("🔍 Creating performance indexes...");

    // Text search indexes
    await Artist.collection.createIndex({ name: "text", bio: "text" });
    await EnhancedProduct.collection.createIndex({
      name: "text",
      description: "text",
      longDescription: "text",
      tags: "text",
    });
    await MediaItem.collection.createIndex({
      title: "text",
      description: "text",
      tags: "text",
    });
    await Achievement.collection.createIndex({
      name: "text",
      description: "text",
    });

    // Performance indexes
    await EnhancedProduct.collection.createIndex({
      category: 1,
      "meta.status": 1,
      isActive: 1,
    });
    await MediaItem.collection.createIndex({
      mediaType: 1,
      "meta.status": 1,
      isActive: 1,
    });
    await Achievement.collection.createIndex({
      rarity: 1,
      "triggerCondition.type": 1,
    });

    console.log("✅ Performance indexes created");
  }

  /**
   * Validate migration integrity
   */
  static async validateMigration() {
    console.log("🔍 Validating migration integrity...");

    const issues = [];

    // Check for products without artists
    const productsWithoutArtists = await EnhancedProduct.countDocuments({
      artist: { $exists: false },
    });
    if (productsWithoutArtists > 0) {
      issues.push(
        `${productsWithoutArtists} products missing artist references`
      );
    }

    // Check for duplicate slugs
    const duplicateProductSlugs = await EnhancedProduct.aggregate([
      { $group: { _id: "$slug", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);
    if (duplicateProductSlugs.length > 0) {
      issues.push(
        `${duplicateProductSlugs.length} duplicate product slugs found`
      );
    }

    // Check for achievements without valid triggers
    const invalidAchievements = await Achievement.countDocuments({
      "triggerCondition.type": { $exists: false },
    });
    if (invalidAchievements > 0) {
      issues.push(
        `${invalidAchievements} achievements missing trigger conditions`
      );
    }

    if (issues.length === 0) {
      console.log("✅ Migration validation passed - no issues found");
      return true;
    } else {
      console.log("⚠️ Migration validation found issues:");
      issues.forEach((issue) => console.log(`  - ${issue}`));
      return false;
    }
  }
}

export default CMSMigration;
