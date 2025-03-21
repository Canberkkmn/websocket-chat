const { v4: uuidv4 } = require("uuid");
const { sanitizeMessage } = require("../utils");
const config = require("../config");
const redisClient = require("../utils/redisClient");

/**
 * Helper to get all online users from Redis
 */
async function getOnlineUsers() {
  const onlineUsersMap = await redisClient.hGetAll("online_users");

  return Object.values(onlineUsersMap).map((json) => JSON.parse(json));
}

/**
 * When socket connects, set up event handlers
 * @param {Object} io - Socket.IO server instance
 */
function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`[Server ${config.PORT}] New connection: ${socket.id}`);

    handleConnection(socket, io);
    handleSendMessage(socket, io);
    handleChangeUsername(socket, io);
    handleTyping(socket, io);
    handleDisconnect(socket, io);
  });
}

/**
 * Handle new user connections
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
async function handleConnection(socket, io) {
  const userId = socket.handshake.auth.userId || uuidv4();
  const username = `Guest-${userId.substring(0, 5)}`;

  const userData = {
    id: userId,
    username,
  };

  await redisClient.hSet("online_users", socket.id, JSON.stringify(userData));

  // Send initial connection info
  socket.emit("connection_established", {
    userId,
    username: userData.username,
  });

  // Update online users list for everyone
  const onlineUsers = await getOnlineUsers();

  io.emit("online_users", onlineUsers);

  // Welcome message
  io.emit("message", {
    id: uuidv4(),
    username: "System",
    text: `${username} has joined the chat`,
    timestamp: Date.now(),
    type: "system",
  });
}

/**
 * Handle user message sending
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleSendMessage(socket, io) {
  socket.on("send_message", async (messageData) => {
    const raw = await redisClient.hGet("online_users", socket.id);

    if (!raw) return;

    const user = JSON.parse(raw);

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
}

/**
 * Handle username changes
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleChangeUsername(socket, io) {
  socket.on("change_username", async (data) => {
    const raw = await redisClient.hGet("online_users", socket.id);

    if (!raw) return;

    const user = JSON.parse(raw);
    const oldUsername = user.username;

    user.username = sanitizeMessage(data.username).substring(0, 20);

    await redisClient.hSet("online_users", socket.id, JSON.stringify(user));

    // Notify all users about the username change
    io.emit("message", {
      id: uuidv4(),
      username: "System",
      text: `${oldUsername} changed their name to ${user.username}`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    const onlineUsers = await getOnlineUsers();

    io.emit("online_users", onlineUsers);
  });
}

/**
 * Handle typing events
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleTyping(socket, io) {
  socket.on("typing", async (data) => {
    const raw = await redisClient.hGet("online_users", socket.id);

    if (!raw) return;

    const user = JSON.parse(raw);

    socket.broadcast.emit("user_typing", {
      userId: user.id,
      username: user.username,
      isTyping: data.isTyping,
    });
  });
}

/**
 * Handle user disconnections
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleDisconnect(socket, io) {
  socket.on("disconnect", async () => {
    const raw = await redisClient.hGet("online_users", socket.id);

    if (!raw) return;

    const user = JSON.parse(raw);

    await redisClient.hDel("online_users", socket.id);

    // Notify others that user has left
    io.emit("message", {
      id: uuidv4(),
      username: "System",
      text: `${user.username} has left the chat`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    const onlineUsers = await getOnlineUsers();

    io.emit("online_users", onlineUsers);
  });
}

module.exports = {
  setupSocketHandlers,
};
