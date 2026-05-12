const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const path = require("path");
// Load .env from the project root (one level up from scripts folder)
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User.model");

async function createAdmin() {
  try {
    // Get MongoDB URI from environment (must include database name /aegis)
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error("MONGODB_URI not defined in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Delete any existing admin account (optional, for a fresh start)
    const deleted = await User.deleteMany({ role: "admin" });
    if (deleted.deletedCount > 0) {
      console.log(
        `🗑️ Removed ${deleted.deletedCount} existing admin account(s)`,
      );
    }

    // Create admin with plain text password – the model's pre-save hook will encrypt it
    const admin = new User({
      email: "admin@aegis.com",
      password: "admin123", // plain text, will be AES‑encrypted before saving
      role: "admin",
      profile: {
        firstName: "System",
        lastName: "Administrator",
        phone: "1234567890",
      },
      isActive: true,
    });

    await admin.save();
    console.log("\n✅ Admin account created successfully!");
    console.log("📧 Email: admin@aegis.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Role: Admin\n");

    // Verify that the password can be decrypted correctly
    const savedAdmin = await User.findOne({ email: "admin@aegis.com" });
    const isMatch = await savedAdmin.comparePassword("admin123");
    console.log(
      "Password verification test:",
      isMatch ? "✅ PASSED" : "❌ FAILED",
    );

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    if (error.message.includes("MONGODB_URI")) {
      console.log(
        "💡 Make sure your .env file contains MONGODB_URI and JWT_SECRET",
      );
    }
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdmin();
