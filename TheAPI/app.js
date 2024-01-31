require("dotenv").config();

// Environment Variables Validation
if (
  !process.env.ACCESS_TOKEN_SECRET ||
  !process.env.REFRESH_TOKEN_SECRET ||
  !process.env.MONGOURI ||
  !process.env.PORT
) {
  console.error("Missing environment variables");
  process.exit(1);
}

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const socket = require("./config/socket");

const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cors = require("cors");
const router = require("./routes/index.js");

const uri = process.env.MONGOURI;

mongoose
  .connect(uri)
  .then(() => console.log("You successfully connected to MongoDB!"))
  .catch((err) => console.error("Connection error", err));

// Call the function exported from socket.js with the io object
socket(io);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// allow io object to be accessed from the req object in the routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(router);

const port = process.env.PORT || 8000;
server.listen(port, () => console.log(`Listening on port ${port}`));
