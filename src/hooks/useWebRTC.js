import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Initialize socket once outside the hook to prevent multiple connections
const socket = io(BACKEND_URL, {
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
});

export const useWebRTC = () => {
    const {
        peer, setPeer, setStatus, setRemoteStream, addMessage, resetChat
    } = useChatStore();

    const pc = useRef(null);
    const iceQueue = useRef([]);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
        ]
    };

    const cleanup = useCallback(() => {
        if (pc.current) {
            pc.current.onicecandidate = null;
            pc.current.ontrack = null;
            pc.current.onconnectionstatechange = null;
            pc.current.close();
            pc.current = null;
        }
        iceQueue.current = [];
    }, []);

    const processIceQueue = useCallback(() => {
        if (!pc.current || !pc.current.remoteDescription) return;
        while (iceQueue.current.length > 0) {
            const candidate = iceQueue.current.shift();
            pc.current.addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error('[WebRTC] Error adding queued ICE candidate', e));
        }
    }, []);

    const setupPeerConnection = useCallback((remoteSocketId) => {
        cleanup();
        pc.current = new RTCPeerConnection(configuration);

        pc.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { to: remoteSocketId, candidate: event.candidate });
            }
        };

        pc.current.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.current.onconnectionstatechange = () => {
            console.log('[WebRTC] Connection State:', pc.current?.connectionState);
            if (pc.current?.connectionState === 'failed' || pc.current?.connectionState === 'disconnected') {
                // Handle failure
            }
        };

        const { localStream } = useChatStore.getState();
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.current.addTrack(track, localStream);
            });
        }
    }, [cleanup, setRemoteStream]);

    const initiateCall = useCallback(async (remoteSocketId) => {
        setupPeerConnection(remoteSocketId);
        try {
            const offer = await pc.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await pc.current.setLocalDescription(offer);
            socket.emit('offer', { to: remoteSocketId, offer });
        } catch (e) {
            console.error('[WebRTC] Offer generation failed:', e);
        }
    }, [setupPeerConnection]);

    const handleOffer = useCallback(async (from, offer) => {
        setupPeerConnection(from);
        try {
            await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);
            socket.emit('answer', { to: from, answer });
            processIceQueue();
        } catch (e) {
            console.error('[WebRTC] Failed to handle offer:', e);
        }
    }, [setupPeerConnection, processIceQueue]);

    useEffect(() => {
        socket.on('waiting', () => setStatus('searching'));

        socket.on('matched', ({ peerId, peerNickname, initiator, mode }) => {
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
            if (mode === 'video' && initiator) {
                setTimeout(() => initiateCall(peerId), 1000);
            }
        });

        socket.on('offer', ({ from, offer }) => handleOffer(from, offer));

        socket.on('answer', async ({ from, answer }) => {
            if (pc.current) {
                try {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
                    processIceQueue();
                } catch (e) {
                    console.error('[WebRTC] Failed to set remote answer:', e);
                }
            }
        });

        socket.on('ice-candidate', ({ from, candidate }) => {
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
            resetChat();
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

    const sendMessage = useCallback((text) => {
        const { peer: currentPeer } = useChatStore.getState();
        if (currentPeer) {
            socket.emit('send-message', { to: currentPeer.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    }, [addMessage]);

    const nextUser = useCallback(() => {
        cleanup();
        resetChat();
        setStatus('searching');
        socket.emit('next-user');
    }, [cleanup, resetChat, setStatus]);

    const join = useCallback((userData) => {
        setStatus('searching');
        socket.emit('join-matchmaking', userData);
    }, [setStatus]);

    return { join, sendMessage, nextUser };
};
