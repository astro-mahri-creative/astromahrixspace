#!/usr/bin/env node
/**
 * Production Setup Helper Script
 * Helps configure environment variables and verify deployment readiness
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";

dotenv.config();

console.log("🚀 Astro Mahri Space - Production Setup Helper\n");

// Generate secure JWT secret
function generateJWTSecret() {
  return crypto.randomBytes(64).toString("hex");
}

// Validate MongoDB connection
async function testDatabaseConnection(uri) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Database connection successful");
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  console.log("🔍 Checking Environment Variables...\n");

  const required = [
    {
      name: "MONGODB_URI",
      description: "Production database connection string",
    },
    { name: "JWT_SECRET", description: "Secret key for JWT tokens" },
    { name: "PAYPAL_CLIENT_ID", description: "PayPal client ID for payments" },
    { name: "MAILGUN_API_KEY", description: "Mailgun API key for emails" },
    { name: "MAILGUN_DOMIAN", description: "Mailgun domain for emails" },
  ];

  const missing = [];

  required.forEach(({ name, description }) => {
    if (process.env[name]) {
      console.log(`✅ ${name}: Set`);
    } else {
      console.log(`❌ ${name}: Missing - ${description}`);
      missing.push(name);
    }
  });

  return missing;
}

// Main setup function
async function runSetup() {
  // Check environment variables
  const missing = checkEnvironmentVariables();

  console.log("\n🔐 Security Recommendations:");
  console.log(
    "- Generate JWT Secret:",
    generateJWTSecret().substring(0, 32) + "..."
  );
  console.log("- Use strong passwords for database");
  console.log("- Enable MongoDB Atlas IP whitelist");

  if (missing.length === 0) {
    console.log("\n✅ All environment variables configured!");

    if (process.env.MONGODB_URI) {
      console.log("\n🔍 Testing database connection...");
      await testDatabaseConnection(process.env.MONGODB_URI);
    }
  } else {
    console.log(
      `\n❌ Missing ${missing.length} required environment variables`
    );
    console.log("\n📋 Next Steps:");
    console.log("1. Set up MongoDB Atlas cluster");
    console.log("2. Configure environment variables in Netlify Dashboard");
    console.log("3. Run this script again to verify setup");
  }

  console.log("\n🌐 Netlify Environment Variables:");
  console.log(
    "Configure at: https://app.netlify.com/projects/astromahrixspace/settings/deploys#environment-variables"
  );

  console.log("\n📚 Setup Guide:");
  console.log("- MongoDB Atlas: https://cloud.mongodb.com");
  console.log("- PayPal Developer: https://developer.paypal.com");
  console.log("- Mailgun: https://www.mailgun.com");
}

// Run the setup
runSetup().catch(console.error);
