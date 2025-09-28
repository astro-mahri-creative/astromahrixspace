import { connectDB } from "./utils/db.js";
import User from "./models/userModel.js";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();

    const { httpMethod, path } = event;
    const segments = path.split("/").filter(Boolean);
    // Expected ['.netlify','functions','api-users', ...]
    const apiPath = segments.slice(3);

    if (httpMethod === "GET") {
      if (apiPath.length === 1 && apiPath[0] === "top-sellers") {
        return await getTopSellers();
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Route not found" }),
    };
  } catch (error) {
    console.error("Users function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

const json = (statusCode, data) => ({ statusCode, body: JSON.stringify(data) });

const getTopSellers = async () => {
  const topSellers = await User.find({ isSeller: true })
    .sort({ "seller.rating": -1 })
    .limit(3);
  return json(200, topSellers);
};
