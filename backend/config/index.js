const config = {
  PORT: process.env.PORT || 5000,
  CORS_ORIGIN: ["http://localhost:3000", "http://localhost:3001"],
  CORS_METHODS: ["GET", "POST"],
};

module.exports = config;
