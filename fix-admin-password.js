// save as fix-admin-password.js
const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const User = require("./models/User.model");

const mongoURI =
  "mongodb+srv://laica060105_db_user:zfq23XgasYNKZUAT@cluster0.47a3p7n.mongodb.net/aegis?retryWrites=true&w=majority";
const secret = process.env.JWT_SECRET; // must be the same as on Render

async function fixAdmin() {
  await mongoose.connect(mongoURI);
  const admin = await User.findOne({ email: "admin@aegis.com" });
  if (admin) {
    const newEncrypted = CryptoJS.AES.encrypt("admin123", secret).toString();
    admin.password = newEncrypted;
    await admin.save();
    console.log("Admin password re-encrypted with the provided secret.");
  } else {
    console.log("Admin not found.");
  }
  await mongoose.disconnect();
}

fixAdmin();
