const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");

// This must be the EXACT same secret that is set on Render
const SECRET = "aegis_super_secret_key_2024_secure";

// Your Atlas connection string (must include the database name /aegis)
const MONGO_URI =
  "mongodb+srv://laica060105_db_user:zfq23XgasYNKZUAT@cluster0.47a3p7n.mongodb.net/aegis?retryWrites=true&w=majority";

async function fixAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    const User = require("./models/User.model");

    const admin = await User.findOne({ email: "admin@aegis.com" });
    if (!admin) {
      console.log("Admin not found");
      process.exit(1);
    }

    // Re-encrypt with the correct secret
    const newEncrypted = CryptoJS.AES.encrypt("admin123", SECRET).toString();
    admin.password = newEncrypted;
    await admin.save();

    console.log("✅ Admin password updated successfully.");
    console.log("New hash:", newEncrypted);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Error:", err);
  }
}

fixAdmin();
