import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'], autoConnect: true });

export const useWebRTC = () => {
    const {
        peer, setPeer, setStatus, setRemoteStream, addMessage, resetChat,
        setIncomingCall, setCallRequest, setChatMode, setLocalStream, clearChat, goHome
    } = useChatStore();

    const pc = useRef(null);
    const iceQueue = useRef([]);

    const cleanupPeerConnection = useCallback(() => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        iceQueue.current = [];
        setRemoteStream(null);
    }, [setRemoteStream]);

    const stopLocalStream = useCallback(() => {
        const { localStream } = useChatStore.getState();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
    }, [setLocalStream]);

    const getRequiredStream = useCallback(async (type) => {
        const needsVideo = type === 'video';
        let stream = useChatStore.getState().localStream;

        // Check if current stream matches required type
        const hasVideo = stream && stream.getVideoTracks().length > 0;
        const matchesType = needsVideo ? hasVideo : true; // If we need audio, either audio or video stream is fine

        if (!stream || (needsVideo && !hasVideo)) {
            if (stream) stream.getTracks().forEach(t => t.stop());

            console.log(`[WebRTC] Requesting ${needsVideo ? 'Video' : 'Audio'} stream`);
            stream = await navigator.mediaDevices.getUserMedia({
                video: needsVideo ? { width: 1280, height: 720 } : false,
                audio: true
            });
            setLocalStream(stream);
        }
        return stream;
    }, [setLocalStream]);

    const setupPeerConnection = useCallback((remoteSocketId, stream) => {
        cleanupPeerConnection();

        pc.current = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('ice-candidate', { to: remoteSocketId, candidate: e.candidate });
            }
        };

        pc.current.ontrack = (e) => {
            console.log('[WebRTC] Received remote track:', e.track.kind);
            if (e.streams && e.streams[0]) {
                // Setting the stream directly to trigger re-render
                setRemoteStream(e.streams[0]);
            }
        };

        if (stream) {
            stream.getTracks().forEach(track => {
                console.log('[WebRTC] Adding local track:', track.kind);
                pc.current.addTrack(track, stream);
            });
        }
    }, [cleanupPeerConnection, setRemoteStream]);

    const initiateWebRTC = useCallback(async (remoteSocketId, stream) => {
        setupPeerConnection(remoteSocketId, stream);
        try {
            const offer = await pc.current.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            await pc.current.setLocalDescription(offer);
            socket.emit('offer', { to: remoteSocketId, offer });
        } catch (e) { console.error('Offer Error:', e); }
    }, [setupPeerConnection]);

    const handleAcceptCall = useCallback(async () => {
        const incoming = useChatStore.getState().incomingCall;
        const p = useChatStore.getState().peer;
        if (!incoming || !p) return;

        try {
            const stream = await getRequiredStream(incoming);
            setChatMode(incoming);
            setIncomingCall(null);
            setupPeerConnection(p.id, stream);
            socket.emit('accept-call', { to: p.id, type: incoming });
        } catch (err) {
            console.error('[WebRTC] Failed to accept call:', err);
            addMessage({ text: "Media access denied", sender: 'system', type: 'disconnected', timestamp: new Date() });
            socket.emit('decline-call', { to: p.id });
            setIncomingCall(null);
        }
    }, [setChatMode, setIncomingCall, setupPeerConnection, addMessage, getRequiredStream]);

    const declineCall = useCallback(() => {
        const p = useChatStore.getState().peer;
        if (p) socket.emit('decline-call', { to: p.id });
        setIncomingCall(null);
    }, [setIncomingCall]);

    const cancelCall = useCallback(() => {
        const p = useChatStore.getState().peer;
        if (p) socket.emit('cancel-call', { to: p.id });
        setCallRequest(null);
    }, [setCallRequest]);

    const endCall = useCallback(() => {
        const p = useChatStore.getState().peer;
        if (p) socket.emit('end-call', { to: p.id });

        cleanupPeerConnection();
        setChatMode('text');
        addMessage({ text: "Call ended", sender: 'system', type: 'disconnected', timestamp: new Date() });
    }, [cleanupPeerConnection, setChatMode, addMessage]);

    useEffect(() => {
        const onMatched = ({ peerId, peerNickname, mode, initiator }) => {
            clearChat();
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
            setChatMode(mode);

            addMessage({ text: `${peerNickname} connected`, sender: 'system', type: 'connected', timestamp: new Date() });

            if (mode === 'video') {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                    setLocalStream(stream);
                    if (initiator) setTimeout(() => initiateWebRTC(peerId, stream), 1000);
                    else setupPeerConnection(peerId, stream);
                }).catch(() => {
                    addMessage({ text: "Camera access denied", sender: 'system', type: 'disconnected', timestamp: new Date() });
                });
            }
        };

        socket.on('waiting', () => setStatus('searching'));
        socket.on('matched', onMatched);
        socket.on('incoming-call', ({ type }) => setIncomingCall(type));

        socket.on('call-accepted', ({ from, type }) => {
            const currentRequest = useChatStore.getState().callRequest;
            setCallRequest(null);

            const finalMode = type || currentRequest || 'video';
            setChatMode(finalMode);

            // Get current stream - should already be set by requestCall
            const stream = useChatStore.getState().localStream;
            if (stream) {
                initiateWebRTC(from, stream);
            }
        });

        socket.on('call-declined', () => {
            setCallRequest(null);
            addMessage({ text: "Stranger declined the call", sender: 'system', type: 'disconnected', timestamp: new Date() });
            cleanupPeerConnection();
        });

        socket.on('call-cancelled', () => {
            setIncomingCall(null);
            addMessage({ text: "Stranger cancelled the call", sender: 'system', type: 'disconnected', timestamp: new Date() });
        });

        socket.on('call-ended', () => {
            cleanupPeerConnection();
            setChatMode('text');
            addMessage({ text: "Stranger ended the call", sender: 'system', type: 'disconnected', timestamp: new Date() });
        });

        socket.on('offer', async ({ from, offer }) => {
            const stream = useChatStore.getState().localStream;
            setupPeerConnection(from, stream);
            try {
                await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.current.createAnswer();
                await pc.current.setLocalDescription(answer);
                socket.emit('answer', { to: from, answer });

                while (iceQueue.current.length > 0) {
                    pc.current.addIceCandidate(new RTCIceCandidate(iceQueue.current.shift())).catch(e => {});
                }
            } catch (e) { console.error('[WebRTC] Offer error:', e); }
        });

        socket.on('answer', async ({ answer }) => {
            if (pc.current) {
                try {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (e) { console.error('[WebRTC] Answer error:', e); }
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (pc.current && pc.current.remoteDescription) {
                pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
            } else {
                iceQueue.current.push(candidate);
            }
        });

        socket.on('receive-message', ({ message }) => addMessage({ text: message, sender: 'stranger', timestamp: new Date() }));

        socket.on('peer-disconnected', () => {
            const currentPeer = useChatStore.getState().peer;
            if (currentPeer) {
                addMessage({ text: `${currentPeer.nickname} left`, sender: 'system', type: 'disconnected', timestamp: new Date() });
            }
            cleanupPeerConnection();
            resetChat(true);
        });

        return () => {
            socket.off('waiting'); socket.off('matched'); socket.off('incoming-call');
            socket.off('call-accepted'); socket.off('call-declined'); socket.off('call-cancelled'); socket.off('call-ended');
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate');
            socket.off('receive-message'); socket.off('peer-disconnected');
        };
    }, [setPeer, setStatus, addMessage, cleanupPeerConnection, resetChat, setupPeerConnection, initiateWebRTC, setIncomingCall, setCallRequest, setLocalStream, setChatMode, clearChat]);

    const sendMessage = (text) => {
        const p = useChatStore.getState().peer;
        const s = useChatStore.getState().status;
        if (p && s === 'connected') {
            socket.emit('send-message', { to: p.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    };

    const nextUser = () => {
        cleanupPeerConnection();
        if (useChatStore.getState().initialMode === 'text') {
            stopLocalStream();
        }
        clearChat();
        setStatus('searching');
        socket.emit('next-user');
    };

    const leaveChat = () => {
        cleanupPeerConnection();
        stopLocalStream();
        socket.emit('leave-chat');
        goHome();
    };

    const join = (userData) => {
        setStatus('searching');
        setChatMode(userData.chatMode);
        socket.emit('join-matchmaking', userData);
    };

    const requestCall = useCallback(async (type) => {
        const p = useChatStore.getState().peer;
        if (!p) return;
        try {
            const stream = await getRequiredStream(type);
            setCallRequest(type);
            socket.emit('request-call', { to: p.id, type });
        } catch (err) {
            console.error('[WebRTC] Request call error:', err);
            addMessage({ text: "Media access required", sender: 'system', type: 'disconnected', timestamp: new Date() });
        }
    }, [setCallRequest, addMessage, getRequiredStream]);

    return { join, sendMessage, nextUser, requestCall, handleAcceptCall, declineCall, cancelCall, leaveChat, endCall };
};
