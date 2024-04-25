const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
var morgan = require('morgan');
const { ExpressPeerServer } = require("peer");

const app = express();

const server = http.createServer(app);

const PORT = 3002;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


/** Socket server */
const io = socketIo(server, {
    // path: "/api/socket.io/", // Specify the path here
    transports: ["websocket", "polling"],
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },

}, { 'force new connection': true });


console.log("let's build the world !");

io.on("connection", (socket) => {
    console.log("Socket Server is connected");

    socket.on('join-room', (data) => {
        const { userId, roomId } = data;
        console.log(`A new user ${userId} joined the room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        users = io.sockets.adapter.rooms.get(roomId);
        console.log("users in the room", users);
    });

    socket.on('offer', (data) => {
        const { userId, roomId, offer } = data;
        console.log(`Offer received from ${userId} in room ${roomId}`);
        socket.broadcast.to(roomId).emit('offer', { userId, offer });
    });

    socket.on('answer', (data) => {
        const { userId, roomId, answer } = data;
        console.log(`Answer received from ${userId} in room ${roomId}`);
        socket.to(roomId).emit('answer', { userId, answer });
    });

    socket.on('user-toggle-audio', (data) => {
        const { userId, roomId } = data;
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
    });

    socket.on('user-toggle-video', (data) => {
        const { userId, roomId } = data;
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-toggle-video', userId);
    });

    socket.on('candidate', (data) => {
        const { userId, roomId, candidate } = data;
        console.log(`Candidate received from ${userId} in room ${roomId}`);
        socket.to(roomId).emit('candidate', { userId, candidate });
    });

    socket.on('leave-room', (data) => {
        const { userId, roomId } = data;
        socket.broadcast.to(roomId).emit('leave-room', userId);
        console.log(`User ${userId} left the room ${roomId}`);
    });


});


/** Peer Server */
// const customerGenerationFunction = () => {
//     return (Math.random().toString(36) + "000000000000000000000").substring(2, 16);
// };
// const peerServer = ExpressPeerServer(server, {
//     dubug: true,
//     path: "/mypeer",
//     generateClientId: customerGenerationFunction
// });

// app.use("/api", peerServer);

// peerServer.on("connection", (client) => {
//     console.log(`Client connected ${client.getId()}`);

// });

// peerServer.on("disconnect", (client) => {
//     console.log(`Client disconnected ${client.getId()}`);
// });



server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});