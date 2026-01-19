const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("./public"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  transports: ["websocket"],
});

const checkboxState = new Array(100).fill(false);

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("checkbox-update", ({ index, value }) => {
    checkboxState[index] = value;

    socket.broadcast.emit("state-changed");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

app.get("/state", (req, res) => {
  res.json({ checkboxState });
});

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
