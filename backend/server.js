const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
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
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

// Start the server
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));

  // Setup Socket.IO event handlers. Add (message, join, disconnect etc.)
  setupSocketHandlers(io);

  server.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
});