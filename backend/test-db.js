const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 10000, // Set timeout to 10s
  socketTimeoutMS: 45000, // Set socket timeout
}).then(() => {
  console.log("✅ MongoDB Connection Successful");
  process.exit();
}).catch(err => {
  console.error("❌ MongoDB Connection Failed:", err);
  process.exit(1);
});
