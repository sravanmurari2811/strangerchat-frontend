import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected
    chatMode: 'video',
    localStream: null,
    remoteStream: null,

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),
    setChatMode: (mode) => set({ chatMode: mode }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    resetChat: () => set({
        peer: null,
        messages: [],
        status: 'disconnected',
        remoteStream: null
    }),

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
            remoteStream: null
        });
    }
}));

export default useChatStore;
