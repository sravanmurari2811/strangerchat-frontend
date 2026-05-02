import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected
    chatMode: 'text', // Active mode: 'text', 'audio', 'video'
    initialMode: 'text', // Selected on Home: 'text', 'video'
    localStream: null,
    remoteStream: null,

    // Call agreement states
    callRequest: null, // 'audio' | 'video' | null (outgoing)
    incomingCall: null, // 'audio' | 'video' | null (incoming)
    callAccepted: false,

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),
    setChatMode: (mode) => set({ chatMode: mode }),
    setInitialMode: (mode) => set({ initialMode: mode }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),

    setCallRequest: (type) => set({ callRequest: type }),
    setIncomingCall: (type) => set({ incomingCall: type }),
    setCallAccepted: (accepted) => set({ callAccepted: accepted }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    resetChat: () => {
        const { localStream, initialMode } = useChatStore.getState();
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        set({
            peer: null,
            messages: [],
            status: 'disconnected',
            remoteStream: null,
            callRequest: null,
            incomingCall: null,
            callAccepted: false,
            chatMode: initialMode, // Revert to what user picked on home screen
            localStream: null
        });
    },

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
            callAccepted: false,
            chatMode: 'text',
            initialMode: 'text'
        });
    }
}));

export default useChatStore;
