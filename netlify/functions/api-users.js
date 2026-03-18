import { connectDB } from "./utils/db.js";
import { User } from "../../shared/models/User.js";
import { generateToken, isAuth, isAdmin } from "./utils/auth.js";
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
    const apiPath = parseApiPath(path, "users");

    switch (httpMethod) {
      case "POST":
        if (apiPath[0] === "signin" || apiPath[0] === "login") {
          return await loginUser(JSON.parse(body));
        }
        if (apiPath[0] === "register") {
          return await registerUser(JSON.parse(body));
        }
        break;

      case "GET":
        if (apiPath[0] === "top-sellers") {
          return await getTopSellers();
        }
        if (apiPath[0] === "profile") {
          const user = isAuth(event);
          if (!user) return errorResponse("Not authorized", 401);
          return await getUserProfile(user._id);
        }
        // Admin: list all users
        if (apiPath.length === 0) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await listUsers();
        }
        // Get user by ID
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await getUserById(apiPath[0]);
        }
        break;

      case "PUT":
        if (apiPath[0] === "profile") {
          const user = isAuth(event);
          if (!user) return errorResponse("Not authorized", 401);
          return await updateUserProfile(user._id, JSON.parse(body));
        }
        // Admin: update user by ID
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await updateUser(apiPath[0], JSON.parse(body));
        }
        break;

      case "DELETE":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await deleteUser(apiPath[0]);
        }
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("Users function error:", error);
    return errorResponse(error.message);
  }
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    return errorResponse("Email and password are required", 400);
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return successResponse({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      token: generateToken(user),
    });
  }
  return errorResponse("Invalid email or password", 401);
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    return errorResponse("Name, email, and password are required", 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse("User already exists", 400);
  }

  const user = await User.create({ name, email, password });

  if (user) {
    return successResponse(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        token: generateToken(user),
      },
      201
    );
  }
  return errorResponse("Invalid user data", 400);
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    return successResponse({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    });
  }
  return errorResponse("User not found", 404);
};

const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (user) {
    user.name = updates.name || user.name;
    user.email = updates.email || user.email;
    if (updates.sellerName) {
      user.isSeller = true;
      user.seller.name = updates.sellerName;
      user.seller.logo = updates.sellerLogo;
      user.seller.description = updates.sellerDescription;
    }
    if (updates.password) {
      user.password = updates.password;
    }

    const updatedUser = await user.save();
    return successResponse({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isSeller: updatedUser.isSeller,
      token: generateToken(updatedUser),
    });
  }
  return errorResponse("User not found", 404);
};

const getTopSellers = async () => {
  const topSellers = await User.find({ isSeller: true })
    .sort({ "seller.rating": -1 })
    .limit(3);
  return successResponse(topSellers);
};

const listUsers = async () => {
  const users = await User.find({});
  return successResponse(users);
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (user) {
    return successResponse(user);
  }
  return errorResponse("User not found", 404);
};

const updateUser = async (id, updates) => {
  const user = await User.findById(id);
  if (user) {
    user.name = updates.name || user.name;
    user.email = updates.email || user.email;
    user.isSeller = Boolean(updates.isSeller);
    user.isAdmin = Boolean(updates.isAdmin);
    const updatedUser = await user.save();
    return successResponse({ message: "User Updated", user: updatedUser });
  }
  return errorResponse("User not found", 404);
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (user) {
    if (user.isAdmin) {
      return errorResponse("Cannot delete admin user", 400);
    }
    await user.deleteOne();
    return successResponse({ message: "User Deleted" });
  }
  return errorResponse("User not found", 404);
};
