import { useSocket } from "@/context/socket"
import usePeer from "@/hooks/usePeer";
import useMediaStream from "@/hooks/useMediaStream";
import Player from "@/component/Player";
import { useEffect, useState } from "react";
import usePlayer from "@/hooks/usePlayer";
import styles from "@/styles/room.module.css";
import { useRouter } from "next/router";
import Bottom from "@/component/Bottom";
import { cloneDeep } from "lodash";
import CopySection from "@/component/CopySection";

const Room = () => {
    const socket = useSocket();
    const { roomId } = useRouter().query;
    const { peer, myId } = usePeer();
    const { stream } = useMediaStream();
    const { players, setPlayers, playerHighlighted, nonHighlightedPlayers, toggleAudio, toggleVideo, leaveRoom } = usePlayer(myId, roomId, peer, socket);  // Why I passing the myId because I want to same myId in the players object if there I will call peerHook then it will return new peer id.  But we are using the older one

    // for handling the disconnect users we need to explicitly remove connection with this user
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Incoming call
        // Some one join the room. Here we will get there screen 
        if (!socket || !peer || !stream) return;
        const handleUserConnected = (newUSer) => {
            console.log(`new user connected in room with userId is ${newUSer}`);
            const call = peer.call(newUSer, stream);

            call.on('stream', (incomingStream) => {
                console.log(`Incoming stream from ${newUSer}`);
                setPlayers((prev) => {
                    return {
                        ...prev,
                        [newUSer]: {
                            url: incomingStream,
                            muted: true,
                            playing: true
                        }
                    }
                });

                // For close the connection in future we will store the users in the state;
                setUsers((prev) => ({
                    ...prev,
                    [newUSer]: call
                }));
            });
        };
        socket.on('user-connected', handleUserConnected);

        return () => {
            socket.off('user-connected', handleUserConnected);
        }
    }, [socket, peer, stream, setPlayers]);


    useEffect(() => {
        // Some one call me. Here we will get there screen. Here we will receive the offer
        if (!peer || !stream) return;
        peer.on('call', (call) => {
            const { peer: callerId } = call;
            call.answer(stream);

            call.on('stream', (incomingStream) => {
                console.log(`Incoming stream form ${callerId}`);
                setPlayers((prev) => {
                    return {
                        ...prev,
                        [callerId]: {
                            url: incomingStream,
                            muted: true,
                            playing: true  // playing the video
                        }
                    }
                });

                setUsers((prev) => ({
                    ...prev,
                    [callerId]: call
                }));

            });
        })
    }, [peer, stream, setPlayers]);

    useEffect(() => {
        // In this useEffect we will set multiple user stream in one array or in one room
        if (!stream || !myId) return;
        console.log(`setting my stream ${myId}`);

        setPlayers((prev) => {
            return {
                ...prev,
                [myId]: {
                    url: stream,
                    muted: true,
                    playing: true  // playing the video
                }
            }
        });
    }, [myId, stream, setPlayers]);

    useEffect(() => {
        // Control panel stuff;
        if (!socket) return;
        const handleToggleAudio = (userId) => {
            console.log(`User with id ${userId} toggled audio`);
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].muted = !copy[userId].muted;
                return { ...copy };
            });
        }

        const handleToggleVideo = (userId) => {
            console.log(`User with id ${userId} toggled video`);
            setPlayers((prev) => {
                const copy = cloneDeep(prev);
                copy[userId].playing = !copy[userId].playing;
                return { ...copy };
            });
        };

        const handleUserLeave = (userId) => {
            console.log(`User with id ${userId} left the room`);
            users[userId]?.close(); // we are store the call object in setUsers. So with this call object they provide the close() by default
            const playersCopy = cloneDeep(players);
            delete playersCopy[userId];
            setPlayers(playersCopy);
        };

        socket.on('user-toggle-audio', handleToggleAudio);
        socket.on('user-toggle-video', handleToggleVideo);
        socket.on('leave-room', handleUserLeave);

        return () => {
            socket.off('user-toggle-audio', handleToggleAudio);
            socket.off('user-toggle-video', handleToggleVideo);
            socket.off('leave-room', handleUserLeave);
        }
    }, [players, setPlayers, socket, users]);

    return (
        <>
            <div className={styles.activePlayerContainer}>
                {playerHighlighted &&
                    <Player
                        url={playerHighlighted.url}
                        muted={playerHighlighted.muted}
                        playing={playerHighlighted.playing}
                        x isActive
                    />
                }
            </div>
            <div className={styles.inActivePlayerContainer}>
                {Object.keys(nonHighlightedPlayers)?.map((playerId) => {
                    const { url, muted, playing } = nonHighlightedPlayers[playerId];
                    return (<Player
                        key={playerId}
                        url={url}
                        muted={muted}
                        playing={playing}
                        isActive={false}
                    />)
                })}
            </div>
            <CopySection roomId={roomId} />
            <Bottom
                muted={playerHighlighted?.muted}
                playing={playerHighlighted?.playing}
                toggleAudio={toggleAudio}
                toggleVideo={toggleVideo}
                leaveRoom={leaveRoom}
            />
        </>
    )
}

export default Room;