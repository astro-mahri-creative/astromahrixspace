import { connectDB } from "./utils/db.js";
import { SiteConfig, Navigation } from "../../shared/models/cms/index.js";
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

    const { httpMethod, path, body } = event;
    const apiPath = parseApiPath(path, "navigation");

    switch (httpMethod) {
      case "GET":
        // GET /api/navigation/settings/site - public site settings
        if (apiPath[0] === "settings" && apiPath[1] === "site") {
          return await getSiteSettings();
        }
        // GET /api/navigation - admin list all
        if (apiPath.length === 0) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await listNavigations();
        }
        // GET /api/navigation/:location - public navigation by location
        if (apiPath.length === 1) {
          return await getNavigationByLocation(apiPath[0]);
        }
        break;

      case "POST":
        if (apiPath.length === 0) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await createNavigation(admin, JSON.parse(body));
        }
        break;

      case "PUT":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await updateNavigation(apiPath[0], admin, JSON.parse(body));
        }
        break;

      case "DELETE":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await deleteNavigation(apiPath[0]);
        }
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("Navigation function error:", error);
    return errorResponse(error.message);
  }
};

const getNavigationByLocation = async (location) => {
  const navigation = await Navigation.findOne({
    location,
    isActive: true,
  }).sort({ updatedAt: -1 });

  if (!navigation) {
    return errorResponse(
      `Navigation not found for location: ${location}`,
      404
    );
  }

  const activeItems = navigation.items
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order);

  return successResponse({
    success: true,
    data: {
      _id: navigation._id,
      name: navigation.name,
      location: navigation.location,
      items: activeItems,
    },
  });
};

const getSiteSettings = async () => {
  const settings = await SiteConfig.findOne().sort({ updatedAt: -1 });

  if (!settings) {
    return errorResponse("Site settings not found", 404);
  }

  return successResponse({
    success: true,
    data: {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      logo: settings.logo,
      favicon: settings.favicon,
      socialMedia: settings.socialLinks,
      contactInfo: settings.contactInfo,
    },
  });
};

const listNavigations = async () => {
  const navigation = await Navigation.find({}).sort({
    location: 1,
    updatedAt: -1,
  });
  return successResponse({ success: true, data: navigation });
};

const createNavigation = async (admin, data) => {
  const navigationData = {
    ...data,
    meta: {
      createdBy: admin._id,
      updatedBy: admin._id,
      version: 1,
    },
  };

  const navigation = new Navigation(navigationData);
  const saved = await navigation.save();
  return successResponse(
    { success: true, data: saved, message: "Navigation created successfully" },
    201
  );
};

const updateNavigation = async (id, admin, data) => {
  const updateData = {
    ...data,
    meta: {
      ...data.meta,
      updatedBy: admin._id,
      version: (data.meta?.version || 1) + 1,
    },
  };

  const navigation = await Navigation.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!navigation) {
    return errorResponse("Navigation not found", 404);
  }

  return successResponse({
    success: true,
    data: navigation,
    message: "Navigation updated successfully",
  });
};

const deleteNavigation = async (id) => {
  const navigation = await Navigation.findByIdAndDelete(id);
  if (!navigation) {
    return errorResponse("Navigation not found", 404);
  }
  return successResponse({
    success: true,
    message: "Navigation deleted successfully",
  });
};
