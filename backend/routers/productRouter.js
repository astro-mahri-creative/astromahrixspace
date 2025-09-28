import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { isAdmin, isAuth, isSellerOrAdmin } from "../utils.js";

const productRouter = express.Router();

// tiny util to create URL-safe slugs from names
const toSlug = (str = "") =>
  String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

productRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const pageSize = 3;
    const page = Number(req.query.pageNumber) || 1;
    const name = req.query.name || "";
    const category = req.query.category || "";
    const seller = req.query.seller || "";
    const order = req.query.order || "";
    const featured = req.query.featured === "true";
    const min =
      req.query.min && Number(req.query.min) !== 0 ? Number(req.query.min) : 0;
    const max =
      req.query.max && Number(req.query.max) !== 0 ? Number(req.query.max) : 0;
    const rating =
      req.query.rating && Number(req.query.rating) !== 0
        ? Number(req.query.rating)
        : 0;

    const nameFilter = name ? { name: { $regex: name, $options: "i" } } : {};
    const sellerFilter = seller ? { seller } : {};
    const categoryFilter = category ? { category } : {};
    const featuredFilter = featured ? { featured: true } : {};
    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};
    const ratingFilter = rating ? { rating: { $gte: rating } } : {};
    const sortOrder =
      order === "lowest"
        ? { price: 1 }
        : order === "highest"
        ? { price: -1 }
        : order === "toprated"
        ? { rating: -1 }
        : order === "featured"
        ? { featuredOrder: 1, _id: -1 }
        : { _id: -1 };
    const count = await Product.countDocuments({
      ...sellerFilter,
      ...nameFilter,
      ...categoryFilter,
      ...featuredFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    const products = await Product.find({
      ...sellerFilter,
      ...nameFilter,
      ...categoryFilter,
      ...featuredFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .populate("seller", "seller.name seller.logo")
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.send({ products, page, pages: Math.ceil(count / pageSize) });
  })
);

productRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct("category");
    res.send(categories);
  })
);

productRouter.get(
  "/featured",
  expressAsyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 4;
    const products = await Product.find({ featured: true })
      .populate("seller", "seller.name seller.logo")
      .sort({ featuredOrder: 1, _id: -1 })
      .limit(limit);
    res.send(products);
  })
);

productRouter.put(
  "/:id/featured",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.featured = req.body.featured;
      product.featuredOrder = req.body.featuredOrder || 999;
      const updatedProduct = await product.save();
      res.send({ 
        message: `Product ${product.featured ? 'featured' : 'unfeatured'}`, 
        product: updatedProduct 
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.get(
  "/seed",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    if ((process.env.NODE_ENV || "development") === "production") {
      return res
        .status(403)
        .send({ message: "Seeding disabled in production" });
    }
    // await Product.remove({});
    const seller = await User.findOne({ isSeller: true });
    if (seller) {
      const products = data.products.map((p) => {
        const { _id, ...rest } = p; // remove any provided _id
        return { ...rest, seller: seller._id };
      });
      const createdProducts = await Product.insertMany(products);
      res.send({ createdProducts });
    } else {
      res
        .status(500)
        .send({ message: "No seller found. first run /api/users/seed" });
    }
  })
);

productRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "seller.name seller.logo seller.rating seller.numReviews"
    );
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.post(
  "/",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const name = "sample name " + Date.now();
    const baseSlug = toSlug(name) || "sample";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const product = new Product({
      name,
      slug,
      seller: req.user._id,
      image: "/images/p1.jpg",
      price: 0,
      category: "sample category",
      brand: "sample brand",
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: "sample description",
    });
    const createdProduct = await product.save();
    res.send({ message: "Product Created", product: createdProduct });
  })
);
productRouter.put(
  "/:id",
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.name = req.body.name;
      // Accept explicit slug if provided, otherwise keep existing to avoid breaking links
      if (req.body.slug && req.body.slug !== product.slug) {
        product.slug = toSlug(req.body.slug);
      }
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      
      // Handle new enhanced fields
      if (req.body.hasOwnProperty('featured')) {
        product.featured = req.body.featured;
      }
      if (req.body.hasOwnProperty('featuredOrder')) {
        product.featuredOrder = req.body.featuredOrder;
      }
      if (req.body.tags) {
        product.tags = req.body.tags;
      }
      if (req.body.streamUrl) {
        product.streamUrl = req.body.streamUrl;
      }
      if (req.body.contentType) {
        product.contentType = req.body.contentType;
      }
      if (req.body.unlockRequirement) {
        product.unlockRequirement = req.body.unlockRequirement;
      }
      if (req.body.features) {
        product.features = req.body.features;
      }
      
      const updatedProduct = await product.save();
      res.send({ message: "Product Updated", product: updatedProduct });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      const deleted = product.toObject();
      await product.deleteOne();
      res.send({ message: "Product Deleted", product: deleted });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }
      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

export default productRouter;
