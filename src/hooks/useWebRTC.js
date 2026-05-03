import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import useChatStore from '../store/useChatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND_URL, { transports: ['websocket'], autoConnect: true });

export const useWebRTC = () => {
    const {
        setPeer, setStatus, addMessage, resetChat,
        clearChat, goHome, setIncomingCall
    } = useChatStore();

    useEffect(() => {
        const onMatched = ({ peerId, peerNickname }) => {
            clearChat();
            setPeer({ id: peerId, nickname: peerNickname });
            setStatus('connected');
            addMessage({ text: `${peerNickname} connected`, sender: 'system', type: 'connected', timestamp: new Date() });
        };

        socket.on('waiting', () => setStatus('searching'));
        socket.on('matched', onMatched);
        socket.on('receive-message', ({ message }) => addMessage({ text: message, sender: 'stranger', timestamp: new Date() }));

        socket.on('call-request', ({ from, type, nickname }) => {
            setIncomingCall({ from, type, nickname });
        });

        socket.on('call-accepted', ({ from }) => {
            addMessage({ text: `Call accepted! Connecting...`, sender: 'system', type: 'call', timestamp: new Date() });
            // Here you would normally initialize the WebRTC PeerConnection for media
        });

        socket.on('call-rejected', ({ from }) => {
            addMessage({ text: `Call rejected by stranger`, sender: 'system', type: 'disconnected', timestamp: new Date() });
        });

        socket.on('peer-disconnected', () => {
            const currentPeer = useChatStore.getState().peer;
            if (currentPeer) {
                addMessage({ text: `${currentPeer.nickname} left`, sender: 'system', type: 'disconnected', timestamp: new Date() });
            }
            resetChat(true);
        });

        return () => {
            socket.off('waiting');
            socket.off('matched');
            socket.off('receive-message');
            socket.off('call-request');
            socket.off('call-accepted');
            socket.off('call-rejected');
            socket.off('peer-disconnected');
        };
    }, [setPeer, setStatus, addMessage, resetChat, clearChat, setIncomingCall]);

    const sendMessage = (text) => {
        const p = useChatStore.getState().peer;
        const s = useChatStore.getState().status;
        if (p && s === 'connected') {
            socket.emit('send-message', { to: p.id, message: text });
            addMessage({ text, sender: 'me', timestamp: new Date() });
        }
    };

    const startCall = (type) => {
        const p = useChatStore.getState().peer;
        if (p) {
            socket.emit('call-user', { to: p.id, type });
            addMessage({ text: `Requesting ${type} call...`, sender: 'system', type: 'call', timestamp: new Date() });
        }
    };

    const acceptCall = () => {
        const incoming = useChatStore.getState().incomingCall;
        if (incoming) {
            socket.emit('accept-call', { to: incoming.from });
            addMessage({ text: `You accepted the ${incoming.type} call`, sender: 'system', type: 'call', timestamp: new Date() });
            setIncomingCall(null);
            // Initialize WebRTC media here
        }
    };

    const rejectCall = () => {
        const incoming = useChatStore.getState().incomingCall;
        if (incoming) {
            socket.emit('reject-call', { to: incoming.from });
            setIncomingCall(null);
        }
    };

    const nextUser = () => {
        clearChat();
        setStatus('searching');
        socket.emit('next-user');
    };

    const leaveChat = () => {
        socket.emit('leave-chat');
        goHome();
    };

    const join = (userData) => {
        setStatus('searching');
        socket.emit('join-matchmaking', userData);
    };

    return {
        join, sendMessage, nextUser, leaveChat,
        startVideoCall: () => startCall('video'),
        startAudioCall: () => startCall('audio'),
        acceptCall,
        rejectCall
    };
};
