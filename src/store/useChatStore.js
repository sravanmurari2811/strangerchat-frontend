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

    resetChat: (keepPeerInfo = false) => {
        const { localStream, initialMode } = useChatStore.getState();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        set((state) => ({
            peer: keepPeerInfo ? state.peer : null,
            // We don't clear messages here if we want to show "Stranger left"
            status: 'disconnected',
            remoteStream: null,
            callRequest: null,
            incomingCall: null,
            chatMode: initialMode || 'text',
            localStream: null
        }));
    },

    clearChat: () => set({ messages: [], peer: null }),

    goHome: () => {
        const { localStream } = useChatStore.getState();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
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
