import { connectDB } from "./utils/db.js";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await connectDB();

    const { httpMethod, path, body, queryStringParameters } = event;
    const pathSegments = path.split("/").filter(Boolean);
    // Expected: ['.netlify','functions','api-game', ...]
    const apiPath = pathSegments.slice(3); // Remove '.netlify', 'functions', 'api-game'

    switch (httpMethod) {
      case "POST":
        if (apiPath[0] === "frequency-match") {
          return await submitFrequencyScore(JSON.parse(body));
        }
        break;

      case "GET":
        if (apiPath[0] === "progress" && apiPath[1]) {
          return await getGameProgress(apiPath[1]);
        }
        if (apiPath[0] === "unlock-status" && apiPath[1] && apiPath[2]) {
          return await checkUnlockStatus(apiPath[1], apiPath[2]);
        }
        break;

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Method not allowed" }),
        };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Game route not found" }),
    };
  } catch (error) {
    console.error("Game function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

// You'll implement these based on your existing game routes
const submitFrequencyScore = async (data) => {
  // Implementation from backend/routes/gameRoutes.js
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Score submitted", data }),
  };
};

const getGameProgress = async (sessionId) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ sessionId, message: "Progress retrieved" }),
  };
};

const checkUnlockStatus = async (sessionId, productId) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId,
      productId,
      message: "Unlock status checked",
    }),
  };
};
