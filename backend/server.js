const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

// Configuration
const PORT = process.env.PORT || 5000;

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3002",
    methods: ["GET", "POST"],
  },
});

// Store user information
const users = new Map();

// Handle socket connections
io.on("connection", (socket) => {
  const userId = uuidv4();

  console.log(`User connected: ${userId}`);

  // Set default username
  users.set(socket.id, {
    id: userId,
    username: `Guest-${userId.substring(0, 5)}`,
  });

  // Send initial connection info
  socket.emit("connection_established", {
    userId,
    username: users.get(socket.id).username,
  });

  // Update online users list for everyone
  io.emit("online_users", Array.from(users.values()));

  // Welcome message
  io.emit("message", {
    id: "system",
    username: "System",
    text: `${users.get(socket.id).username} has joined the chat`,
    timestamp: Date.now(),
    type: "system",
  });

  // Handle incoming messages
  socket.on("send_message", (messageData) => {
    const user = users.get(socket.id);

    if (!user) return;

    const messageObject = {
      id: uuidv4(),
      userId: user.id,
      username: user.username,
      text: sanitizeMessage(messageData.text),
      timestamp: Date.now(),
      type: "user",
    };

    // Broadcast message to all users
    io.emit("message", messageObject);
  });

  // Handle username changes
  socket.on("change_username", (data) => {
    const user = users.get(socket.id);

    if (!user) return;

    const oldUsername = user.username;
    user.username = sanitizeMessage(data.username).substring(0, 20);
    users.set(socket.id, user);

    // Notify all users about the username change
    io.emit("message", {
      id: "system",
      username: "System",
      text: `${oldUsername} changed their name to ${user.username}`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    io.emit("online_users", Array.from(users.values()));
  });

  // Handle typing events
  socket.on("typing", (data) => {
    const user = users.get(socket.id);

    if (!user) return;

    socket.broadcast.emit("user_typing", {
      userId: user.id,
      username: user.username,
      isTyping: data.isTyping,
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (!user) return;

    console.log(`User disconnected: ${user.id}`);

    // Remove user from map
    users.delete(socket.id);

    // Notify others that user has left
    io.emit("message", {
      id: "system",
      username: "System",
      text: `${user.username} has left the chat`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    io.emit("online_users", Array.from(users.values()));
  });
});

// Basic sanitization function to prevent XSS
function sanitizeMessage(message) {
  return message
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");

  // Close server
  server.close(() => {
    console.log("Server shut down successfully");
    process.exit(0);
  });
});
