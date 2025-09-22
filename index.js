const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("./public"));

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const users = {};

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("register", (username) => {
    users[username] = socket.id;
    socket.username = username;
    console.log(`👤 User registered: ${username} (${socket.id})`);

    io.emit("user-list", Object.keys(users));
  });

  socket.on("private-message", ({ to, message }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      console.log(`📩 ${socket.username} → ${to}: ${message}`);

      io.to(targetSocketId).emit("server-message", {
        from: socket.username,
        message,
      });
    } else {
      socket.emit("server-message", {
        from: "System",
        message: `❌ User "${to}" not found.`,
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit("user-list", Object.keys(users));
      console.log(`❌ ${socket.username} disconnected`);
    }
  });
});

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
