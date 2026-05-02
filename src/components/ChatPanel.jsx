import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageSquare, Home, Shield, Video, Mic, X, PhoneOff } from 'lucide-react';

/**
 * ChatPanel Component
 * Handles the messaging interface, system notifications, and media call requests.
 */
const ChatPanel = ({ onSendMessage, onNextUser, requestCall, handleAcceptCall, declineCall, onLeave, onEndCall }) => {
    const [message, setMessage] = useState('');
    const {
        messages, status, peer, chatMode,
        incomingCall, callRequest, setCallRequest
    } = useChatStore();
    const scrollRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim() && status === 'connected') {
            onSendMessage(message);
            setMessage('');
        }
    };

    const isMediaMode = chatMode === 'video' || chatMode === 'audio';

    return (
        <section className="flex flex-col h-full bg-slate-900/40 backdrop-blur-2xl md:border-l border-white/10 w-full relative overflow-hidden font-['Plus_Jakarta_Sans']" aria-label="Chat Interface">

            {/* Header with Connection Info */}
            <header className="px-4 py-3 md:px-6 md:py-4 border-b border-white/10 flex justify-between items-center bg-black/40 z-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/10 border border-blue-500/20">
                            <MessageSquare size={18} className="text-blue-500 fill-blue-500/10" aria-hidden="true" />
                        </div>
                        {status === 'connected' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f172a] animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-black text-[10px] md:text-xs text-white tracking-wider uppercase truncate">
                            {status === 'connected' ? peer?.nickname : (status === 'disconnected' ? 'Stranger Left' : 'Anonymous Match')}
                        </h2>
                        {status === 'connected' && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">online</span>
                                </div>
                            )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status === 'connected' && !isMediaMode && (
                        <div className="flex items-center gap-2 mr-2">
                            <button
                                onClick={() => requestCall('audio')}
                                disabled={callRequest !== null}
                                className={`p-2 md:p-2.5 rounded-xl border border-white/10 transition-all active:scale-90 ${callRequest === 'audio' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <Mic size={16} />
                            </button>
                            <button
                                onClick={() => requestCall('video')}
                                disabled={callRequest !== null}
                                className={`p-2 md:p-2.5 rounded-xl border border-white/10 transition-all active:scale-90 ${callRequest === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <Video size={16} />
                            </button>
                        </div>
                    )}

                    {isMediaMode && (
                        <button
                            onClick={onEndCall}
                            className="p-2 md:p-2.5 rounded-xl bg-rose-600 text-white shadow-lg hover:bg-rose-700 transition-all active:scale-90 border border-rose-500/20"
                            title="End Call"
                        >
                            <PhoneOff size={16} />
                        </button>
                    )}

                    <button onClick={onLeave} className="p-2 md:p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white border border-white/10 transition-all active:scale-90">
                        <Home size={18} />
                    </button>
                </div>
            </header>

            {/* Call Request UI */}
            {incomingCall && (
                <div className="absolute top-20 left-4 right-4 z-[100] animate-reveal">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-6 shadow-2xl border border-white/20 flex flex-col items-center space-y-4">
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                            {incomingCall === 'video' ? <Video size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
                        </div>
                        <h3 className="text-lg font-black text-white text-center">{peer?.nickname} wants a {incomingCall} call</h3>
                        <div className="flex gap-3 w-full">
                            <button onClick={handleAcceptCall} className="flex-1 bg-white text-blue-600 font-black py-3 rounded-xl hover:bg-slate-100 shadow-lg text-xs">ACCEPT</button>
                            <button onClick={declineCall} className="flex-1 bg-black/20 text-white font-black py-3 rounded-xl hover:bg-black/30 border border-white/10 text-xs">DECLINE</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Outgoing Request Status */}
            {callRequest && (
                <div className="px-4 py-2 bg-blue-600/20 border-b border-blue-500/20 flex justify-between items-center animate-reveal">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Waiting for response...</span>
                    </div>
                    <button onClick={() => setCallRequest(null)} className="text-slate-400 hover:text-white">
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Chat Messages Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-black/10" role="log" aria-live="polite">
                {status === 'searching' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40 animate-reveal">
                        <div className="w-14 h-14 border-2 border-dashed border-blue-500/30 rounded-full flex items-center justify-center animate-[spin_8s_linear_infinite]">
                            <Shield size={22} className="text-blue-500/50" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Finding match...</p>
                    </div>
                )}

                <div className="space-y-5">
                    {messages.map((msg, idx) => {
                        if (msg.sender === 'system') {
                            return (
                                <div key={idx} className="flex flex-col items-center justify-center py-2 animate-reveal">
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                                        msg.type === 'disconnected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-reveal`}>
                                <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-[13px] font-medium leading-relaxed shadow-sm ${
                                    msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                                }`}>
                                    {msg.text}
                                </div>
                                <span className="text-[8px] text-slate-500 mt-1.5 font-black uppercase tracking-widest px-1 opacity-60">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Interaction Footer Controls */}
            <footer className="p-4 md:p-6 bg-black/40 border-t border-white/10">
                <div className="space-y-4">
                    <form onSubmit={handleSend} className="relative group">
                        <input
                            type="text"
                            placeholder={status === 'connected' ? "Type message..." : (status === 'disconnected' ? "Connection lost" : "Waiting...")}
                            className="input-field pr-14 font-bold py-4 text-sm bg-black/60 border-white/10 text-slate-100 placeholder:text-slate-600"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={status !== 'connected'}
                        />
                        <button type="submit" disabled={status !== 'connected' || !message.trim()} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800/50 text-white p-2.5 rounded-xl transition-all active:scale-90 shadow-lg">
                            <Send size={18} />
                        </button>
                    </form>

                    <button onClick={onNextUser} className="w-full bg-slate-800/60 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-[0.3em] py-4 rounded-xl flex items-center justify-center gap-3 border border-white/10 transition-all active:scale-[0.98] group">
                        <SkipForward size={18} className="group-hover:translate-x-1 transition-transform" />
                        <span>{status === 'connected' ? 'Skip Stranger' : 'Next Match'}</span>
                    </button>
                </div>
            </footer>
        </section>
    );
};

export default ChatPanel;
