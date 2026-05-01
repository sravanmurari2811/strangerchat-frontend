import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'], autoConnect: true });

export const useWebRTC = () => {
    const { peer, setPeer, setStatus, setRemoteStream, addMessage, resetChat } = useChatStore();
    const pc = useRef(null);
    const iceQueue = useRef([]);

    const cleanup = useCallback(() => {
        if (pc.current) { pc.current.close(); pc.current = null; }
        iceQueue.current = [];
    }, []);

    const processIceQueue = useCallback(() => {
        if (!pc.current || !pc.current.remoteDescription) return;
        while (iceQueue.current.length > 0) {
            const candidate = iceQueue.current.shift();
            pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
        }
    }, []);

    const setupPeerConnection = useCallback((remoteSocketId) => {
        cleanup();
        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) socket.emit('ice-candidate', { to: remoteSocketId, candidate: e.candidate });
        };

        pc.current.ontrack = (e) => {
            if (e.streams && e.streams[0]) setRemoteStream(e.streams[0]);
        };

        const localStream = useChatStore.getState().localStream;
        if (localStream) {
            localStream.getTracks().forEach(track => pc.current.addTrack(track, localStream));
        }
    }, [cleanup, setRemoteStream]);

    const initiateCall = useCallback(async (remoteSocketId) => {
        setupPeerConnection(remoteSocketId);
        try {
            const offer = await pc.current.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
            await pc.current.setLocalDescription(offer);
            socket.emit('offer', { to: remoteSocketId, offer });
        } catch (e) { console.error('Signaling Error:', e); }
    }, [setupPeerConnection]);

    const handleOffer = useCallback(async (from, offer) => {
        setupPeerConnection(from);
        try {
            await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit('answer', { to: from, answer });
            processIceQueue();
        } catch (e) { console.error('Signaling Error:', e); }
    }, [setupPeerConnection, processIceQueue]);

    useEffect(() => {
        socket.on('waiting', () => setStatus('searching'));

        socket.on('matched', ({ peerId, peerNickname, initiator, mode }) => {
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
            if (mode === 'video' && initiator) {
                setTimeout(() => initiateCall(peerId), 1500);
            }
        });

        socket.on('offer', ({ from, offer }) => handleOffer(from, offer));

        socket.on('answer', async ({ answer }) => {
            if (pc.current) {
                try {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
                    processIceQueue();
                } catch (e) {}
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (!candidate) return;
            if (!pc.current || !pc.current.remoteDescription) {
                iceQueue.current.push(candidate);
            } else {
                pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
            }
        });

        socket.on('receive-message', ({ message }) => {
            addMessage({ text: message, sender: 'stranger', timestamp: new Date() });
        });

        socket.on('peer-disconnected', () => {
            cleanup();
            resetChat(); // Correctly sets status to 'disconnected' for manual rematch
        });

        return () => {
            socket.off('waiting');
            socket.off('matched');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('receive-message');
            socket.off('peer-disconnected');
        };
    }, [initiateCall, handleOffer, setPeer, setStatus, addMessage, cleanup, resetChat, processIceQueue]);

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

    return { join, sendMessage, nextUser };
};
