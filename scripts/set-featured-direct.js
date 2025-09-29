import mongoose from "mongoose";

// Import the Product model
const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    image: String,
    brand: String,
    category: String,
    description: String,
    price: Number,
    countInStock: Number,
    rating: Number,
    numReviews: Number,
    reviews: Array,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    featured: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    tags: [String],
    streamUrl: String,
    contentType: String,
    unlockRequirement: String,
    features: [String],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

async function setFeaturedProducts() {
  try {
    // Try different possible database names
    const possibleUrls = [
      "mongodb://localhost/astromahrixspace",
      "mongodb://localhost/astro-cluster",
      process.env.MONGODB_URI,
      process.env.MONGODB_URL,
    ].filter((url) => url);

    for (const mongoUrl of possibleUrls) {
      try {
        console.log("Trying MongoDB URL:", mongoUrl);
        await mongoose.connect(mongoUrl);
        console.log("Connected to MongoDB");
        console.log("Database name:", mongoose.connection.name);

        // Check if there are products
        const directProducts = await mongoose.connection.db
          .collection("products")
          .find({})
          .limit(3)
          .toArray();
        console.log(`Direct query found ${directProducts.length} products`);

        if (directProducts.length > 0) {
          console.log("✓ Found products in this database!");
          break; // Use this database
        } else {
          console.log("No products found in this database, trying next...");
          await mongoose.disconnect();
        }
      } catch (error) {
        console.log("Failed to connect to:", mongoUrl, error.message);
        continue;
      }
    }

    // Get the first 3 products
    const products = await Product.find({}).limit(3);
    console.log(`Found ${products.length} products`);

    // Also try direct collection query
    const directProducts = await mongoose.connection.db
      .collection("products")
      .find({})
      .limit(3)
      .toArray();
    console.log(`Direct query found ${directProducts.length} products`);
    if (directProducts.length > 0) {
      console.log("First product:", directProducts[0]);
    }

    // Set them as featured
    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      console.log(`Setting "${product.name}" as featured (order ${i + 1})...`);

      await Product.findByIdAndUpdate(product._id, {
        featured: true,
        featuredOrder: i + 1,
      });

      console.log(`✓ "${product.name}" is now featured`);
    }

    console.log("\n🎉 Successfully set featured products!");

    // Verify the changes
    const featuredProducts = await Product.find({ featured: true }).sort({
      featuredOrder: 1,
    });
    console.log("\nFeatured products:");
    featuredProducts.forEach((p) => {
      console.log(`- ${p.name} (Order: ${p.featuredOrder})`);
    });
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

setFeaturedProducts();
