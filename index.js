const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(express.static("./public"));

const httpServer = http.createServer(app);

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("message", (message) => {
    io.emit("server-message", message);
  });
});

const PORT = process.env.PORT ?? 3000;

httpServer.listen(PORT, () => {
  console.log(`httpServer is running on this port: ${PORT}`);
});
