import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageSquare, Home, Video, Mic, PhoneOff, Sparkles, Phone, X } from 'lucide-react';

/**
 * ChatPanel Component
 * Handles messaging and call signaling UI.
 */
const ChatPanel = ({
    onSendMessage,
    onNextUser,
    requestCall,
    handleAcceptCall,
    declineCall,
    onCancelCall,
    onLeave,
    onEndCall
}) => {
    const [message, setMessage] = useState('');
    const {
        messages, status, peer, chatMode,
        incomingCall, callRequest
    } = useChatStore();
    const scrollRef = useRef(null);

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
        <section className="flex flex-col h-full bg-[#0a0f1d]/60 backdrop-blur-3xl md:border-l border-white/5 w-full relative overflow-hidden font-['Plus_Jakarta_Sans']" aria-label="Chat Interface">

            {/* Incoming Call Overlay */}
            {incomingCall && (
                <div className="absolute inset-0 z-[100] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-reveal">
                    <div className="w-full max-w-sm bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 text-center space-y-8 shadow-2xl">
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                                {incomingCall === 'video' ? <Video size={40} className="text-white" /> : <Phone size={40} className="text-white" />}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Incoming {incomingCall} call</h3>
                            <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Stranger wants to connect</p>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={declineCall} className="flex-1 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 py-4 rounded-2xl text-slate-400 hover:text-rose-500 font-bold transition-all flex items-center justify-center gap-2">
                                <X size={20} />
                                <span>Decline</span>
                            </button>
                            <button onClick={handleAcceptCall} className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl text-white font-black shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 animate-bounce-slow">
                                <Phone size={20} />
                                <span>Accept</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Outgoing Call Overlay */}
            {callRequest && (
                <div className="absolute inset-0 z-[100] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center p-6 animate-reveal">
                    <div className="text-center space-y-8">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                            <div className="relative w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                                <Phone size={32} className="text-blue-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-white font-black tracking-[0.2em] uppercase text-xs">Calling Stranger...</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">Waiting for answer</p>
                        </div>
                        <button onClick={onCancelCall} className="px-10 py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                            Cancel Call
                        </button>
                    </div>
                </div>
            )}

            {/* Header: Identity and Call Controls */}
            <header className="px-5 py-3 md:px-6 md:py-4 border-b border-white/5 flex justify-between items-center bg-black/30 z-50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <MessageSquare size={18} className="text-blue-500" />
                        </div>
                        {status === 'connected' && (
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0f172a]" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold text-[11px] md:text-sm text-white tracking-wider uppercase truncate">
                            {status === 'connected' ? peer?.nickname : (status === 'disconnected' ? 'Stranger Left' : 'Anonymous Match')}
                        </h2>
                        {status === 'connected' && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Live</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {status === 'connected' && !isMediaMode && (
                        <>
                            <button onClick={() => requestCall('audio')} className="p-2 md:p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all" title="Audio Call"><Mic size={18} /></button>
                            <button onClick={() => requestCall('video')} className="p-2 md:p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all" title="Video Call"><Video size={18} /></button>
                        </>
                    )}
                    {isMediaMode && (
                        <button onClick={onEndCall} className="p-2 md:p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20" title="End Call"><PhoneOff size={18} /></button>
                    )}
                </div>
            </header>

            {/* Chat Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                {messages.map((msg, idx) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={idx} className="flex justify-center py-1">
                                <span className="px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/5 border border-white/5 text-slate-500">
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
                            <span className="text-[8px] md:text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter opacity-40 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <footer className="p-4 md:p-6 bg-black/40 border-t border-white/5">
                <form onSubmit={handleSend} className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-5 text-sm md:text-base focus:outline-none focus:border-blue-500/40 transition-all text-white placeholder:text-slate-600 font-medium"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={status !== 'connected'}
                    />
                    <button type="submit" disabled={status !== 'connected' || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-500 transition-all disabled:opacity-20 shadow-lg">
                        <Send size={18} />
                    </button>
                </form>

                <div className="flex gap-3">
                    <button
                        onClick={onLeave}
                        className="flex-1 bg-slate-800/40 hover:bg-slate-700 text-white font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 group active:scale-95 shadow-lg"
                    >
                        <Home size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                        <span>Home</span>
                    </button>

                    <button
                        onClick={onNextUser}
                        className={`flex-1 font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-95 border border-white/5 ${
                            status === 'connected'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                        }`}
                    >
                        {status === 'connected' ? <SkipForward size={16} className="group-hover:translate-x-0.5 transition-transform" /> : <Sparkles size={16} className="animate-pulse" />}
                        <span>{status === 'connected' ? 'Skip' : 'Next Match'}</span>
                    </button>
                </div>
            </footer>
        </section>
    );
};

export default ChatPanel;
