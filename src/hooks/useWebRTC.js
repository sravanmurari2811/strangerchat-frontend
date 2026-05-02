import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'], autoConnect: true });

export const useWebRTC = () => {
    const {
        peer, setPeer, setStatus, setRemoteStream, addMessage, resetChat,
        setIncomingCall, setCallAccepted, setCallRequest, chatMode, setChatMode,
        setLocalStream
    } = useChatStore();

    const pc = useRef(null);
    const iceQueue = useRef([]);

    const cleanup = useCallback(() => {
        if (pc.current) { pc.current.close(); pc.current = null; }
        iceQueue.current = [];
        const localStream = useChatStore.getState().localStream;
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    }, [setLocalStream]);

    const setupPeerConnection = useCallback((remoteSocketId, stream) => {
        if (pc.current) pc.current.close();

        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) socket.emit('ice-candidate', { to: remoteSocketId, candidate: e.candidate });
        };

        pc.current.ontrack = (e) => {
            if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
        };

        if (stream) {
            stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
        }
    }, [setRemoteStream]);

    const initiateCall = useCallback(async (type) => {
        const peer = useChatStore.getState().peer;
        if (!peer) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: type === 'video',
                audio: true
            });
            setLocalStream(stream);
            setChatMode(type);
            setupPeerConnection(peer.id, stream);

            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socket.emit('offer', { to: peer.id, offer });
            setCallRequest(type);
        } catch (err) {
            console.error("Media access error:", err);
            alert("Could not access camera/microphone");
        }
    }, [setupPeerConnection, setLocalStream, setChatMode, setCallRequest]);

    const handleAcceptCall = useCallback(async () => {
        const incoming = useChatStore.getState().incomingCall;
        const peer = useChatStore.getState().peer;
        if (!incoming || !peer) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: incoming === 'video',
                audio: true
            });
            setLocalStream(stream);
            setChatMode(incoming);
            setCallAccepted(true);
            setIncomingCall(null);

            socket.emit('accept-call', { to: peer.id, type: incoming });
        } catch (err) {
            console.error("Media access error:", err);
        }
    }, [setLocalStream, setChatMode, setCallAccepted, setIncomingCall]);

    useEffect(() => {
        socket.on('waiting', () => setStatus('searching'));

        socket.on('matched', ({ peerId, peerNickname }) => {
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
        });

        socket.on('incoming-call', ({ from, type }) => {
            setIncomingCall(type);
        });

        socket.on('call-accepted', async ({ from, type }) => {
            setCallAccepted(true);
            setCallRequest(null);
            // We already sent offer, now just wait for answer
        });

        socket.on('offer', async ({ from, offer }) => {
            const stream = useChatStore.getState().localStream;
            setupPeerConnection(from, stream);
            try {
                await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                socket.emit('answer', { to: from, answer });
            } catch (e) { console.error('Signaling Error:', e); }
        });

        socket.on('answer', async ({ answer }) => {
            if (pc.current) {
                try {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) {}
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (pc.current && candidate) {
                pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
            }
        });

        socket.on('receive-message', ({ message }) => {
            addMessage({ text: message, sender: 'stranger', timestamp: new Date() });
        });

        socket.on('peer-disconnected', () => {
            cleanup();
            resetChat();
        });

        return () => {
            socket.off('waiting');
            socket.off('matched');
            socket.off('incoming-call');
            socket.off('call-accepted');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('receive-message');
            socket.off('peer-disconnected');
        };
    }, [setPeer, setStatus, addMessage, cleanup, resetChat, setupPeerConnection, setIncomingCall, setCallAccepted, setCallRequest]);

    const sendMessage = (text) => {
        const p = useChatStore.getState().peer;
        if (p) {
            socket.emit('send-message', { to: p.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    };

    const nextUser = () => {
        cleanup();
        resetChat();
        setStatus('searching');
        socket.emit('next-user');
    };

    const join = (userData) => {
        setStatus('searching');
        socket.emit('join-matchmaking', userData);
    };

    const requestCall = (type) => {
        const p = useChatStore.getState().peer;
        if (p) {
            initiateCall(type);
            socket.emit('request-call', { to: p.id, type });
        }
    };

    return { join, sendMessage, nextUser, requestCall, handleAcceptCall };
};
