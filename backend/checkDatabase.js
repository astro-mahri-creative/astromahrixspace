import mongoose from "mongoose";
import { Navigation } from "./models/contentModels/CMSModel.js";

const checkDatabase = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL || "mongodb://localhost/astromahrixspace"
    );
    console.log("MongoDB connected to:", mongoose.connection.name);

    // List all collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log("Collections in database:");
    collections.forEach((col) => console.log(`- ${col.name}`));

    // Check navigation items
    const allNav = await Navigation.find({});
    console.log(`\nFound ${allNav.length} navigation items:`);
    allNav.forEach((n) => {
      console.log(
        `- ${n.name} (location: ${n.location}, isActive: ${n.isActive})`
      );
    });

    // Test the exact query from the API
    const headerNav = await Navigation.findOne({
      location: "header",
      isActive: true,
    });
    console.log(
      "\nQuery result for header navigation:",
      headerNav ? headerNav.name : "NOT FOUND"
    );

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkDatabase();
