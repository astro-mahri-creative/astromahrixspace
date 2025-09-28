import http from "http"; // nodemon touch
import { Server } from "socket.io";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import productRouter from "./routers/productRouter.js";
import userRouter from "./routers/userRouter.js";
import orderRouter from "./routers/orderRouter.js";
import uploadRouter from "./routers/uploadRouter.js";
import gameRouter from "./routers/gameRouter.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent crashes on unhandled errors during development; log and keep server alive for /health
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

const mongoUri =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost/astromahrixspace";
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});
app.use("/api/uploads", uploadRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/game", gameRouter);
app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});
app.get("/api/config/google", (req, res) => {
  res.send(process.env.GOOGLE_API_KEY || "");
});
// Health check endpoint
app.get("/health", async (req, res) => {
  const uptime = process.uptime();
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const healthy = dbState === 1;
  const payload = {
    status: healthy ? "ok" : "degraded",
    uptime: Math.round(uptime),
    timestamp: new Date().toISOString(),
    db: {
      state: dbState,
      uri: (
        process.env.MONGODB_URL ||
        process.env.MONGODB_URI ||
        "mongodb://localhost/astromahrixspace"
      ).replace(/:\/\/.+@/, "://***:***@"),
    },
    env: process.env.NODE_ENV || "development",
  };
  res.status(healthy ? 200 : 503).send(payload);
});
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"))
);
// app.get('/', (req, res) => {
//   res.send('Server is ready');
// });

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const users = [];

io.on("connection", (socket) => {
  console.log("connection", socket.id);
  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log("Offline", user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });
  socket.on("onLogin", (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };
    const existUser = users.find((x) => x._id === updatedUser._id);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    console.log("Online", user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.isAdmin) {
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  socket.on("onUserSelected", (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });

  socket.on("onMessage", (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        io.to(user.socketId).emit("message", message);
        user.messages = user.messages || [];
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x._id === message._id && x.online);
        if (user) {
          user.messages = user.messages || [];
          user.messages.push(message);
        }
      } else {
        io.to(socket.id).emit("message", {
          name: "Admin",
          body: "Sorry. I am not online right now",
        });
      }
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Serve at http://localhost:${port}`);
});

// app.listen(port, () => {
//   console.log(`Serve at http://localhost:${port}`);
// });
