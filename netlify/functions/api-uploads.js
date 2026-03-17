import { isAuth } from "./utils/auth.js";
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from "./utils/response.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return corsPreflightResponse();
  }

  const user = isAuth(event);
  if (!user) {
    return errorResponse("Not authorized", 401);
  }

  if (event.httpMethod === "POST") {
    // In a serverless environment, file uploads should go through
    // a cloud storage service (e.g., Cloudinary, S3, Netlify Blobs).
    // This endpoint returns a placeholder response.
    // For production, integrate with your preferred storage provider.
    return successResponse({
      message: "Upload endpoint active. Configure cloud storage for production.",
      note: "Use Cloudinary or S3 presigned URLs for file uploads in serverless.",
    });
  }

  return errorResponse("Method not allowed", 405);
};
