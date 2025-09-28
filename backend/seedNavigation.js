import mongoose from "mongoose";
import { Navigation } from "./models/contentModels/CMSModel.js";

const seedNavigationData = async () => {
  try {
    // Connect to the same database the server uses
    const mongoUri =
      process.env.MONGODB_URL ||
      process.env.MONGODB_URI ||
      "mongodb://localhost/astro-cluster";
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected to:", mongoose.connection.name);

    // Clear existing navigation
    await Navigation.deleteMany({});
    console.log("Cleared existing navigation data");

    // Create header navigation
    const headerNav = new Navigation({
      name: "Main Header Navigation",
      location: "header",
      isActive: true,
      items: [
        {
          label: "Home",
          url: "/",
          icon: "fa-rocket",
          order: 0,
          isActive: true,
          allowedRoles: [],
        },
        {
          label: "Media",
          url: "/media",
          icon: "fa-play-circle",
          order: 1,
          isActive: true,
          allowedRoles: [],
        },
        {
          label: "Games",
          url: "/games",
          icon: "fa-gamepad",
          order: 2,
          isActive: true,
          allowedRoles: [],
        },
        {
          label: "Merch",
          url: "/products",
          icon: "fa-tshirt",
          order: 3,
          isActive: true,
          allowedRoles: [],
        },
        {
          label: "Cart",
          url: "/cart",
          icon: "fa-shopping-cart",
          order: 4,
          isActive: true,
          allowedRoles: [],
        },
        {
          label: "Sign In",
          url: "/signin",
          icon: "fa-user",
          order: 5,
          isActive: true,
          allowedRoles: [],
        },
      ],
      meta: {
        version: 1,
      },
    });

    await headerNav.save();
    console.log("Created header navigation");

    console.log("Navigation seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding navigation:", error);
    process.exit(1);
  }
};

seedNavigationData();
