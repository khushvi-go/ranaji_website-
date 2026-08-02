require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/database");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@ranaji.com",
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists.");
      process.exit();
    }

    const admin = new User({
      name: "Ranaji Admin",
      email: "admin@ranaji.com",
      password: "ChangeMe123!",
      role: "admin",
      provider: "local",
      emailVerified: true,
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@ranaji.com");
    console.log("Password: ChangeMe123!");

    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();