import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageSquare, Home, Sparkles, Video, Phone, X, Check, PhoneOff } from 'lucide-react';

/**
 * ChatPanel Component
 * Handles messaging UI and Split-Screen Video Call interface.
 * Responsive layout: Vertical split on mobile, Horizontal split on large screens.
 */
const ChatPanel = ({
    onSendMessage,
    onNextUser,
    onLeave,
    onVideoCall,
    onAudioCall,
    onAcceptCall,
    onRejectCall,
    onEndCall
}) => {
    const [message, setMessage] = useState('');
    const {
        messages, status, peer, incomingCall, callActive, localStream, remoteStream
    } = useChatStore();

    const scrollRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, status]);

    // Attach local stream to video element
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callActive]);

    // Attach remote stream to video element
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callActive]);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim() && status === 'connected') {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <section className="flex flex-col h-full bg-[#0a0f1d]/60 backdrop-blur-3xl md:border-l border-white/5 w-full relative overflow-hidden font-['Plus_Jakarta_Sans']" aria-label="Chat Interface">

            {/* Incoming Call Popup Overlay */}
            {incomingCall && (
                <div className="fixed top-6 left-0 right-0 z-[9999] flex justify-center px-4 pointer-events-none">
                    <div className="w-full max-w-md bg-slate-900/98 backdrop-blur-3xl border border-blue-500/40 rounded-[2rem] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(59,130,246,0.2)] flex items-center justify-between gap-4 animate-reveal pointer-events-auto ring-1 ring-white/10">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 animate-pulse shrink-0">
                                {incomingCall.type === 'video' ? (
                                    <Video className="w-7 h-7 text-blue-400" />
                                ) : (
                                    <Phone className="w-7 h-7 text-blue-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 truncate mb-1">Incoming {incomingCall.type} Call</p>
                                <h3 className="text-white font-bold text-xl leading-tight truncate">{incomingCall.nickname}</h3>
                            </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <button
                                onClick={onRejectCall}
                                className="p-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-2xl border border-rose-500/20 transition-all active:scale-90"
                                title="Decline"
                            >
                                <X size={28} />
                            </button>
                            <button
                                onClick={onAcceptCall}
                                className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-90"
                                title="Accept"
                            >
                                <Check size={28} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="px-4 py-3 md:px-6 md:py-4 border-b border-white/5 flex justify-between items-center bg-slate-900/90 md:bg-black/30 backdrop-blur-xl z-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-blue-500" />
                        </div>
                        {status === 'connected' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f172a]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className={`font-black text-[11px] md:text-sm tracking-wider uppercase truncate transition-colors duration-300 ${
                            status === 'connected' ? 'text-emerald-400' :
                            status === 'disconnected' ? 'text-rose-500' :
                            'text-slate-100'
                        }`}>
                            {status === 'connected' ? peer?.nickname : (status === 'disconnected' ? 'Stranger Left' : (status === 'searching' ? 'Matching...' : 'Anonymous Match'))}
                        </h2>
                        {status === 'connected' && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Call Controls */}
                {status === 'connected' && (
                    <div className="flex items-center gap-2 md:gap-3 animate-reveal">
                        {!callActive ? (
                            <>
                                <button
                                    onClick={onAudioCall}
                                    className="p-2 md:p-2.5 bg-slate-800/40 hover:bg-slate-700/60 rounded-xl border border-white/5 transition-all group active:scale-95"
                                    title="Audio Call"
                                >
                                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" />
                                </button>
                                <button
                                    onClick={onVideoCall}
                                    className="p-2 md:p-2.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-xl border border-blue-500/20 transition-all group active:scale-95"
                                    title="Video Call"
                                >
                                    <Video className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onEndCall}
                                className="p-2 md:p-2.5 bg-rose-600/20 hover:bg-rose-600/30 rounded-xl border border-rose-500/40 transition-all group active:scale-95 flex items-center gap-2"
                                title="End Call"
                            >
                                <PhoneOff className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                                <span className="text-[10px] font-bold text-rose-500 uppercase hidden sm:inline">End Call</span>
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Content Area: Responsive Split Layout */}
            <div className={`flex-1 flex min-h-0 w-full overflow-hidden ${callActive ? 'flex-col md:flex-row' : 'flex-col'}`}>

                {/* Video Call Section (Half width on Desktop, Half height on Mobile) */}
                {callActive && (
                    <div className="h-1/2 md:h-full w-full md:w-1/2 min-h-[250px] relative bg-black border-b md:border-b-0 md:border-r border-white/10 overflow-hidden animate-reveal">
                        {/* Remote Video (Stranger) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Local Video (Floating You) */}
                        <div className="absolute bottom-4 right-4 w-24 h-32 md:w-32 md:h-44 bg-slate-900 rounded-xl overflow-hidden border-2 border-white/10 shadow-2xl z-20">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover -scale-x-100"
                            />
                        </div>

                        {/* Peer Info Overlay */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{peer?.nickname}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Feed Section */}
                <div className={`relative min-h-0 w-full overflow-hidden flex flex-col ${callActive ? 'h-1/2 md:h-full md:w-1/2' : 'flex-1'}`}>
                    {status === 'searching' ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 md:space-y-8 animate-reveal px-6 text-center bg-[#0a0f1d]/40">
                            <div className="relative scale-90 md:scale-100">
                                <div className="w-20 h-20 md:w-36 md:h-36 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 backdrop-blur-3xl glow-blue">
                                    <MessageSquare className="w-8 h-8 md:w-12 md:h-12 text-blue-500/20" />
                                </div>
                                <div className="absolute inset-[-10px] md:inset-[-12px] border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                <h3 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase brand-glow">Matching...</h3>
                                <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-40">Scanning Global Network</p>
                            </div>
                        </div>
                    ) : (
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1.5 custom-scrollbar">
                            {messages.map((msg, idx) => {
                                if (msg.sender === 'system') {
                                    const isConnected = msg.type === 'connected';
                                    const isDisconnected = msg.type === 'disconnected';
                                    const isCall = msg.type === 'call';
                                    return (
                                        <div key={idx} className="flex justify-center py-0.5 animate-reveal">
                                            <span className={`px-5 py-1.5 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 shadow-lg ${
                                                isConnected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                                isDisconnected ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
                                                isCall ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                                                'bg-white/5 border-white/10 text-slate-400'
                                            }`}>
                                                {msg.text}
                                            </span>
                                        </div>
                                    );
                                }
                                const isMe = msg.sender === 'me';
                                return (
                                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-reveal`}>
                                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 text-sm md:text-base font-medium leading-relaxed shadow-sm transition-all ${
                                            isMe ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/10' : 'bg-[#1e293b]/90 text-slate-100 rounded-tl-none border border-white/5'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[8px] md:text-[9px] text-slate-600 mt-0.5 uppercase font-bold tracking-tighter opacity-40 px-1">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer (Inside Chat Feed Area to keep it attached to the bottom of the chat column) */}
                    <footer className="p-3 md:p-6 bg-black/40 border-t border-white/5 mt-auto">
                        <form onSubmit={handleSend} className="relative mb-3 md:mb-4">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 md:py-3.5 px-4 md:px-5 text-sm md:text-base focus:outline-none focus:border-blue-500/40 transition-all text-white placeholder:text-slate-600 font-medium"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={status !== 'connected'}
                            />
                            <button type="submit" disabled={status !== 'connected' || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-500 transition-all disabled:opacity-20 shadow-lg">
                                <Send className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </form>

                        <div className="flex gap-2 md:gap-3">
                            <button onClick={onLeave} className="flex-1 bg-slate-800/40 hover:bg-slate-700 text-white font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-3 md:py-4 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-lg">
                                <Home className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white transition-colors" />
                                <span>Home</span>
                            </button>
                            <button onClick={onNextUser} className={`flex-1 font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-3 md:py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-95 border border-white/5 ${
                                status === 'connected' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                            }`}>
                                {status === 'connected' ? <SkipForward className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" /> : <Sparkles className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />}
                                <span>{status === 'connected' ? 'Skip' : 'Next Match'}</span>
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </section>
    );
};

export default ChatPanel;
