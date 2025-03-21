const { v4: uuidv4 } = require("uuid");
const { sanitizeMessage } = require("../utils");
const config = require("../config");

// Store user information
const users = new Map();

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
function handleConnection(socket, io) {
  const userId = uuidv4();

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
    id: uuidv4(),
    username: "System",
    text: `${users.get(socket.id).username} has joined the chat`,
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
}

/**
 * Handle username changes
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleChangeUsername(socket, io) {
  socket.on("change_username", (data) => {
    const user = users.get(socket.id);

    if (!user) return;

    const oldUsername = user.username;
    
    user.username = sanitizeMessage(data.username).substring(0, 20);
    users.set(socket.id, user);

    // Notify all users about the username change
    io.emit("message", {
      id: uuidv4(),
      username: "System",
      text: `${oldUsername} changed their name to ${user.username}`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    io.emit("online_users", Array.from(users.values()));
  });
}

/**
 * Handle typing events
 * @param {Object} socket - The socket instance
 * @param {Object} io - Socket.IO server instance
 */
function handleTyping(socket, io) {
  socket.on("typing", (data) => {
    const user = users.get(socket.id);

    if (!user) return;

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
  socket.on("disconnect", () => {
    const user = users.get(socket.id);

    if (!user) {
      return;
    }

    // Remove user from map
    users.delete(socket.id);

    // Notify others that user has left
    io.emit("message", {
      id: uuidv4(),
      username: "System",
      text: `${user.username} has left the chat`,
      timestamp: Date.now(),
      type: "system",
    });

    // Update online users list
    io.emit("online_users", Array.from(users.values()));
  });
}

module.exports = {
  setupSocketHandlers,
};
