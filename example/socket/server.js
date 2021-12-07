const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const index = require("./index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  socket.on("StartWorkAsync", (event) => {
    console.log({ event });
    socket.emit("Startwork", event);
  });
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("hello", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));
