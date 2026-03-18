import { connectDB } from "./utils/db.js";
import { Product } from "../../shared/models/Product.js";
import { SiteConfig, LandingSection } from "../../shared/models/cms/index.js";
import { Artist } from "../../shared/models/Artist.js";
import { EnhancedProduct } from "../../shared/models/EnhancedProduct.js";
import { MediaItem } from "../../shared/models/MediaItem.js";
import { Achievement } from "../../shared/models/Achievement.js";
import { User } from "../../shared/models/User.js"; // Register User model for populate
import { isAdmin } from "./utils/auth.js";
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from "./utils/response.js";
import { parseApiPath } from "./utils/parsePath.js";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    await connectDB();

    const { httpMethod, path, body, queryStringParameters } = event;
    const apiPath = parseApiPath(path, "cms");

    // All CMS routes require admin
    const admin = isAdmin(event);
    if (!admin) {
      return errorResponse("Not authorized as admin", 401);
    }

    const parsedBody = body ? JSON.parse(body) : {};

    switch (httpMethod) {
      case "GET":
        if (apiPath[0] === "dashboard") return await getDashboard();
        if (apiPath[0] === "artists") {
          if (apiPath.length === 2) return await getArtist(apiPath[1]);
          return await getArtists(queryStringParameters);
        }
        if (apiPath[0] === "products") {
          if (apiPath.length === 2) return await getCMSProduct(apiPath[1]);
          return await getCMSProducts(queryStringParameters);
        }
        if (apiPath[0] === "media") {
          if (apiPath.length === 2) return await getMediaItem(apiPath[1]);
          return await getMediaItems(queryStringParameters);
        }
        if (apiPath[0] === "achievements") return await getAchievements();
        if (apiPath[0] === "config") return await getConfig();
        if (apiPath[0] === "sections") return await getSections();
        if (apiPath[0] === "analytics") return await getAnalytics();
        break;

      case "POST":
        if (apiPath[0] === "artists") return await createArtist(admin, parsedBody);
        if (apiPath[0] === "products" && apiPath[1] === "bulk")
          return await bulkProductAction(admin, parsedBody);
        if (apiPath[0] === "products") return await createProduct(admin, parsedBody);
        if (apiPath[0] === "media") return await createMediaItem(admin, parsedBody);
        if (apiPath[0] === "achievements") return await createAchievement(admin, parsedBody);
        break;

      case "PUT":
        if (apiPath[0] === "artists" && apiPath.length === 2)
          return await updateArtist(admin, apiPath[1], parsedBody);
        if (apiPath[0] === "products" && apiPath.length === 2)
          return await updateProduct(admin, apiPath[1], parsedBody);
        if (apiPath[0] === "media" && apiPath.length === 2)
          return await updateMediaItem(admin, apiPath[1], parsedBody);
        if (apiPath[0] === "config") return await updateConfig(parsedBody);
        if (apiPath[0] === "sections" && apiPath[1] === "reorder")
          return await reorderSections(admin, parsedBody);
        break;

      case "DELETE":
        if (apiPath[0] === "artists" && apiPath.length === 2)
          return await deleteArtist(apiPath[1]);
        if (apiPath[0] === "products" && apiPath.length === 2)
          return await deleteCMSProduct(apiPath[1]);
        if (apiPath[0] === "media" && apiPath.length === 2)
          return await deleteMediaItem(apiPath[1]);
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("CMS function error:", error);
    return errorResponse(error.message);
  }
};

// ============================================================================
// DASHBOARD
// ============================================================================
const getDashboard = async () => {
  const stats = await Promise.all([
    Artist.countDocuments({ isActive: true }),
    EnhancedProduct.countDocuments({ isActive: true }),
    MediaItem.countDocuments({ isActive: true }),
    Achievement.countDocuments({ isActive: true }),
    LandingSection.countDocuments({ isVisible: true }),
  ]);

  const recentActivity = await Promise.all([
    Artist.find().sort({ updatedAt: -1 }).limit(5).select("name updatedAt meta.status"),
    EnhancedProduct.find().sort({ updatedAt: -1 }).limit(5).select("name updatedAt meta.status"),
    MediaItem.find().sort({ updatedAt: -1 }).limit(5).select("title updatedAt meta.status"),
  ]);

  return successResponse({
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
};

// ============================================================================
// ARTISTS
// ============================================================================
const getArtists = async (query = {}) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const status = query?.status || "all";
  const search = query?.search || "";

  let filter = {};
  if (status !== "all") filter["meta.status"] = status;
  if (search) filter.name = { $regex: search, $options: "i" };

  const artists = await Artist.find(filter).sort({ updatedAt: -1 }).limit(limit).skip(skip);
  const total = await Artist.countDocuments(filter);

  return successResponse({
    artists,
    pagination: { current: page, pages: Math.ceil(total / limit), total, hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
  });
};

const getArtist = async (id) => {
  const artist = await Artist.findById(id);
  if (!artist) return errorResponse("Artist not found", 404);
  return successResponse(artist);
};

const createArtist = async (admin, data) => {
  const artistData = { ...data, "meta.createdBy": admin._id, "meta.updatedBy": admin._id };
  const artist = new Artist(artistData);
  const saved = await artist.save();
  return successResponse({ message: "Artist created successfully", artist: saved }, 201);
};

const updateArtist = async (admin, id, data) => {
  const artist = await Artist.findById(id);
  if (!artist) return errorResponse("Artist not found", 404);
  Object.assign(artist, data);
  artist.meta.updatedBy = admin._id;
  const saved = await artist.save();
  return successResponse({ message: "Artist updated successfully", artist: saved });
};

const deleteArtist = async (id) => {
  const artist = await Artist.findById(id);
  if (!artist) return errorResponse("Artist not found", 404);
  const productsCount = await EnhancedProduct.countDocuments({ artist: artist._id });
  const mediaCount = await MediaItem.countDocuments({ artist: artist._id });
  if (productsCount > 0 || mediaCount > 0) {
    return errorResponse("Cannot delete artist with associated products or media", 400);
  }
  await artist.deleteOne();
  return successResponse({ message: "Artist deleted successfully" });
};

// ============================================================================
// PRODUCTS (Enhanced)
// ============================================================================
const getCMSProducts = async (query = {}) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const { status = "all", category, artist, contentType, unlockType, search, sortBy = "updatedAt", sortOrder = "desc" } = query || {};

  let filter = {};
  if (status !== "all") filter["meta.status"] = status;
  if (category) filter.category = category;
  if (artist) filter.artist = artist;
  if (contentType) filter.contentType = contentType;
  if (unlockType) filter["unlockConfig.requirement"] = unlockType;
  if (search) filter.name = { $regex: search, $options: "i" };

  const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const products = await EnhancedProduct.find(filter)
    .populate("artist", "name slug avatar")
    .sort(sortObj).limit(limit).skip(skip);

  const total = await EnhancedProduct.countDocuments(filter);

  return successResponse({
    products,
    pagination: { current: page, pages: Math.ceil(total / limit), total, hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
  });
};

const getCMSProduct = async (id) => {
  const product = await EnhancedProduct.findById(id).populate("artist", "name slug avatar");
  if (!product) return errorResponse("Product not found", 404);
  return successResponse(product);
};

const createProduct = async (admin, data) => {
  const productData = { ...data, "meta.createdBy": admin._id, "meta.updatedBy": admin._id };
  const product = new EnhancedProduct(productData);
  const saved = await product.save();
  return successResponse({ message: "Product created successfully", product: saved }, 201);
};

const updateProduct = async (admin, id, data) => {
  const product = await EnhancedProduct.findById(id);
  if (!product) return errorResponse("Product not found", 404);
  Object.assign(product, data);
  product.meta.updatedBy = admin._id;
  const saved = await product.save();
  return successResponse({ message: "Product updated successfully", product: saved });
};

const deleteCMSProduct = async (id) => {
  const product = await EnhancedProduct.findById(id);
  if (!product) return errorResponse("Product not found", 404);
  await product.deleteOne();
  return successResponse({ message: "Product deleted successfully" });
};

const bulkProductAction = async (admin, data) => {
  const { action, productIds, data: actionData } = data;
  if (!productIds || productIds.length === 0) return errorResponse("No product IDs provided", 400);

  let result;
  switch (action) {
    case "publish":
      result = await EnhancedProduct.updateMany(
        { _id: { $in: productIds } },
        { "meta.status": "published", isActive: true, "meta.updatedBy": admin._id }
      );
      break;
    case "archive":
      result = await EnhancedProduct.updateMany(
        { _id: { $in: productIds } },
        { "meta.status": "archived", isActive: false, "meta.updatedBy": admin._id }
      );
      break;
    case "updateCategory":
      result = await EnhancedProduct.updateMany(
        { _id: { $in: productIds } },
        { category: actionData?.category, "meta.updatedBy": admin._id }
      );
      break;
    case "delete":
      result = await EnhancedProduct.deleteMany({ _id: { $in: productIds } });
      return successResponse({ message: `Deleted ${result.deletedCount} products` });
    default:
      return errorResponse("Invalid bulk action", 400);
  }

  return successResponse({ message: `Bulk ${action} completed`, modifiedCount: result.modifiedCount });
};

// ============================================================================
// MEDIA
// ============================================================================
const getMediaItems = async (query = {}) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const { status = "all", mediaType, category, artist, search, sortBy = "publishDate", sortOrder = "desc" } = query || {};

  let filter = {};
  if (status !== "all") filter["meta.status"] = status;
  if (mediaType) filter.mediaType = mediaType;
  if (category) filter.category = category;
  if (artist) filter.artist = artist;
  if (search) filter.title = { $regex: search, $options: "i" };

  const sortObj = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const media = await MediaItem.find(filter)
    .populate("artist", "name slug avatar")
    .sort(sortObj).limit(limit).skip(skip);

  const total = await MediaItem.countDocuments(filter);

  return successResponse({
    media,
    pagination: { current: page, pages: Math.ceil(total / limit), total, hasNext: page < Math.ceil(total / limit), hasPrev: page > 1 },
  });
};

const getMediaItem = async (id) => {
  const media = await MediaItem.findById(id)
    .populate("artist", "name slug avatar")
    .populate("relatedProducts", "name slug");
  if (!media) return errorResponse("Media item not found", 404);
  return successResponse(media);
};

const createMediaItem = async (admin, data) => {
  const mediaData = { ...data, "meta.createdBy": admin._id, "meta.updatedBy": admin._id };
  const media = new MediaItem(mediaData);
  const saved = await media.save();
  return successResponse({ message: "Media item created successfully", media: saved }, 201);
};

const updateMediaItem = async (admin, id, data) => {
  const media = await MediaItem.findById(id);
  if (!media) return errorResponse("Media item not found", 404);
  Object.assign(media, data);
  media.meta.updatedBy = admin._id;
  const saved = await media.save();
  return successResponse({ message: "Media item updated successfully", media: saved });
};

const deleteMediaItem = async (id) => {
  const media = await MediaItem.findById(id);
  if (!media) return errorResponse("Media item not found", 404);
  await media.deleteOne();
  return successResponse({ message: "Media item deleted successfully" });
};

// ============================================================================
// ACHIEVEMENTS
// ============================================================================
const getAchievements = async () => {
  const achievements = await Achievement.find().sort({ createdAt: -1 });
  return successResponse({ achievements });
};

const createAchievement = async (admin, data) => {
  const achievementData = { ...data, "meta.createdBy": admin._id, "meta.updatedBy": admin._id };
  const achievement = new Achievement(achievementData);
  const saved = await achievement.save();
  return successResponse({ message: "Achievement created successfully", achievement: saved }, 201);
};

// ============================================================================
// SITE CONFIG
// ============================================================================
const getConfig = async () => {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = new SiteConfig({
      siteName: "Astro Mahri Space",
      siteDescription: "Retro-futuristic media, games, and gear from a neon-lit future.",
      siteUrl: "https://astromahri.space",
    });
    await config.save();
  }
  return successResponse(config);
};

const updateConfig = async (data) => {
  let config = await SiteConfig.findOne();
  if (!config) { config = new SiteConfig(data); }
  else { Object.assign(config, data); }
  const saved = await config.save();
  return successResponse({ message: "Site configuration updated", config: saved });
};

// ============================================================================
// LANDING SECTIONS
// ============================================================================
const getSections = async () => {
  const sections = await LandingSection.find().sort({ displayOrder: 1 });
  return successResponse({ sections });
};

const reorderSections = async (admin, data) => {
  const { sections } = data;
  if (sections && Array.isArray(sections)) {
    await Promise.all(
      sections.map(({ id, order }) =>
        LandingSection.findByIdAndUpdate(id, { displayOrder: order, "meta.updatedBy": admin._id })
      )
    );
  }
  return successResponse({ message: "Section order updated successfully" });
};

// ============================================================================
// ANALYTICS
// ============================================================================
const getAnalytics = async () => {
  const [productAnalytics, mediaAnalytics] = await Promise.all([
    EnhancedProduct.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 }, totalViews: { $sum: "$analytics.views" }, totalPurchases: { $sum: "$analytics.purchases" } } },
    ]),
    MediaItem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$mediaType", count: { $sum: 1 }, totalViews: { $sum: "$analytics.views" }, totalPlays: { $sum: "$analytics.plays" } } },
    ]),
  ]);

  const topPerformers = await EnhancedProduct.find({ isActive: true })
    .sort({ "analytics.views": -1 }).limit(5)
    .select("name analytics.views analytics.purchases");

  return successResponse({ products: productAnalytics, media: mediaAnalytics, topPerformers });
};
