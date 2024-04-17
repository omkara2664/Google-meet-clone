import { useSocket } from '@/context/socket';
import { cloneDeep } from 'lodash';
import { useRouter } from 'next/router';
import { useState } from 'react';

const usePlayer = (myId, roomId, peer) => {
    const socket = useSocket();
    const [players, setPlayers] = useState({});
    const router = useRouter();

    // Here we created deep copy of players object and then we delete the myId from the object
    const playersCopy = cloneDeep(players);
    const playerHighlighted = playersCopy[myId];
    delete playersCopy[myId];
    const nonHighlightedPlayers = playersCopy;

    const leaveRoom = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        socket.emit('leave-room', myId, roomId);
        console.log("Leaving room", roomId);
        peer?.disconnect();
        router.push('/');
    };

    const toggleAudio = () => {
        console.log("I toggle my audio");
        setPlayers((prev) => {
            const copy = cloneDeep(prev);
            copy[myId].muted = !copy[myId].muted;
            return { ...copy };
        })
        socket.emit('user-toggle-audio', myId, roomId);
    }
    const toggleVideo = () => {
        console.log("I toggle my video");
        setPlayers((prev) => {
            const copy = cloneDeep(prev);
            copy[myId].playing = !copy[myId].playing;
            return { ...copy };
        })
        socket.emit('user-toggle-video', myId, roomId);
    }

    return {
        players,
        setPlayers,
        playerHighlighted,
        nonHighlightedPlayers,
        toggleAudio,
        toggleVideo,
        leaveRoom
    }
}

export default usePlayer;