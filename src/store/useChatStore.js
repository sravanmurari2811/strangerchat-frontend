import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected
    chatMode: 'text', // Active mode: 'text', 'audio', 'video'
    initialMode: 'text', // Mode selected on Home
    localStream: null,
    remoteStream: null,

    // Call agreement states
    callRequest: null, // 'audio' | 'video' | null (outgoing)
    incomingCall: null, // 'audio' | 'video' | null (incoming)

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),
    setChatMode: (mode) => set({ chatMode: mode }),
    setInitialMode: (mode) => set({ initialMode: mode }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),

    setCallRequest: (type) => set({ callRequest: type }),
    setIncomingCall: (type) => set({ incomingCall: type }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    // resetChat is called when a match ends but we stay in the chat interface
    resetChat: (keepPeerInfo = false) => {
        set((state) => ({
            peer: keepPeerInfo ? state.peer : null,
            status: 'disconnected',
            remoteStream: null,
            callRequest: null,
            incomingCall: null,
            chatMode: state.initialMode || 'text'
        }));
    },

    clearChat: () => set({ messages: [], peer: null }),

    // goHome is called when we leave the chat interface entirely
    goHome: () => {
        set({
            user: null,
            peer: null,
            messages: [],
            status: 'idle',
            localStream: null,
            remoteStream: null,
            callRequest: null,
            incomingCall: null,
            chatMode: 'text',
            initialMode: 'text'
        });
    }
}));

export default useChatStore;
