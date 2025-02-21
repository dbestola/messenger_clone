require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");


const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000, // Set timeout to 10s
    socketTimeoutMS: 45000, // Set socket timeout
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Create an object to track user statuses
let usersOnline = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  // Add the user to the online users list
  socket.on("setUser", (userId) => {
    usersOnline[userId] = { socketId: socket.id, status: "online" };
    // Emit the updated status to all clients
    io.emit("updateUserStatus", usersOnline);
  });

  // Handle message sending
  socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create(data); // Save message to database
      io.emit("receiveMessage", message); // Emit saved message to all clients
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnection
  socket.on("userDisconnect", (userId) => {
    console.log(`${userId} disconnected`);

    // Find and remove the user from the online users list
    for (const [user, data] of Object.entries(usersOnline)) {
      if (data.socketId === socket.id) {
        // Mark the user as offline
        usersOnline[user].status = "offline";
        break;
      }
    }

    // Emit the updated user statuses to all clients
    io.emit("updateUserStatus", usersOnline);
  });

});

// Use process.env.PORT for deployment
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
