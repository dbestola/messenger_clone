const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://olanrewajuoladimeji5:KVUoWJoASKFRwKLN@cluster0.btemb6a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
