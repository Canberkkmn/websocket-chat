const config = {
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: "http://localhost:3002",
  CORS_METHODS: ["GET", "POST"],
};

module.exports = config;
