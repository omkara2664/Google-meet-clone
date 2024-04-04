import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/router";

import style from "@/styles/Home.module.css";
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  const createAndJoinRoom = () => {
    const roomId = uuidv4();
    router.push(`/${roomId}`);
  }

  const joinRoom = () => {
    if (roomId) {
      router.push(`/${roomId}`);
    } else {
      alert("Please enter a valid room id");
    }
  }

  return (
    <div className={style.homeContainer}>
      <h1>Google Meet Clone</h1>
      <div className={style.enterRoom}>
        <input
          placeholder='Enter Room ID'
          value={roomId}
          onChange={(e) => setRoomId(e?.target?.value)}
        />
        <button onClick={joinRoom} >Join Room</button>
      </div>
      <span className={style.separatorText}>-------------OR------------</span>
      <button onClick={createAndJoinRoom} >Create a new room</button>
    </div>
  )
}
