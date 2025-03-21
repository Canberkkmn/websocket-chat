// src/server.js
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const config = require("./config");
const { setupSocketHandlers } = require("./socketHandlers");

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: config.CORS_ORIGIN,
    methods: config.CORS_METHODS,
  },
});

// Set up socket handlers
setupSocketHandlers(io);

// Start the server
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
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
