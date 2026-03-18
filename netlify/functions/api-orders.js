import { connectDB } from "./utils/db.js";
import { Order } from "../../shared/models/Order.js";
import { User } from "../../shared/models/User.js"; // Register User model for populate("user")
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

    const { httpMethod, path, body, queryStringParameters } = event;
    const apiPath = parseApiPath(path, "orders");

    // All order routes require authentication
    const user = isAuth(event);

    switch (httpMethod) {
      case "POST":
        if (apiPath.length === 0) {
          if (!user) return errorResponse("Not authorized", 401);
          return await createOrder(user, JSON.parse(body));
        }
        break;

      case "GET":
        if (apiPath[0] === "mine") {
          if (!user) return errorResponse("Not authorized", 401);
          return await getMyOrders(user._id);
        }
        if (apiPath[0] === "summary") {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await getOrderSummary();
        }
        // Admin: list all orders
        if (apiPath.length === 0) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await listOrders(queryStringParameters);
        }
        // Get order by ID
        if (apiPath.length === 1) {
          if (!user) return errorResponse("Not authorized", 401);
          return await getOrderById(apiPath[0], user);
        }
        break;

      case "PUT":
        // /:id/pay
        if (apiPath.length === 2 && apiPath[1] === "pay") {
          if (!user) return errorResponse("Not authorized", 401);
          return await payOrder(apiPath[0], JSON.parse(body));
        }
        // /:id/deliver
        if (apiPath.length === 2 && apiPath[1] === "deliver") {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await deliverOrder(apiPath[0]);
        }
        break;

      case "DELETE":
        if (apiPath.length === 1) {
          const admin = isAdmin(event);
          if (!admin) return errorResponse("Not authorized as admin", 401);
          return await deleteOrder(apiPath[0]);
        }
        break;

      default:
        return errorResponse("Method not allowed", 405);
    }

    return errorResponse("Route not found", 404);
  } catch (error) {
    console.error("Orders function error:", error);
    return errorResponse(error.message);
  }
};

const createOrder = async (user, orderData) => {
  if (!orderData.orderItems || orderData.orderItems.length === 0) {
    return errorResponse("No order items", 400);
  }

  const order = new Order({
    orderItems: orderData.orderItems,
    user: user._id,
    shippingAddress: orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    itemsPrice: orderData.itemsPrice,
    shippingPrice: orderData.shippingPrice,
    taxPrice: orderData.taxPrice,
    totalPrice: orderData.totalPrice,
  });

  const createdOrder = await order.save();
  return successResponse({ message: "New Order Created", order: createdOrder }, 201);
};

const getOrderById = async (id, user) => {
  const order = await Order.findById(id);
  if (!order) return errorResponse("Order Not Found", 404);

  // Allow access if user owns the order or is admin
  if (order.user.toString() !== user._id.toString() && !user.isAdmin) {
    return errorResponse("Not authorized to view this order", 401);
  }

  return successResponse(order);
};

const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return successResponse(orders);
};

const payOrder = async (id, paymentResult) => {
  const order = await Order.findById(id);
  if (!order) return errorResponse("Order Not Found", 404);

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: paymentResult.id,
    status: paymentResult.status,
    update_time: paymentResult.update_time,
    email_address: paymentResult.email_address,
  };

  const updatedOrder = await order.save();
  return successResponse({ message: "Order Paid", order: updatedOrder });
};

const deliverOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) return errorResponse("Order Not Found", 404);

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();
  return successResponse({ message: "Order Delivered", order: updatedOrder });
};

const listOrders = async (query = {}) => {
  const seller = query.seller || "";
  const sellerFilter = seller ? { seller } : {};

  const orders = await Order.find(sellerFilter)
    .populate("user", "name")
    .sort({ createdAt: -1 });
  return successResponse(orders);
};

const deleteOrder = async (id) => {
  const order = await Order.findById(id);
  if (!order) return errorResponse("Order Not Found", 404);

  await order.deleteOne();
  return successResponse({ message: "Order Deleted" });
};

const getOrderSummary = async () => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        numOrders: { $sum: 1 },
        totalSales: { $sum: "$totalPrice" },
      },
    },
  ]);

  const users = await Order.aggregate([
    {
      $group: {
        _id: "$user",
      },
    },
    {
      $group: {
        _id: null,
        numUsers: { $sum: 1 },
      },
    },
  ]);

  const dailyOrders = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        sales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const productCategories = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.name",
        count: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return successResponse({
    orders: orders.length > 0 ? orders[0] : { numOrders: 0, totalSales: 0 },
    users: users.length > 0 ? users[0] : { numUsers: 0 },
    dailyOrders,
    productCategories,
  });
};
