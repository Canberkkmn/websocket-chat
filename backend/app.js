const express = require("express");
const cors = require("cors");
const config = require("./config");
const routes = require("./routes");

const app = express();

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: config.CORS_METHODS,
  })
);
app.use(express.json());

app.use(routes);

module.exports = app;
