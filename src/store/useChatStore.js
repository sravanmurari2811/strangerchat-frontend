import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected
    incomingCall: null, // { from, type, nickname }

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),
    setIncomingCall: (call) => set({ incomingCall: call }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    // resetChat is called when a match ends but we stay in the chat interface
    resetChat: (keepPeerInfo = false) => {
        set((state) => ({
            peer: keepPeerInfo ? state.peer : null,
            status: 'disconnected',
            incomingCall: null
        }));
    },

    clearChat: () => set({ messages: [], peer: null, incomingCall: null }),

    // goHome is called when we leave the chat interface entirely
    goHome: () => {
        set({
            user: null,
            peer: null,
            messages: [],
            status: 'idle',
            incomingCall: null
        });
    }
}));

export default useChatStore;
