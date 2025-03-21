const config = {
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  CORS_METHODS: ["GET", "POST"],
};

module.exports = config;
