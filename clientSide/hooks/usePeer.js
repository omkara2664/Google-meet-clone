import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

const usePeer = () => {
    const socket = useSocket();
    const roomId = useRouter().query.roomId;
    const [peer, setPeer] = useState(null);
    const [myId, setMyId] = useState('');
    const isPeerSet = useRef(false);

    useEffect(() => {
        if (isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;

        /** This is written by Omkar  :))
         * Why we are importing here
         * Because we are doing SSR in next js
         * wy is in useEffect -> because peerjs need to navigator (navigator is not defined) and navigator is a web api
         */

        let myPeer;
        (async function initPeer() {
            // For local peer
            // myPeer = new (await import('peerjs')).default();  // whatever default we imported and () this means we are calling the constructor

            // For online peer

            myPeer = new (await import('peerjs')).default('', {
                host: '0.peerjs.com',
                secure: true,
            });

            // const myPeer = new Peer(undefined, {
            //     host: 'peerjs-server.herokuapp.com',
            //     secure: true,
            // });

            setPeer(myPeer);

            myPeer.on('open', (id) => {
                console.log('Your peer id is', id);
                setMyId(id);
                socket?.emit('join-room', roomId, id)
            })
        })();

    }, [roomId, socket]);

    return {
        peer,
        myId
    }
}

export default usePeer;