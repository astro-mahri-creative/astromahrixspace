const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const successResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    ...CORS_HEADERS,
  },
  body: JSON.stringify(data),
});

export const errorResponse = (message, statusCode = 500) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    ...CORS_HEADERS,
  },
  body: JSON.stringify({
    message,
    error:
      process.env.NODE_ENV === "development"
        ? message
        : "Something went wrong",
  }),
});

export const corsPreflightResponse = () => ({
  statusCode: 200,
  headers: CORS_HEADERS,
  body: "",
});
