import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, sparse: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    longDescription: { type: String },
    features: [String],
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
    // Gaming unlock fields
    unlockRequirement: {
      type: String,
      enum: ["free", "purchase", "game"],
      default: "free",
    },
    gameScoreRequired: { type: Number, default: 0 },
    streamUrl: String,
    downloadUrl: String,
    contentType: {
      type: String,
      enum: ["music", "content", "merch"],
      default: "music",
    },
    tags: [String],
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export { Product, productSchema };
export default Product;
