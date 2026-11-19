const mongoose = require("mongoose");

function maskMongoUri(uri) {
  if (!uri) return "";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, "$1*****$3");
}

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const isProduction = process.env.NODE_ENV === "production";
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const dbName = process.env.MONGO_DB_NAME || "ranaji";

  if (!uri) {
    if (isProduction) {
      console.error("❌ [FATAL] MONGO_URI is not defined in production environment variables.");
      console.error("❌ Production must connect to MongoDB Atlas. In-memory database fallback is disabled in production.");
      throw new Error("MONGO_URI environment variable is required in production. In-memory fallback is disabled.");
    }

    console.warn("⚠️ MONGO_URI is not defined in environment variables.");
    console.log("ℹ️ Attempting in-memory database fallback for local development / test...");
    try {
      const memoryDB = require("./db-memory");
      return await memoryDB();
    } catch (e) {
      console.warn("⚠️ In-memory database unavailable. Continuing with local API adapters.");
      return null;
    }
  }

  try {
    const masked = maskMongoUri(uri);
    console.log("Connecting to MongoDB:", masked);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      dbName: dbName
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB Connection failed:", err.message);

    if (isProduction) {
      console.error("❌ [FATAL] Production database connection to MongoDB Atlas failed.");
      console.error("❌ In-memory database fallback is disabled in production.");
      throw new Error(`Production MongoDB Atlas connection failed: ${err.message}`);
    }

    try {
      const memoryDB = require("./db-memory");
      console.log("ℹ️ Falling back to in-memory MongoDB for local development / test...");
      return await memoryDB();
    } catch (e) {
      console.warn("⚠️ Running in offline database mode.");
      return null;
    }
  }
};

module.exports = connectDB;
