import { useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'], autoConnect: true });

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export const useWebRTC = () => {
    const {
        setPeer, setStatus, addMessage, resetChat,
        clearChat, goHome, setIncomingCall, setCallActive,
        setLocalStream, setRemoteStream
    } = useChatStore();

    const pc = useRef(null);
    const localStreamRef = useRef(null);
    const candidatesQueue = useRef([]);

    const cleanupMedia = useCallback(() => {
        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.oniceconnectionstatechange = null;
            pc.current.close();
            pc.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        candidatesQueue.current = [];
        setLocalStream(null);
        setRemoteStream(null);
        setCallActive(false);
    }, [setLocalStream, setRemoteStream, setCallActive]);

    const processCandidates = useCallback(async () => {
        if (pc.current && pc.current.remoteDescription) {
            while (candidatesQueue.current.length > 0) {
                const candidate = candidatesQueue.current.shift();
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding queued candidate", e);
                }
            }
        }
    }, []);

    const initPeerConnection = useCallback(async (peerId, type) => {
        // Fix race condition: check if pc.current is already being initialized
        if (pc.current) return pc.current;

        const connection = new RTCPeerConnection(ICE_SERVERS);
        pc.current = connection; // Set it immediately

        connection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc-signal', { to: peerId, signal: { type: 'candidate', candidate: event.candidate } });
            }
        };

        connection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            } else {
                // Fallback for browsers that don't provide streams in event
                setRemoteStream(new MediaStream([event.track]));
            }
        };

        connection.oniceconnectionstatechange = () => {
            if (connection.iceConnectionState === 'disconnected' || connection.iceConnectionState === 'failed') {
                cleanupMedia();
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            stream.getTracks().forEach(track => connection.addTrack(track, stream));
        } catch (err) {
            console.error("Media access error:", err);
            addMessage({ text: "Camera/Mic access denied. The other person won't see/hear you.", sender: 'system', type: 'error' });
        }

        return connection;
    }, [setLocalStream, setRemoteStream, addMessage, cleanupMedia]);

    useEffect(() => {
        socket.on('matched', ({ peerId, peerNickname }) => {
            clearChat();
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
            addMessage({ text: `${peerNickname} connected`, sender: 'system', type: 'connected', timestamp: new Date() });
        });

        socket.on('call-request', ({ from, type, nickname }) => {
            setIncomingCall({ from, type, nickname });
        });

        socket.on('call-accepted', async ({ from }) => {
            addMessage({ text: `Call accepted! Connecting...`, sender: 'system', type: 'call' });
            setCallActive(true, 'video');
            const connection = await initPeerConnection(from, 'video');
            try {
                const offer = await connection.createOffer();
                await connection.setLocalDescription(offer);
                socket.emit('webrtc-signal', { to: from, signal: { type: 'offer', sdp: offer } });
            } catch (err) {
                console.error("Error creating offer:", err);
            }
        });

        socket.on('webrtc-signal', async ({ from, signal }) => {
            try {
                if (signal.type === 'offer') {
                    setCallActive(true, 'video');
                    const connection = await initPeerConnection(from, 'video');
                    await connection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                    const answer = await connection.createAnswer();
                    await connection.setLocalDescription(answer);
                    socket.emit('webrtc-signal', { to: from, signal: { type: 'answer', sdp: answer } });
                    await processCandidates();
                } else if (signal.type === 'answer') {
                    if (pc.current) {
                        await pc.current.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                        await processCandidates();
                    }
                } else if (signal.type === 'candidate') {
                    if (pc.current && pc.current.remoteDescription) {
                        await pc.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    } else {
                        candidatesQueue.current.push(signal.candidate);
                    }
                }
            } catch (err) {
                console.error("WebRTC Signaling Error:", err);
            }
        });

        socket.on('call-rejected', ({ from }) => {
            addMessage({ text: `Stranger ended the call`, sender: 'system', type: 'disconnected' });
            cleanupMedia();
        });

        socket.on('peer-disconnected', () => {
            cleanupMedia();
            resetChat(true);
        });

        socket.on('receive-message', ({ message }) => addMessage({ text: message, sender: 'stranger', timestamp: new Date() }));
        socket.on('waiting', () => setStatus('searching'));

        return () => {
            socket.off('matched');
            socket.off('call-request');
            socket.off('call-accepted');
            socket.off('webrtc-signal');
            socket.off('call-rejected');
            socket.off('peer-disconnected');
            socket.off('receive-message');
            socket.off('waiting');
        };
    }, [setPeer, setStatus, addMessage, resetChat, clearChat, setIncomingCall, setCallActive, initPeerConnection, cleanupMedia, processCandidates]);

    const sendMessage = (text) => {
        const p = useChatStore.getState().peer;
        if (p) {
            socket.emit('send-message', { to: p.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    };

    const startCall = (type) => {
        const p = useChatStore.getState().peer;
        if (p) {
            socket.emit('call-user', { to: p.id, type });
            addMessage({ text: `Requesting ${type} call...`, sender: 'system', type: 'call' });
        }
    };

    const acceptCall = async () => {
        const incoming = useChatStore.getState().incomingCall;
        if (incoming) {
            socket.emit('accept-call', { to: incoming.from });
            setCallActive(true, incoming.type);
            setIncomingCall(null);
            await initPeerConnection(incoming.from, incoming.type);
        }
    };

    const rejectCall = () => {
        const incoming = useChatStore.getState().incomingCall;
        if (incoming) {
            socket.emit('reject-call', { to: incoming.from });
            setIncomingCall(null);
        }
    };

    const endCall = () => {
        const p = useChatStore.getState().peer;
        if (p) {
            socket.emit('reject-call', { to: p.id });
        }
        cleanupMedia();
    };

    return {
        join: (data) => { setStatus('searching'); socket.emit('join-matchmaking', data); },
        sendMessage,
        nextUser: () => { cleanupMedia(); clearChat(); setStatus('searching'); socket.emit('next-user'); },
        leaveChat: () => { cleanupMedia(); socket.emit('leave-chat'); goHome(); },
        startVideoCall: () => startCall('video'),
        startAudioCall: () => startCall('audio'),
        acceptCall,
        rejectCall,
        endCall
    };
};
