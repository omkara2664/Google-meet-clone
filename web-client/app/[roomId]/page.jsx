"use client"
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const Page = () => {
    const [socket, setSocket] = useState(null);
    const { roomId } = useParams();
    const router = useRouter();
    const userId = "web-1234";

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef();

    const localStream = useRef();


    const handleBack = () => {
        router.push('/');
    };

    useEffect(() => {
        const newSocket = io('http://192.168.1.70:3002');
        newSocket.on('connect', () => {
            console.log('Connected to server');
            setSocket(newSocket);
        });
    }, []);



    useEffect(() => {

        if (!socket) {
            console.log('Socket not connected yet');
            return;
        }

        console.log("asdfasdf");

        socket.emit('join-room', { userId, roomId });

        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [
                {
                    urls: 'stun:stun.stunprotocol.org',
                    // urls: 'STUN:stun.f.haeder.net:3478',
                },
                // {
                //     urls: 'turn:numb.viagenie.ca',
                //     // credential: 'muazkh',
                // }
            ],
        });

        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
                localStream.current = stream;
                console.log('Local stream is -->', stream);
                return peerConnectionRef.current.createOffer();
            })
            .then(offer => peerConnectionRef.current.setLocalDescription(new RTCSessionDescription(offer)))
            .then(() => {
                socket.emit('offer', { userId, offer: peerConnectionRef.current.localDescription, roomId });
            })
            .catch(error => console.error(error));

        socket.on('answer', (data) => {
            const { answer } = data;
            // console.log('Answer received', data.answer);
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('candidate', (data) => {
            const { candidate } = data;
            peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', { userId, candidate: event.candidate, roomId });
            }
        };

        // Handle remote stream
        peerConnectionRef.current.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                console.log('Remote stream received', event.streams[0]);
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };


        return () => {
            if (socket) {
                // socket.emit('leave-room', { userId, roomId });
                socket.emit('leave-room', { userId, roomId })
                socket.disconnect();
                console.log('socket disconnected');
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
            }
            if (localVideoRef?.current) {
                document.getElementById('localvideoPlayer').srcObject = null;
            }
        }
    }, [socket]);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <button
                onClick={handleBack}
                className=" absolute top-2 left-2 p-2 rounded-lg border border-solid bottom-2 border-purple-400 cursor-pointer h-fit w-fit"
            >
                Back
            </button>

            <div className=" p-2 border-double rounded-lg border-2 border-yellow-300 flex items-center justify-between">
                <video id="localvideoPlayer" ref={localVideoRef} autoPlay playsInline
                    style={{ width: '300px', height: '300px', backgroundColor: 'yellow' }}
                ></video>
                <video ref={remoteVideoRef} autoPlay playsInline

                    style={{ width: '300px', height: '300px', backgroundColor: 'green' }}
                ></video>
            </div>
        </div>
    )
}

export default Page