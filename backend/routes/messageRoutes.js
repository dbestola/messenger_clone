const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Send Message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;
    const newMessage = new Message({ sender, receiver, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Messages
router.get("/:userId/:receiverId", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.params.userId, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.params.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
