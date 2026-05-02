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

    const cleanup = useCallback(() => {
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        iceQueue.current = [];
        const currentStream = useChatStore.getState().localStream;
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
    }, [setLocalStream, setRemoteStream]);

    const setupPeerConnection = useCallback((remoteSocketId, stream) => {
        if (pc.current) pc.current.close();

        pc.current = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
        });

        pc.current.onicecandidate = (e) => {
            if (e.candidate) socket.emit('ice-candidate', { to: remoteSocketId, candidate: e.candidate });
        };

        pc.current.ontrack = (e) => {
            if (e.streams && e.streams[0]) {
                setRemoteStream(e.streams[0]);
            }
        };

        if (stream) {
            stream.getTracks().forEach(track => pc.current.addTrack(track, stream));
        }
    }, [setRemoteStream]);

    const initiateWebRTC = useCallback(async (remoteSocketId, stream) => {
        setupPeerConnection(remoteSocketId, stream);
        try {
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socket.emit('offer', { to: remoteSocketId, offer });
        } catch (e) { console.error('Offer Error:', e); }
    }, [setupPeerConnection]);

    const handleAcceptCall = useCallback(async () => {
        const incoming = useChatStore.getState().incomingCall;
        const p = useChatStore.getState().peer;
        if (!incoming || !p) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: incoming === 'video',
                audio: true
            });
            setLocalStream(stream);
            setChatMode(incoming);
            setIncomingCall(null);

            setupPeerConnection(p.id, stream);
            socket.emit('accept-call', { to: p.id, type: incoming });
        } catch (err) {
            addMessage({ text: "Camera/Mic access denied", sender: 'system', type: 'disconnected', timestamp: new Date() });
            socket.emit('decline-call', { to: p.id });
            setIncomingCall(null);
        }
    }, [setLocalStream, setChatMode, setIncomingCall, setupPeerConnection, addMessage]);

    const declineCall = useCallback(() => {
        const p = useChatStore.getState().peer;
        if (p) socket.emit('decline-call', { to: p.id });
        setIncomingCall(null);
    }, [setIncomingCall]);

    const endCall = useCallback(() => {
        const p = useChatStore.getState().peer;
        if (p) socket.emit('end-call', { to: p.id });

        cleanup();
        setChatMode('text');
        addMessage({ text: "Call ended", sender: 'system', type: 'disconnected', timestamp: new Date() });
    }, [cleanup, setChatMode, addMessage]);

    useEffect(() => {
        const onMatched = ({ peerId, peerNickname, mode, initiator }) => {
            clearChat();
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');

            addMessage({ text: `${peerNickname} connected`, sender: 'system', type: 'connected', timestamp: new Date() });

            if (mode === 'video') {
                setChatMode('video');
                navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
                    setLocalStream(stream);
                    if (initiator) setTimeout(() => initiateWebRTC(peerId, stream), 1000);
                    else setupPeerConnection(peerId, stream);
                }).catch(() => {});
            }
        };

        socket.on('waiting', () => setStatus('searching'));
        socket.on('matched', onMatched);
        socket.on('incoming-call', ({ type }) => setIncomingCall(type));

        socket.on('call-accepted', ({ from, type }) => {
            const currentRequest = useChatStore.getState().callRequest;
            setCallRequest(null);

            // Critical: Force initiator to switch view
            const finalMode = type || currentRequest || 'video';
            setChatMode(finalMode);

            const stream = useChatStore.getState().localStream;
            if (stream) initiateWebRTC(from, stream);
        });

        socket.on('call-declined', () => {
            setCallRequest(null);
            addMessage({ text: "Stranger declined the call", sender: 'system', type: 'disconnected', timestamp: new Date() });
            cleanup();
        });

        socket.on('call-ended', () => {
            cleanup();
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
                    pc.current.addIceCandidate(new RTCIceCandidate(iceQueue.current.shift())).catch(() => {});
                }
            } catch (e) {}
        });

        socket.on('answer', async ({ answer }) => {
            if (pc.current) pc.current.setRemoteDescription(new RTCSessionDescription(answer)).catch(() => {});
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (pc.current && pc.current.remoteDescription) pc.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
            else iceQueue.current.push(candidate);
        });

        socket.on('receive-message', ({ message }) => addMessage({ text: message, sender: 'stranger', timestamp: new Date() }));

        socket.on('peer-disconnected', () => {
            const currentPeer = useChatStore.getState().peer;
            if (currentPeer) {
                addMessage({ text: `${currentPeer.nickname} left`, sender: 'system', type: 'disconnected', timestamp: new Date() });
            }
            cleanup();
            resetChat(true);
        });

        return () => {
            socket.off('waiting'); socket.off('matched'); socket.off('incoming-call');
            socket.off('call-accepted'); socket.off('call-declined'); socket.off('call-ended');
            socket.off('offer'); socket.off('answer'); socket.off('ice-candidate');
            socket.off('receive-message'); socket.off('peer-disconnected');
        };
    }, [setPeer, setStatus, addMessage, cleanup, resetChat, setupPeerConnection, initiateWebRTC, setIncomingCall, setCallRequest, setLocalStream, setChatMode, clearChat]);

    const sendMessage = (text) => {
        const p = useChatStore.getState().peer;
        const s = useChatStore.getState().status;
        if (p && s === 'connected') {
            socket.emit('send-message', { to: p.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    };

    const nextUser = () => {
        cleanup();
        clearChat();
        setStatus('searching');
        socket.emit('next-user');
    };

    const leaveChat = () => {
        cleanup();
        socket.emit('leave-chat');
        goHome();
    };

    const join = (userData) => {
        setStatus('searching');
        socket.emit('join-matchmaking', userData);
    };

    const requestCall = async (type) => {
        const p = useChatStore.getState().peer;
        if (!p) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
            setLocalStream(stream);
            setCallRequest(type);
            socket.emit('request-call', { to: p.id, type });
        } catch (err) {
            addMessage({ text: "Camera/Mic access required for calls", sender: 'system', type: 'disconnected', timestamp: new Date() });
        }
    };

    return { join, sendMessage, nextUser, requestCall, handleAcceptCall, declineCall, leaveChat, endCall };
};
