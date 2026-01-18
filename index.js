const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("./public"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  transports: ["websocket"],
});

const checkboxState = {};

io.on("connection", (socket) => {
  io.emit("active-users", io.engine.clientsCount);
  socket.emit("initial-state", checkboxState);

  socket.on("user-joined", (username) => {
    socket.username = username;
    socket.emit("enable-inputs");
  });

  socket.on("client-message", (element, value, username) => {
    checkboxState[element] = value;
    socket.broadcast.emit("server-message", element, value, username);
    socket.emit("server-message", element, value, username);
  });

  socket.on("disconnect", () => {
    io.emit("active-users", io.engine.clientsCount);
  });
});

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
