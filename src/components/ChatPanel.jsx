import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageSquare, Home, Shield, UserX, Video, Mic, X, CircleAlert } from 'lucide-react';

const ChatPanel = ({ onSendMessage, onNextUser, requestCall, handleAcceptCall, declineCall }) => {
    const [message, setMessage] = useState('');
    const {
        messages, status, peer, goHome, chatMode,
        incomingCall, callRequest, setCallRequest
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

    return (
        <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-3xl md:border-l border-white/5 w-full relative overflow-hidden font-['Plus_Jakarta_Sans']">

            {/* Header with Call Options */}
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-white/5 flex justify-between items-center bg-black/40 z-50">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <MessageSquare size={22} className="text-blue-500 fill-blue-500/10" />
                        </div>
                        {status === 'connected' && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-black text-xs md:text-sm text-white tracking-tight uppercase truncate max-w-[100px] md:max-w-none">
                            {status === 'connected' ? peer?.nickname : 'Secure Chat'}
                        </h2>
                        {status === 'connected' && (
                             <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">online</span>
                            </div>
                        )}
                    </div>
                </div>

                {status === 'connected' && chatMode === 'text' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => requestCall('audio')}
                            disabled={callRequest !== null}
                            className={`p-3 rounded-xl border border-white/5 transition-all active:scale-90 ${callRequest === 'audio' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Mic size={18} />
                        </button>
                        <button
                            onClick={() => requestCall('video')}
                            disabled={callRequest !== null}
                            className={`p-3 rounded-xl border border-white/5 transition-all active:scale-90 ${callRequest === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Video size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Incoming Call Overlay */}
            {incomingCall && (
                <div className="absolute top-24 left-4 right-4 z-[100] animate-reveal">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 shadow-[0_0_60px_rgba(30,27,75,0.8)] flex flex-col items-center space-y-6 border border-white/20">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                            {incomingCall === 'video' ? <Video size={40} className="text-white" /> : <Mic size={40} className="text-white" />}
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-1">Incoming Request</p>
                            <h3 className="text-xl font-black text-white">{peer?.nickname} wants a {incomingCall} call</h3>
                        </div>
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={handleAcceptCall}
                                className="flex-1 bg-white text-blue-600 font-black py-5 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
                            >
                                ACCEPT
                            </button>
                            <button
                                onClick={declineCall}
                                className="flex-1 bg-black/20 text-white font-black py-5 rounded-2xl hover:bg-black/30 transition-all active:scale-95 border border-white/10"
                            >
                                DECLINE
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Outgoing Request Status */}
            {callRequest && (
                <div className="px-8 py-3 bg-blue-600/10 border-b border-blue-500/20 flex justify-between items-center animate-reveal">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                            Waiting for response...
                        </span>
                    </div>
                    <button onClick={() => setCallRequest(null)} className="text-slate-500 hover:text-white">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
                {status === 'searching' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30 animate-reveal">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center animate-[spin_8s_linear_infinite]">
                            <Shield size={24} className="text-slate-600" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Connecting to Galaxy...</p>
                    </div>
                )}

                {status === 'disconnected' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 animate-reveal">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                            <UserX size={28} className="text-rose-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 text-center">Connection Terminated</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-reveal`}>
                        <div className={`max-w-[85%] rounded-xl md:rounded-[1.4rem] px-5 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium leading-relaxed shadow-lg ${
                            msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/60 text-slate-100 rounded-tl-none border border-white/5 backdrop-blur-md'
                        }`}>
                            {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-600 mt-2 font-black uppercase px-2 opacity-50">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="p-4 md:p-8 bg-black/40 border-t border-white/5 space-y-4">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        placeholder={status === 'connected' ? "Say something..." : "Waiting for match..."}
                        className="input-field pr-16 font-bold"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={status !== 'connected'}
                    />
                    <button type="submit" disabled={status !== 'connected' || !message.trim()} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-2.5 md:p-3 rounded-xl transition-all active:scale-90 shadow-lg shadow-blue-600/20">
                        <Send size={18} />
                    </button>
                </form>

                <div className="flex gap-3">
                    <button onClick={onNextUser} className="flex-[2] bg-slate-800/50 hover:bg-slate-800 text-white font-black text-[10px] md:text-xs uppercase tracking-widest py-4 md:py-5 rounded-xl md:rounded-[2rem] flex items-center justify-center gap-2 border border-white/5 transition-all active:scale-[0.98] group">
                        <SkipForward size={18} className="group-hover:translate-x-0.5 transition-transform" />
                        <span>Find Next</span>
                    </button>
                    <button onClick={goHome} className="flex-1 bg-black/40 hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 font-black text-[10px] md:text-xs uppercase tracking-widest py-4 md:py-5 rounded-xl md:rounded-[2rem] flex items-center justify-center gap-2 border border-white/5 transition-all active:scale-[0.98]">
                        <Home size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
