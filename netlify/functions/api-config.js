import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from "./utils/response.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return corsPreflightResponse();
  }

  const { path } = event;
  const { parseApiPath } = await import("./utils/parsePath.js");
  const apiPath = parseApiPath(path, "config");

  if (event.httpMethod === "GET") {
    if (apiPath[0] === "paypal") {
      return successResponse(
        process.env.PAYPAL_CLIENT_ID || "sb"
      );
    }
    if (apiPath[0] === "google") {
      return successResponse(
        process.env.GOOGLE_API_KEY || ""
      );
    }
  }

  return errorResponse("Route not found", 404);
};
