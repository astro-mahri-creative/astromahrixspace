import express from "express";
import expressAsyncHandler from "express-async-handler";
import Artist from "../models/contentModels/ArtistModel.js";
import EnhancedProduct from "../models/contentModels/EnhancedProductModel.js";
import MediaItem from "../models/contentModels/MediaItemModel.js";
import Achievement from "../models/contentModels/AchievementModel.js";
import { CMS } from "../models/contentModels/CMSModel.js";
import GameProgress from "../models/gameProgressModel.js";

const contentApiRouter = express.Router();

// ============================================================================
// CACHING MIDDLEWARE
// ============================================================================

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheMiddleware = (key, ttl = CACHE_TTL) => {
  return (req, res, next) => {
    const cacheKey = `${key}-${JSON.stringify(req.query)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function (data) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
      // Clean up old cache entries (simple LRU)
      if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// ============================================================================
// PUBLIC CONTENT API (High Performance)
// ============================================================================

// Get site configuration (cached, public)
contentApiRouter.get(
  "/config",
  cacheMiddleware("site-config", 15 * 60 * 1000), // 15 minutes
  expressAsyncHandler(async (req, res) => {
    const config = await CMS.SiteConfig.findOne().select(
      "-apiSettings -paymentSettings"
    ); // Exclude sensitive fields

    if (!config) {
      return res.status(404).json({ message: "Site configuration not found" });
    }

    res.json(config);
  })
);

// Get landing sections (optimized)
contentApiRouter.get(
  "/landing",
  cacheMiddleware("landing-sections"),
  expressAsyncHandler(async (req, res) => {
    const sections = await CMS.LandingSection.find({
      isVisible: true,
      "meta.status": "published",
      publishDate: { $lte: new Date() },
    })
      .populate({
        path: "featuredItems.itemId",
        select: "name title slug image thumbnail pricing rating",
      })
      .sort({ displayOrder: 1 })
      .select("-meta -analytics")
      .lean(); // Use lean for better performance

    res.json({ sections });
  })
);

// Get all active artists (lightweight)
contentApiRouter.get(
  "/artists",
  cacheMiddleware("artists"),
  expressAsyncHandler(async (req, res) => {
    const { limit = 20, featured } = req.query;

    let query = Artist.find({
      isActive: true,
      "meta.status": "published",
    });

    if (featured === "true") {
      // Get artists with featured products
      query = query.where("meta.featured", true);
    }

    const artists = await query
      .select("name slug bio avatar socialLinks seller")
      .limit(parseInt(limit))
      .sort({ "meta.priority": -1, name: 1 })
      .lean();

    res.json({ artists });
  })
);

// Get single artist with products
contentApiRouter.get(
  "/artists/:slug",
  cacheMiddleware("artist-detail"),
  expressAsyncHandler(async (req, res) => {
    const artist = await Artist.findOne({
      slug: req.params.slug,
      isActive: true,
      "meta.status": "published",
    })
      .select("-meta -__v")
      .lean();

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Get artist's products and media
    const [products, media] = await Promise.all([
      EnhancedProduct.find({
        artist: artist._id,
        isActive: true,
        "meta.status": "published",
      })
        .select(
          "name slug description image pricing rating numReviews unlockConfig tags"
        )
        .sort({ publishDate: -1 })
        .limit(20)
        .lean(),

      MediaItem.find({
        artist: artist._id,
        isActive: true,
        "meta.status": "published",
      })
        .select("title slug description thumbnail mediaType duration tags")
        .sort({ publishDate: -1 })
        .limit(10)
        .lean(),
    ]);

    res.json({
      artist,
      products,
      media,
      stats: {
        totalProducts: products.length,
        totalMedia: media.length,
      },
    });
  })
);

// Get products with advanced filtering (optimized)
contentApiRouter.get(
  "/products",
  expressAsyncHandler(async (req, res) => {
    const {
      category,
      artist,
      tags,
      unlockType,
      priceMin,
      priceMax,
      featured,
      search,
      sortBy = "publishDate",
      sortOrder = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    // Build aggregation pipeline for performance
    const pipeline = [];

    // Match stage
    const matchStage = {
      isActive: true,
      "meta.status": "published",
    };

    if (category) matchStage.category = category;
    if (artist) matchStage.artist = mongoose.Types.ObjectId(artist);
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      matchStage.tags = { $in: tagArray };
    }
    if (unlockType) matchStage["unlockConfig.requirement"] = unlockType;
    if (priceMin || priceMax) {
      matchStage["pricing.basePrice"] = {};
      if (priceMin) matchStage["pricing.basePrice"].$gte = parseFloat(priceMin);
      if (priceMax) matchStage["pricing.basePrice"].$lte = parseFloat(priceMax);
    }
    if (featured === "true") matchStage["meta.featured"] = true;

    if (search) {
      matchStage.$text = { $search: search };
    }

    pipeline.push({ $match: matchStage });

    // Add search score for sorting if searching
    if (search) {
      pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
    }

    // Lookup artist info
    pipeline.push({
      $lookup: {
        from: "artists",
        localField: "artist",
        foreignField: "_id",
        as: "artistInfo",
        pipeline: [{ $project: { name: 1, slug: 1, avatar: 1 } }],
      },
    });

    // Add computed fields
    pipeline.push({
      $addFields: {
        artist: { $arrayElemAt: ["$artistInfo", 0] },
        currentPrice: {
          $cond: {
            if: {
              $and: [
                "$pricing.isOnSale",
                { $lte: [new Date(), "$pricing.saleEndDate"] },
                { $gte: [new Date(), "$pricing.saleStartDate"] },
              ],
            },
            then: "$pricing.salePrice",
            else: "$pricing.basePrice",
          },
        },
        isOnSale: {
          $and: [
            "$pricing.isOnSale",
            { $lte: [new Date(), "$pricing.saleEndDate"] },
            { $gte: [new Date(), "$pricing.saleStartDate"] },
          ],
        },
      },
    });

    // Sort stage
    const sortStage = {};
    if (search) {
      sortStage.score = { $meta: "textScore" };
    } else {
      sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;
    }
    pipeline.push({ $sort: sortStage });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Project only needed fields
    pipeline.push({
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        category: 1,
        contentType: 1,
        currentPrice: 1,
        isOnSale: 1,
        "pricing.basePrice": 1,
        "pricing.salePrice": 1,
        rating: 1,
        numReviews: 1,
        tags: 1,
        unlockConfig: 1,
        publishDate: 1,
        artist: 1,
        "meta.featured": 1,
      },
    });

    // Get total count for pagination
    const totalPipeline = [...pipeline];
    totalPipeline.pop(); // Remove limit
    totalPipeline.pop(); // Remove skip
    totalPipeline.pop(); // Remove project
    totalPipeline.push({ $count: "total" });

    const [products, totalCount] = await Promise.all([
      EnhancedProduct.aggregate(pipeline),
      EnhancedProduct.aggregate(totalPipeline),
    ]);

    const total = totalCount[0]?.total || 0;

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
      filters: {
        category,
        artist,
        tags,
        unlockType,
        priceMin,
        priceMax,
        featured,
      },
    });
  })
);

// Get single product with full details
contentApiRouter.get(
  "/products/:slug",
  cacheMiddleware("product-detail"),
  expressAsyncHandler(async (req, res) => {
    const product = await EnhancedProduct.findOne({
      slug: req.params.slug,
      isActive: true,
      "meta.status": "published",
    })
      .populate("artist", "name slug bio avatar socialLinks seller")
      .select("-meta -__v")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get related products
    const relatedProducts = await EnhancedProduct.find({
      _id: { $ne: product._id },
      $or: [
        { category: product.category },
        { artist: product.artist._id },
        { tags: { $in: product.tags.slice(0, 3) } },
      ],
      isActive: true,
      "meta.status": "published",
    })
      .populate("artist", "name slug avatar")
      .select("name slug description image pricing rating tags")
      .sort({ rating: -1, numReviews: -1 })
      .limit(4)
      .lean();

    // Increment view count (async, non-blocking)
    EnhancedProduct.findByIdAndUpdate(product._id, {
      $inc: { "analytics.views": 1 },
      "analytics.lastViewed": new Date(),
    })
      .exec()
      .catch((err) => console.error("Failed to update view count:", err));

    res.json({
      product,
      relatedProducts,
    });
  })
);

// Get media items
contentApiRouter.get(
  "/media",
  cacheMiddleware("media"),
  expressAsyncHandler(async (req, res) => {
    const {
      mediaType,
      category,
      artist,
      tags,
      featured,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    let query = MediaItem.find({
      isActive: true,
      "meta.status": "published",
      publishDate: { $lte: new Date() },
    });

    // Apply filters
    if (mediaType) query = query.where("mediaType", mediaType);
    if (category) query = query.where("category", category);
    if (artist) query = query.where("artist", artist);
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query = query.where("tags").in(tagArray);
    }
    if (featured === "true") query = query.where("isFeatured", true);
    if (search) query = query.find({ $text: { $search: search } });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [media, total] = await Promise.all([
      query
        .populate("artist", "name slug avatar")
        .select(
          "title slug description thumbnail mediaType category duration tags publishDate"
        )
        .sort({ publishDate: -1, "meta.priority": -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),

      MediaItem.countDocuments(query.getQuery()),
    ]);

    res.json({
      media,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
    });
  })
);

// Get single media item
contentApiRouter.get(
  "/media/:slug",
  cacheMiddleware("media-detail"),
  expressAsyncHandler(async (req, res) => {
    const media = await MediaItem.findOne({
      slug: req.params.slug,
      isActive: true,
      "meta.status": "published",
    })
      .populate("artist", "name slug bio avatar")
      .populate("relatedProducts", "name slug description image pricing")
      .select("-meta -__v")
      .lean();

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Get related media
    const relatedMedia = await MediaItem.find({
      _id: { $ne: media._id },
      $or: [
        { mediaType: media.mediaType },
        { category: media.category },
        { artist: media.artist._id },
        { tags: { $in: media.tags.slice(0, 3) } },
      ],
      isActive: true,
      "meta.status": "published",
    })
      .populate("artist", "name slug avatar")
      .select("title slug description thumbnail mediaType duration")
      .sort({ publishDate: -1 })
      .limit(4)
      .lean();

    // Increment view count (async)
    MediaItem.findByIdAndUpdate(media._id, {
      $inc: { "analytics.views": 1 },
      "analytics.lastViewed": new Date(),
    })
      .exec()
      .catch((err) => console.error("Failed to update media view count:", err));

    res.json({
      media,
      relatedMedia,
    });
  })
);

// Get achievements for leaderboard/display
contentApiRouter.get(
  "/achievements",
  cacheMiddleware("achievements"),
  expressAsyncHandler(async (req, res) => {
    const { category, rarity, limit = 50 } = req.query;

    let query = Achievement.find({
      isActive: true,
      "meta.status": "published",
      isSecret: false, // Only show non-secret achievements
    });

    if (category) query = query.where("category", category);
    if (rarity) query = query.where("rarity", rarity);

    const achievements = await query
      .populate("rewards.productId", "name slug image")
      .select("name description icon rarity category points difficulty stats")
      .sort({ points: -1, "stats.totalUnlocks": -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({ achievements });
  })
);

// Check user's unlock status for specific content
contentApiRouter.get(
  "/unlock-status/:sessionId/:productId",
  expressAsyncHandler(async (req, res) => {
    const { sessionId, productId } = req.params;

    const [progress, product] = await Promise.all([
      GameProgress.findOne({ sessionId }),
      EnhancedProduct.findById(productId).select("unlockConfig name"),
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let isUnlocked = false;
    let reason = "";

    const { requirement, gameScoreRequired } = product.unlockConfig;

    switch (requirement) {
      case "free":
        isUnlocked = true;
        reason = "Always available";
        break;
      case "game":
        const hasUnlock = progress?.unlockedContent?.some((id) =>
          id.equals(product._id)
        );
        if (hasUnlock) {
          isUnlocked = true;
          reason = "Unlocked through gaming";
        } else {
          reason = `Score ${gameScoreRequired} points to unlock`;
        }
        break;
      case "purchase":
        reason = "Available for purchase";
        break;
      default:
        reason = "Unlock method not specified";
    }

    res.json({
      isUnlocked,
      reason,
      currentScore: progress?.frequencyMatchScore || 0,
      scoreRequired: gameScoreRequired || 0,
      requirement,
    });
  })
);

// Get categories and tags for filtering
contentApiRouter.get(
  "/filters",
  cacheMiddleware("filters", 10 * 60 * 1000), // 10 minutes
  expressAsyncHandler(async (req, res) => {
    const [productCategories, mediaTypes, artists, productTags, mediaTags] =
      await Promise.all([
        EnhancedProduct.distinct("category", {
          isActive: true,
          "meta.status": "published",
        }),
        MediaItem.distinct("mediaType", {
          isActive: true,
          "meta.status": "published",
        }),
        Artist.find({ isActive: true, "meta.status": "published" })
          .select("name slug")
          .sort({ name: 1 })
          .lean(),
        EnhancedProduct.distinct("tags", {
          isActive: true,
          "meta.status": "published",
        }),
        MediaItem.distinct("tags", {
          isActive: true,
          "meta.status": "published",
        }),
      ]);

    const allTags = [...new Set([...productTags, ...mediaTags])].sort();

    res.json({
      categories: productCategories.sort(),
      mediaTypes: mediaTypes.sort(),
      artists: artists,
      tags: allTags,
    });
  })
);

// Search across all content types
contentApiRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { q: query, type = "all", limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Query must be at least 2 characters" });
    }

    const searchPromises = [];
    const results = { products: [], media: [], artists: [], achievements: [] };

    if (type === "all" || type === "products") {
      searchPromises.push(
        EnhancedProduct.find(
          {
            $text: { $search: query },
            isActive: true,
            "meta.status": "published",
          },
          { score: { $meta: "textScore" } }
        )
          .populate("artist", "name slug avatar")
          .select("name slug description image pricing rating tags")
          .sort({ score: { $meta: "textScore" } })
          .limit(parseInt(limit))
          .lean()
          .then((products) => (results.products = products))
      );
    }

    if (type === "all" || type === "media") {
      searchPromises.push(
        MediaItem.find(
          {
            $text: { $search: query },
            isActive: true,
            "meta.status": "published",
          },
          { score: { $meta: "textScore" } }
        )
          .populate("artist", "name slug avatar")
          .select("title slug description thumbnail mediaType duration tags")
          .sort({ score: { $meta: "textScore" } })
          .limit(parseInt(limit))
          .lean()
          .then((media) => (results.media = media))
      );
    }

    if (type === "all" || type === "artists") {
      searchPromises.push(
        Artist.find(
          {
            $text: { $search: query },
            isActive: true,
            "meta.status": "published",
          },
          { score: { $meta: "textScore" } }
        )
          .select("name slug bio avatar")
          .sort({ score: { $meta: "textScore" } })
          .limit(parseInt(limit))
          .lean()
          .then((artists) => (results.artists = artists))
      );
    }

    await Promise.all(searchPromises);

    const totalResults = Object.values(results).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    res.json({
      query,
      results,
      totalResults,
      searchTime: Date.now(),
    });
  })
);

export default contentApiRouter;
