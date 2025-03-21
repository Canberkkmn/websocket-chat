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

/**
 * Setup Socket.IO event handlers. Add (message, join, disconnect etc.)
 */
setupSocketHandlers(io);

// Start the server
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
