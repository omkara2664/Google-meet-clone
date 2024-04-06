import { Server } from "socket.io";
const SocketHandler = (req, res) => {
    console.log("api called");
    if (res.socket.server.io) {  // this avoid the multiple socket connection from the same client
        console.log("socket server is already attached");
    } else {
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

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
    }
    res.end();
}

export default SocketHandler;