const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.MONGO_URI.replace(/\/\/.*@/, "//*****@"));

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("✅ MongoDB Connected");
    console.log(conn.connection.host);

  } catch (err) {
    console.error("❌ FULL ERROR:");
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;