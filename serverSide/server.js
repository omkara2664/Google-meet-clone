const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const logger = require("morgan");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(logger("dev"));
app.use(cors());

io.on("connection", (socket) => {
    console.log("server is connected");
    socket?.on('join-room', (roomId, userId) => {
        console.log(`a new user ${userId} join the room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
    });

    socket.on('user-toggle-audio', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
    });

    socket.on('user-toggle-video', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-video', userId);
    });

    socket.on('leave-room', (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('leave-room', userId);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
