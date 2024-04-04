import { useEffect, useState, useRef } from "react";

const useMediaStream = () => {
    const [stream, setStream] = useState(null);
    const isStreamSet = useRef(false);

    useEffect(() => {
        if (isStreamSet.current) return;
        isStreamSet.current = true;
        (async function initStream() {
            try {
                // Navigator is an web api or user agent
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                console.log("setting your stream");
                setStream(stream);
            } catch (error) {
                console.log("Error getting media navigator", error);
            }
        })();
    });

    return {
        stream
    }
};

export default useMediaStream;