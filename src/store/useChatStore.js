import { create } from 'zustand';

const useChatStore = create((set) => ({
    user: null,
    peer: null,
    messages: [],
    status: 'idle', // idle, searching, connected, disconnected
    incomingCall: null, // { from, type, nickname }
    callActive: false,
    callType: null, // 'video' or 'audio'
    localStream: null,
    remoteStream: null,

    setUser: (user) => set({ user }),
    setPeer: (peer) => set({ peer }),
    setStatus: (status) => set({ status }),
    setIncomingCall: (call) => set({ incomingCall: call }),
    setCallActive: (active, type = null) => set({ callActive: active, callType: type }),
    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    // resetChat is called when a match ends but we stay in the chat interface
    resetChat: (keepPeerInfo = false) => {
        set((state) => {
            if (state.localStream) {
                state.localStream.getTracks().forEach(track => track.stop());
            }
            return {
                peer: keepPeerInfo ? state.peer : null,
                status: 'disconnected',
                incomingCall: null,
                callActive: false,
                callType: null,
                localStream: null,
                remoteStream: null
            };
        });
    },

    clearChat: () => set((state) => {
        if (state.localStream) {
            state.localStream.getTracks().forEach(track => track.stop());
        }
        return {
            messages: [],
            peer: null,
            incomingCall: null,
            callActive: false,
            callType: null,
            localStream: null,
            remoteStream: null
        };
    }),

    // goHome is called when we leave the chat interface entirely
    goHome: () => {
        set((state) => {
            if (state.localStream) {
                state.localStream.getTracks().forEach(track => track.stop());
            }
            return {
                user: null,
                peer: null,
                messages: [],
                status: 'idle',
                incomingCall: null,
                callActive: false,
                callType: null,
                localStream: null,
                remoteStream: null
            };
        });
    }
}));

export default useChatStore;
