import { connectDB } from "./utils/db.js";
import { Product } from "./models/productModel.js";
import { SiteConfig } from "./models/cmsModel.js";
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

    switch (httpMethod) {
      case "GET":
        if (apiPath[0] === "dashboard") {
          return await getDashboard();
        }
        if (apiPath[0] === "products") {
          if (apiPath.length === 2) {
            return await getCMSProduct(apiPath[1]);
          }
          return await getCMSProducts(queryStringParameters);
        }
        if (apiPath[0] === "config") {
          return await getConfig();
        }
        break;

      case "POST":
        if (apiPath[0] === "products" && apiPath[1] === "bulk") {
          return await bulkProductAction(admin, JSON.parse(body));
        }
        break;

      case "PUT":
        if (apiPath[0] === "config") {
          return await updateConfig(JSON.parse(body));
        }
        break;

      case "DELETE":
        if (apiPath[0] === "products" && apiPath.length === 2) {
          return await deleteCMSProduct(apiPath[1]);
        }
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

const getDashboard = async () => {
  const [productCount, productsByCategory] = await Promise.all([
    Product.countDocuments({}),
    Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const recentProducts = await Product.find({})
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("name category price updatedAt");

  return successResponse({
    stats: {
      products: productCount,
      categories: productsByCategory.length,
    },
    recentActivity: {
      products: recentProducts,
    },
    productsByCategory,
  });
};

const getCMSProducts = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = query.search || "";
  const category = query.category || "";
  const sortBy = query.sortBy || "updatedAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  let filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (category) {
    filter.category = category;
  }

  const products = await Product.find(filter)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip);

  const total = await Product.countDocuments(filter);

  return successResponse({
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
};

const getCMSProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) return errorResponse("Product not found", 404);
  return successResponse(product);
};

const deleteCMSProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) return errorResponse("Product not found", 404);
  await product.deleteOne();
  return successResponse({ message: "Product deleted successfully" });
};

const bulkProductAction = async (admin, data) => {
  const { action, productIds } = data;

  if (!productIds || productIds.length === 0) {
    return errorResponse("No product IDs provided", 400);
  }

  let result;
  switch (action) {
    case "delete":
      result = await Product.deleteMany({ _id: { $in: productIds } });
      return successResponse({
        message: `Deleted ${result.deletedCount} products`,
      });
    case "updateCategory":
      result = await Product.updateMany(
        { _id: { $in: productIds } },
        { category: data.category }
      );
      return successResponse({
        message: `Updated ${result.modifiedCount} products`,
      });
    default:
      return errorResponse("Invalid bulk action", 400);
  }
};

const getConfig = async () => {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = new SiteConfig({
      siteName: "Astro Mahri Space",
      siteDescription:
        "Retro-futuristic media, games, and gear from a neon-lit future.",
      siteUrl: "https://astromahri.space",
    });
    await config.save();
  }
  return successResponse(config);
};

const updateConfig = async (data) => {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = new SiteConfig(data);
  } else {
    Object.assign(config, data);
  }
  const saved = await config.save();
  return successResponse({
    message: "Site configuration updated",
    config: saved,
  });
};
