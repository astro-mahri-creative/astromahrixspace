import { connectDB } from "./utils/db.js";
import { Product } from "./models/productModel.js";
import { isAuth, isAdmin } from "./utils/auth.js";
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
    const apiPath = parseApiPath(path, "products");

    switch (httpMethod) {
      case "GET":
        if (apiPath.length === 0) {
          return await getProducts(queryStringParameters);
        }
        if (apiPath[0] === "categories") {
          return await getCategories();
        }
        if (apiPath[0] === "featured") {
          return await getFeaturedProducts(queryStringParameters);
        }
        if (apiPath.length === 1) {
          return await getProduct(apiPath[0]);
        }
        // Handle reviews sub-route: /:id/reviews
        if (apiPath.length === 2 && apiPath[1] === "reviews") {
          return await getProductReviews(apiPath[0]);
        }
        break;

      case "POST":
        // Create product (admin only)
        if (apiPath.length === 0) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await createProduct(admin);
        }
        // Create review: /:id/reviews
        if (apiPath.length === 2 && apiPath[1] === "reviews") {
          const user = isAuth(event);
          if (!user) return errorResponse("Not authorized", 401);
          return await createReview(apiPath[0], user, JSON.parse(body));
        }
        break;

      case "PUT":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await updateProduct(apiPath[0], JSON.parse(body));
        }
        break;

      case "DELETE":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await deleteProduct(apiPath[0]);
        }
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("Products function error:", error);
    return errorResponse(error.message);
  }
};

const getProducts = async (query = {}) => {
  const pageSize = Number(query.pageSize) || 12;
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

  const filters = {
    ...sellerFilter,
    ...nameFilter,
    ...categoryFilter,
    ...priceFilter,
    ...ratingFilter,
  };

  const count = await Product.countDocuments(filters);
  const products = await Product.find(filters)
    .populate("seller", "seller.name seller.logo")
    .sort(sortOrder)
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  return successResponse({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
};

const getCategories = async () => {
  const categories = await Product.find().distinct("category");
  return successResponse(categories);
};

const getProduct = async (id) => {
  const product = await Product.findById(id).populate(
    "seller",
    "seller.name seller.logo seller.rating seller.numReviews"
  );
  if (!product) return errorResponse("Product Not Found", 404);
  return successResponse(product);
};

const getProductReviews = async (id) => {
  const product = await Product.findById(id);
  if (!product) return errorResponse("Product Not Found", 404);
  return successResponse(product.reviews);
};

const createProduct = async (adminUser) => {
  const product = new Product({
    name: "Sample Product " + Date.now(),
    slug: "sample-" + Date.now(),
    seller: adminUser._id,
    image: "/images/p1.jpg",
    price: 0,
    category: "Music",
    brand: "Astro Mahri",
    countInStock: 0,
    rating: 0,
    numReviews: 0,
    description: "Sample description",
  });

  const createdProduct = await product.save();
  return successResponse({ message: "Product Created", product: createdProduct }, 201);
};

const updateProduct = async (id, productData) => {
  const product = await Product.findById(id);
  if (!product) return errorResponse("Product not found", 404);

  product.name = productData.name || product.name;
  product.slug = productData.slug || product.slug;
  product.price = productData.price ?? product.price;
  product.image = productData.image || product.image;
  product.category = productData.category || product.category;
  product.brand = productData.brand || product.brand;
  product.countInStock = productData.countInStock ?? product.countInStock;
  product.description = productData.description || product.description;
  product.longDescription =
    productData.longDescription ?? product.longDescription;
  product.features = productData.features ?? product.features;
  product.unlockRequirement =
    productData.unlockRequirement || product.unlockRequirement;
  product.gameScoreRequired =
    productData.gameScoreRequired ?? product.gameScoreRequired;
  product.streamUrl = productData.streamUrl ?? product.streamUrl;
  product.downloadUrl = productData.downloadUrl ?? product.downloadUrl;
  product.contentType = productData.contentType || product.contentType;
  product.tags = productData.tags ?? product.tags;

  const updatedProduct = await product.save();
  return successResponse({ message: "Product Updated", product: updatedProduct });
};

const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) return errorResponse("Product not found", 404);

  await product.deleteOne();
  return successResponse({ message: "Product Deleted" });
};

const createReview = async (productId, user, reviewData) => {
  const product = await Product.findById(productId);
  if (!product) return errorResponse("Product Not Found", 404);

  const alreadyReviewed = product.reviews.find(
    (r) => r.user && r.user.toString() === user._id.toString()
  );
  if (alreadyReviewed) {
    return errorResponse("Product already reviewed", 400);
  }

  const review = {
    name: user.name,
    rating: Number(reviewData.rating),
    comment: reviewData.comment,
    user: user._id,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();
  return successResponse({ message: "Review Added" }, 201);
};

const getFeaturedProducts = async (query = {}) => {
  const limit = Number(query.limit) || 6;
  const products = await Product.find({ featured: true })
    .sort({ featuredOrder: 1 })
    .limit(limit);

  // If no featured products, return top-rated
  if (products.length === 0) {
    const fallback = await Product.find({})
      .sort({ rating: -1 })
      .limit(limit);
    return successResponse(fallback);
  }

  return successResponse(products);
};
