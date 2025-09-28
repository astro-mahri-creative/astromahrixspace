import express from "express";
import expressAsyncHandler from "express-async-handler";
import Artist from "../models/contentModels/ArtistModel.js";
import EnhancedProduct from "../models/contentModels/EnhancedProductModel.js";
import MediaItem from "../models/contentModels/MediaItemModel.js";
import Achievement from "../models/contentModels/AchievementModel.js";
import { CMS } from "../models/contentModels/CMSModel.js";
import { isAdmin, isAuth } from "../utils.js";

const cmsRouter = express.Router();

// ============================================================================
// CONTENT MANAGEMENT ENDPOINTS
// ============================================================================

// Get all content types and their counts
cmsRouter.get(
  "/dashboard",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const stats = await Promise.all([
      Artist.countDocuments({ isActive: true }),
      EnhancedProduct.countDocuments({ isActive: true }),
      MediaItem.countDocuments({ isActive: true }),
      Achievement.countDocuments({ isActive: true }),
      CMS.LandingSection.countDocuments({ isVisible: true }),
    ]);

    const recentActivity = await Promise.all([
      Artist.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("name updatedAt meta.status"),
      EnhancedProduct.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("name updatedAt meta.status"),
      MediaItem.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .select("title updatedAt meta.status"),
    ]);

    res.json({
      stats: {
        artists: stats[0],
        products: stats[1],
        media: stats[2],
        achievements: stats[3],
        sections: stats[4],
      },
      recentActivity: {
        artists: recentActivity[0],
        products: recentActivity[1],
        media: recentActivity[2],
      },
    });
  })
);

// ============================================================================
// ARTISTS MANAGEMENT
// ============================================================================

// Get all artists with pagination and filtering
cmsRouter.get(
  "/artists",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || "all";
    const search = req.query.search || "";

    let query = {};
    if (status !== "all") {
      query["meta.status"] = status;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const artists = await Artist.find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("meta.createdBy meta.updatedBy", "name email");

    const total = await Artist.countDocuments(query);

    res.json({
      artists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  })
);

// Create new artist
cmsRouter.post(
  "/artists",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const artistData = {
      ...req.body,
      "meta.createdBy": req.user._id,
      "meta.updatedBy": req.user._id,
    };

    const artist = new Artist(artistData);
    const savedArtist = await artist.save();

    res.status(201).json({
      message: "Artist created successfully",
      artist: savedArtist,
    });
  })
);

// Get single artist
cmsRouter.get(
  "/artists/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id).populate(
      "meta.createdBy meta.updatedBy",
      "name email"
    );

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json(artist);
  })
);

// Update artist
cmsRouter.put(
  "/artists/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    Object.assign(artist, req.body);
    artist.meta.updatedBy = req.user._id;

    const updatedArtist = await artist.save();

    res.json({
      message: "Artist updated successfully",
      artist: updatedArtist,
    });
  })
);

// Delete artist
cmsRouter.delete(
  "/artists/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Check for dependencies
    const productsCount = await EnhancedProduct.countDocuments({
      artist: artist._id,
    });
    const mediaCount = await MediaItem.countDocuments({ artist: artist._id });

    if (productsCount > 0 || mediaCount > 0) {
      return res.status(400).json({
        message: "Cannot delete artist with associated products or media",
        dependencies: { products: productsCount, media: mediaCount },
      });
    }

    await artist.deleteOne();

    res.json({ message: "Artist deleted successfully" });
  })
);

// ============================================================================
// PRODUCTS MANAGEMENT
// ============================================================================

// Get all products with advanced filtering
cmsRouter.get(
  "/products",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      status = "all",
      category,
      artist,
      contentType,
      unlockType,
      search,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};
    if (status !== "all") query["meta.status"] = status;
    if (category) query.category = category;
    if (artist) query.artist = artist;
    if (contentType) query.contentType = contentType;
    if (unlockType) query["unlockConfig.requirement"] = unlockType;
    if (search) query.$text = { $search: search };

    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const products = await EnhancedProduct.find(query)
      .populate("artist", "name slug avatar")
      .populate("meta.createdBy meta.updatedBy", "name email")
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    const total = await EnhancedProduct.countDocuments(query);

    res.json({
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  })
);

// Bulk operations for products
cmsRouter.post(
  "/products/bulk",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { action, productIds, data } = req.body;

    let result;
    switch (action) {
      case "publish":
        result = await EnhancedProduct.updateMany(
          { _id: { $in: productIds } },
          {
            "meta.status": "published",
            isActive: true,
            "meta.updatedBy": req.user._id,
          }
        );
        break;
      case "archive":
        result = await EnhancedProduct.updateMany(
          { _id: { $in: productIds } },
          {
            "meta.status": "archived",
            isActive: false,
            "meta.updatedBy": req.user._id,
          }
        );
        break;
      case "updateCategory":
        result = await EnhancedProduct.updateMany(
          { _id: { $in: productIds } },
          { category: data.category, "meta.updatedBy": req.user._id }
        );
        break;
      default:
        return res.status(400).json({ message: "Invalid bulk action" });
    }

    res.json({
      message: `Bulk ${action} completed`,
      modifiedCount: result.modifiedCount,
    });
  })
);

// ============================================================================
// MEDIA MANAGEMENT
// ============================================================================

// Get media items with filtering
cmsRouter.get(
  "/media",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      status = "all",
      mediaType,
      category,
      artist,
      search,
      sortBy = "publishDate",
      sortOrder = "desc",
    } = req.query;

    let query = {};
    if (status !== "all") query["meta.status"] = status;
    if (mediaType) query.mediaType = mediaType;
    if (category) query.category = category;
    if (artist) query.artist = artist;
    if (search) query.$text = { $search: search };

    const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const media = await MediaItem.find(query)
      .populate("artist", "name slug avatar")
      .populate("meta.createdBy meta.updatedBy", "name email")
      .sort(sortObj)
      .limit(limit)
      .skip(skip);

    const total = await MediaItem.countDocuments(query);

    res.json({
      media,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  })
);

// ============================================================================
// ACHIEVEMENTS MANAGEMENT
// ============================================================================

// Get achievements with stats
cmsRouter.get(
  "/achievements",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const achievements = await Achievement.find()
      .populate("rewards.productId", "name slug")
      .populate("meta.createdBy meta.updatedBy", "name email")
      .sort({ points: -1 });

    res.json({ achievements });
  })
);

// Create achievement
cmsRouter.post(
  "/achievements",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const achievementData = {
      ...req.body,
      "meta.createdBy": req.user._id,
      "meta.updatedBy": req.user._id,
    };

    const achievement = new Achievement(achievementData);
    const savedAchievement = await achievement.save();

    res.status(201).json({
      message: "Achievement created successfully",
      achievement: savedAchievement,
    });
  })
);

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

// Get site config
cmsRouter.get(
  "/config",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    let config = await CMS.SiteConfig.findOne();

    if (!config) {
      // Create default config if none exists
      config = new CMS.SiteConfig({
        siteName: "Astro Mahri Space",
        siteDescription:
          "Retro-futuristic media, games, and gear from a neon-lit future.",
        siteUrl: "https://astromahri.space",
      });
      await config.save();
    }

    res.json(config);
  })
);

// Update site config
cmsRouter.put(
  "/config",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    let config = await CMS.SiteConfig.findOne();

    if (!config) {
      config = new CMS.SiteConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }

    const savedConfig = await config.save();

    res.json({
      message: "Site configuration updated successfully",
      config: savedConfig,
    });
  })
);

// ============================================================================
// LANDING SECTIONS
// ============================================================================

// Get landing sections
cmsRouter.get(
  "/sections",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const sections = await CMS.LandingSection.find()
      .populate("featuredItems.itemId")
      .populate("meta.createdBy meta.updatedBy", "name email")
      .sort({ displayOrder: 1 });

    res.json({ sections });
  })
);

// Update section order
cmsRouter.put(
  "/sections/reorder",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { sections } = req.body; // Array of {id, order}

    const updatePromises = sections.map(({ id, order }) =>
      CMS.LandingSection.findByIdAndUpdate(id, {
        displayOrder: order,
        "meta.updatedBy": req.user._id,
      })
    );

    await Promise.all(updatePromises);

    res.json({ message: "Section order updated successfully" });
  })
);

// ============================================================================
// ANALYTICS AND INSIGHTS
// ============================================================================

// Get content analytics
cmsRouter.get(
  "/analytics",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const [productAnalytics, mediaAnalytics, achievementStats, topPerformers] =
      await Promise.all([
        // Product performance
        EnhancedProduct.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
              totalViews: { $sum: "$analytics.views" },
              totalPurchases: { $sum: "$analytics.purchases" },
              avgConversion: { $avg: "$analytics.conversionRate" },
            },
          },
        ]),

        // Media engagement
        MediaItem.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: "$mediaType",
              count: { $sum: 1 },
              totalViews: { $sum: "$analytics.views" },
              totalPlays: { $sum: "$analytics.plays" },
              avgEngagement: { $avg: "$analytics.completionRate" },
            },
          },
        ]),

        // Achievement stats
        Achievement.aggregate([
          {
            $group: {
              _id: "$rarity",
              count: { $sum: 1 },
              totalUnlocks: { $sum: "$stats.totalUnlocks" },
              avgPoints: { $avg: "$points" },
            },
          },
        ]),

        // Top performing content
        EnhancedProduct.find({ isActive: true })
          .sort({ "analytics.views": -1 })
          .limit(5)
          .select("name analytics.views analytics.purchases"),
      ]);

    res.json({
      products: productAnalytics,
      media: mediaAnalytics,
      achievements: achievementStats,
      topPerformers,
    });
  })
);

export default cmsRouter;
