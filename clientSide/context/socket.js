// import { createContext, useContext, useEffect, useState } from "react";
// import io from "socket.io-client";

// const SocketContext = createContext(null);

// export const useSocket = () => {
//     const socket = useContext(SocketContext);
//     return socket;
// }

// export const SocketProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);

//     useEffect(() => {
//         // const connection = io("http://localhost:3002");
//         // const connection = io.connect("wss://mytypingwala.com", {
//         //     path: "/api"
//         // });
//         const connection = io("wss://mytypingwala.com");
//         setSocket(connection);
//     }, []);

//     socket?.on("connect_error", async (err) => {
//         console.log("Error establishing socket", err);
//         await fetch('/api/socket');
//     })

//     return (
//         <SocketContext.Provider value={socket}>
//             {children}
//         </SocketContext.Provider>
//     )
// };

import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Configure socket.io-client to use the desired path
        const ip = 'wss://mytypingwala.com'
        // const ip = 'ws://localhost:3002'
        const connection = io.connect(ip, {
            path: "/api/socket.io/"
        });
        connection.on("connect", () => {
            console.log("Connected to socket server");
        });
        setSocket(connection)

        return () => {
            // Clean up socket connection on component unmount
            connection.disconnect();
        };
    }, []);

    socket?.on("connect_error", async (err) => {
        console.log("Error establishing socket", err);
        await fetch('/api/socket');
    });

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
