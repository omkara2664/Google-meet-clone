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
        });
    }
    res.end();
}

export default SocketHandler;