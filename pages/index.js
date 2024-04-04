import { useEffect } from "react";
import { useSocket } from "@/context/socket"

export default function Home() {
  const socket = useSocket();

  useEffect(() => {
    console.log("hello asdf");
    socket?.on("connect", () => {
      console.log(socket.id);
    });
  }, [socket]);

  return (
    <div>Welcome</div>
  )
}
