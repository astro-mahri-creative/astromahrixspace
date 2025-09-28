import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // Core commerce fields
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    features: [{ type: String }],
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    reviews: [reviewSchema],
    // Content / unlock meta used by gameRouter and frontend
    unlockRequirement: {
      type: String,
      enum: ["free", "game", "purchase"],
      default: "purchase",
      index: true,
    },
    gameScoreRequired: { type: Number, default: 0 },
    streamUrl: { type: String },
    contentType: {
      type: String,
      enum: ["music", "content"],
      default: "content",
    },
    tags: [{ type: String, index: true }],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
