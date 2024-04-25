import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useFocusEffect } from "@react-navigation/native"
import io from 'socket.io-client';
import { RTCPeerConnection, mediaDevices, RTCView, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';

const Room = () => {
    // Don't use ref for socket because it is not re-render in useEffect when socket is updated
    // const socketRef = useRef();
    const [socket, setSocket] = useState(null);
    const peerConnectionRef = useRef();
    // const localStreamRef = useRef();
    const [localMediaStream, setLocalMediaStream] = useState(null);
    const [remoteStreamURL, setRemoteStreamURL] = useState(null);
    const userId = 'native-1234';
    const roomId = 'room1';

    useFocusEffect(
        useCallback(() => {
            // Do something when the screen is focused

            return () => {
                // Do something when the screen is unfocused
                // Useful for cleanup functions

                if (socket) {
                    console.log('Cleanup native -->');
                    socket.emit('leave-room', { userId, roomId })
                    socket.disconnect();
                    console.log('socket disconnected');
                }

                if (localMediaStream) {
                    localMediaStream.getTracks().forEach(track => track.stop());
                }
            };
        }, [socket])
    );


    useEffect(() => {
        const connection = io('ws://192.168.1.70:3002');
        connection.on('connect', () => {
            console.log('Connected to socket server');
            setSocket(connection);
        });
    }, []);

    useEffect(() => {

        if (!socket) {
            console.log("Socket connection is not established yet");
            return;
        };

        console.log('Joining room');
        socket.emit('join-room', { userId, roomId });

        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.stunprotocol.org',
                    // urls: 'STUN:stun.f.haeder.net:3478',
                }
            ],
        });

        // Request access to the camera
        const constraints = { audio: false, video: { width: 1280, height: 720 } };
        mediaDevices.getUserMedia(constraints)
            .then(stream => {
                console.log('Got MediaStream:', stream);
                setLocalMediaStream(stream);
                stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
            })
            .catch(error => console.error(error));

        socket.on('offer', (data) => {
            const { offer } = data;
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer))
                .then(() => peerConnectionRef.current.createAnswer())
                .then(answer => peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(answer)))
                .then(() => {
                    socket.emit('answer', { userId, answer: peerConnectionRef.current.localDescription, roomId: 'room1' });
                })
                .catch(error => console.error(error));
        });

        socket.on('candidate', (data) => {
            const { candidate } = data;
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', { userId, candidate: event.candidate, roomId: 'room1' });
            }
        };

        // Handle remote stream
        peerConnectionRef.current.ontrack = (event) => {
            console.log('Got remote events --->', event);
            if (event.streams && event.streams[0]) {
                console.log('Got remote stream &&&&&&', event.streams[0]);
                setRemoteStreamURL(event.streams[0].toURL());
            }
        };

        return () => {
            // cleanup is not working here it in useEffect for react native do this in useFocusEffect return function
        };
    }, [socket]);


    useEffect(() => {
        console.log('remoteStreamURL ---12345678----', remoteStreamURL);
    }, [remoteStreamURL]);

    useEffect(() => {
        if (localMediaStream) {
            console.log('localMediaStream ---12345678----', localMediaStream.toURL());
        }
    }, [localMediaStream]);



    return (
        <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: "100%" }}

        >
            <Text>React Native App</Text>
            {localMediaStream && <RTCView streamURL={localMediaStream.toURL()}
                style={{ width: 100, height: 200, backgroundColor: "yellow" }}
            />}
            {remoteStreamURL !== null && <RTCView streamURL={remoteStreamURL}
                style={{ width: 300, height: 200, backgroundColor: "green" }}
            />}
        </View>
    );
};

export default Room;