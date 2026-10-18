const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️ MONGO_URI is not defined in environment variables.");
    console.log("ℹ️ Attempting in-memory database fallback...");
    try {
      const memoryDB = require("./db-memory");
      return await memoryDB();
    } catch (e) {
      console.warn("⚠️ In-memory database unavailable. Continuing with local API adapters.");
      return null;
    }
  }

  try {
    const masked = uri.replace(/\/\/.*@/, "//*****@");
    console.log("Connecting to MongoDB:", masked);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("✅ MongoDB Connected:", conn.connection.host);
    return conn;
  } catch (err) {
    console.warn("⚠️ MongoDB Connection failed:", err.message);
    try {
      const memoryDB = require("./db-memory");
      console.log("ℹ️ Falling back to in-memory MongoDB...");
      return await memoryDB();
    } catch (e) {
      console.warn("⚠️ Running in offline database mode.");
      return null;
    }
  }
};

module.exports = connectDB;