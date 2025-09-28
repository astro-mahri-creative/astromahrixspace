import mongoose from "mongoose";
import dotenv from "dotenv";
import data from "./data.js";
import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";

dotenv.config();

const mongoUri =
  process.env.MONGODB_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost/astromahrixspace";

async function connect() {
  await mongoose.connect(mongoUri);
}

async function disconnect(code = 0) {
  await mongoose.disconnect();
  process.exit(code);
}

async function importData() {
  try {
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // Ensure first user is a seller with profile
    const users = data.users.map((u, idx) => ({
      ...u,
      isSeller: idx === 0 ? true : Boolean(u.isSeller),
      seller:
        idx === 0
          ? {
              name: u.name,
              logo: "/images/logo1.png",
              description: "Default seller account",
              rating: 0,
              numReviews: 0,
            }
          : u.seller,
    }));
    const createdUsers = await User.insertMany(users);
    const seller = createdUsers[0];

    const products = data.products.map((p) => {
      const { _id, ...rest } = p;
      return { ...rest, seller: seller._id };
    });
    const createdProducts = await Product.insertMany(products);

    console.log(
      `Imported: users=${createdUsers.length}, products=${createdProducts.length}`
    );
    await disconnect(0);
  } catch (err) {
    console.error(err);
    await disconnect(1);
  }
}

async function destroyData() {
  try {
    const or = await Order.deleteMany({});
    const pr = await Product.deleteMany({});
    const ur = await User.deleteMany({});
    console.log(
      `Destroyed: orders=${or.deletedCount}, products=${pr.deletedCount}, users=${ur.deletedCount}`
    );
    await disconnect(0);
  } catch (err) {
    console.error(err);
    await disconnect(1);
  }
}

async function run() {
  await connect();
  const env = process.env.NODE_ENV || "development";
  const force = process.argv.includes("--force");
  if (env === "production" && !force) {
    console.error("Refusing to run seeder in production without --force");
    await disconnect(1);
    return;
  }
  if (process.argv.includes("-d") || process.argv.includes("--destroy")) {
    await destroyData();
  } else {
    await importData();
  }
}

run();
