import {
  Navigation,
  SiteConfig,
} from "../models/contentModels/CMSModel.js";

const seedNavigationData = async () => {
  try {
    // Check if navigation already exists
    const existingNav = await Navigation.findOne({ location: "header" });
    if (existingNav) {
      console.log("Navigation data already exists, skipping seed");
      return;
    }

    // Create default header navigation
    const headerNavigation = new Navigation({
      name: "Main Header Navigation",
      location: "header",
      description: "Primary navigation menu for the website header",
      items: [
        {
          label: "Home",
          url: "/",
          icon: "fa-rocket",
          roles: [], // Empty means available to all users
          isActive: true,
          order: 0,
          target: "_self",
        },
        {
          label: "Media",
          url: "/media",
          icon: "fa-play-circle",
          roles: [],
          isActive: true,
          order: 1,
          target: "_self",
        },
        {
          label: "Games",
          url: "/games",
          icon: "fa-gamepad",
          roles: [],
          isActive: true,
          order: 2,
          target: "_self",
        },
        {
          label: "Merch",
          url: "/products",
          icon: "fa-tshirt",
          roles: [],
          isActive: true,
          order: 3,
          target: "_self",
        },
      ],
      metadata: {
        status: "published",
        createdAt: new Date(),
        lastModified: new Date(),
      },
    });

    await headerNavigation.save();

    // Create default site settings if they don't exist
    const existingSettings = await SiteConfig.findOne();
    if (!existingSettings) {
      const siteSettings = new SiteConfig({
        siteName: "astromahrixspace",
        siteDescription: "Cosmic art, music, and interactive experiences",
        logo: "/images/logo2.png",
        favicon: "/favicon.ico",
        socialMedia: {
          twitter: "",
          instagram: "",
          youtube: "",
          soundcloud: "",
        },
        contactInfo: {
          email: "",
          phone: "",
        },
        metadata: {
          status: "published",
          createdAt: new Date(),
          lastModified: new Date(),
        },
      });

      await siteSettings.save();
      console.log("✅ Site settings seeded successfully");
    }

    console.log("✅ Navigation data seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding navigation data:", error);
    throw error;
  }
};

export default seedNavigationData;
