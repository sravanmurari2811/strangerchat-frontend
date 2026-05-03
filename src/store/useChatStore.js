import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    // resetChat is called when a match ends but we stay in the chat interface
    resetChat: (keepPeerInfo = false) => {
        set((state) => ({
            peer: keepPeerInfo ? state.peer : null,
            status: 'disconnected'
        }));
    },

    clearChat: () => set({ messages: [], peer: null }),

    // goHome is called when we leave the chat interface entirely
    goHome: () => {
        set({
            user: null,
            peer: null,
            messages: [],
            status: 'idle'
        });
    }
}));

export default useChatStore;
