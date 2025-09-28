import { connectDB } from "./utils/db.js";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";

export const handler = async (event, context) => {
  // Optimize for serverless - set context timeout
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();

    const { httpMethod, path, body, queryStringParameters } = event;
    const pathSegments = path.split("/").filter(Boolean);

    // Remove 'api' and 'products' from path segments
    const apiPath = pathSegments.slice(3); // Remove '.netlify', 'functions', 'api-products'

    switch (httpMethod) {
      case "GET":
        if (apiPath.length === 0) {
          // GET /api/products
          return await getProducts(queryStringParameters);
        } else if (apiPath.length === 1) {
          if (apiPath[0] === "categories") {
            return await getCategories();
          }
          // GET /api/products/:id
          return await getProduct(apiPath[0]);
        }
        break;

      case "POST":
        if (apiPath.length === 0) {
          // POST /api/products
          return await createProduct(JSON.parse(body));
        }
        break;

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Method not allowed" }),
        };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      }),
    };
  }
};

// Helper: JSON response
const json = (statusCode, data) => ({ statusCode, body: JSON.stringify(data) });

// GET /api/products
const getProducts = async (query = {}) => {
  const pageSize = 3;
  const page = Number(query.pageNumber) || 1;
  const name = query.name || "";
  const category = query.category || "";
  const seller = query.seller || "";
  const order = query.order || "";
  const min = query.min && Number(query.min) !== 0 ? Number(query.min) : 0;
  const max = query.max && Number(query.max) !== 0 ? Number(query.max) : 0;
  const rating =
    query.rating && Number(query.rating) !== 0 ? Number(query.rating) : 0;

  const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
  const sellerFilter = seller ? { seller } : {};
  const categoryFilter = category ? { category } : {};
  const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
  const ratingFilter = rating ? { rating: { $gte: rating } } : {};
  const sortOrder =
    order === "lowest"
      ? { price: 1 }
      : order === "highest"
      ? { price: -1 }
      : order === "toprated"
      ? { rating: -1 }
      : { _id: -1 };

  const count = await Product.countDocuments({
    ...sellerFilter,
    ...nameFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });

  const products = await Product.find({
    ...sellerFilter,
    ...nameFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .populate("seller", "seller.name seller.logo")
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  return json(200, { products, page, pages: Math.ceil(count / pageSize) });
};

// GET /api/products/categories
const getCategories = async () => {
  const categories = await Product.find().distinct("category");
  return json(200, categories);
};

// GET /api/products/:id
const getProduct = async (id) => {
  const product = await Product.findById(id).populate(
    "seller",
    "seller.name seller.logo seller.rating seller.numReviews"
  );
  if (!product) return json(404, { message: "Product Not Found" });
  return json(200, product);
};

// POST /api/products placeholder (auth not wired here)
const createProduct = async () => json(401, { message: "Not authorized" });
