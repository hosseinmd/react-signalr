const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const port = process.env.PORT || 4002;
const index = require("./index");

const app = express();
app.use(index);

const server = http.createServer(app);

const wss = new WebSocketServer({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (event) => {
    ws.send(event.toString());
  });
  const interval = setInterval(() => getApiAndEmit(ws), 1000);
  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.send(JSON.stringify({ message: "hello", date: response }));
};

server.listen(port, () => console.log(`Listening on port ${port}`));
