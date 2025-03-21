// src/app.js
const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

// Initialize Express
const app = express();

// Set up middleware
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: config.CORS_METHODS,
  })
);
app.use(express.json());

// Set up routes
app.use(routes);

module.exports = app;
