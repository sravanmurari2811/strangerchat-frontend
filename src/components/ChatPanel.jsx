import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, Shield, MessageCircle, MoreHorizontal } from 'lucide-react';

const ChatPanel = ({ onSendMessage, onNextUser }) => {
    const [message, setMessage] = useState('');
    const { messages, status, peer } = useChatStore();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
        <div className="flex flex-col h-full bg-[#020617]/80 backdrop-blur-3xl border-l border-white/5 w-full relative">
            {/* Header */}
            <div className="px-8 py-7 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <MessageCircle size={22} className="text-white fill-white/10" />
                        </div>
                        {status === 'connected' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#020617] animate-pulse" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-black text-sm text-white tracking-tight uppercase">
                            {status === 'connected' ? peer?.nickname : 'Conversation'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                                {status === 'connected' ? 'Secure Channel' : 'Establishing...'}
                            </span>
                        </div>
                    </div>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
            >
                {status !== 'connected' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-30 animate-reveal">
                        <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center">
                            <Shield size={32} className="text-slate-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 max-w-[200px] leading-relaxed">
                            Waiting for a secure peer connection...
                        </p>
                    </div>
                )}

                {messages.length === 0 && status === 'connected' && (
                    <div className="py-12 text-center animate-reveal">
                        <span className="glass text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full border border-white/5 shadow-xl">
                            Session Started
                        </span>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-reveal`}
                    >
                        <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm font-medium leading-relaxed shadow-2xl ${
                            msg.sender === 'me'
                            ? 'bg-blue-600 text-white rounded-tr-none glow-blue'
                            : 'bg-slate-800/50 text-slate-200 rounded-tl-none border border-white/5 backdrop-blur-md'
                        }`}>
                            {msg.text}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 mt-3 uppercase tracking-widest">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        placeholder={status === 'connected' ? "Type a message..." : "Waiting for match..."}
                        className="w-full bg-[#0a0a0a]/80 border border-white/5 rounded-[1.8rem] pl-7 pr-16 py-5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all disabled:opacity-30 font-medium"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={status !== 'connected'}
                    />
                    <button
                        type="submit"
                        disabled={status !== 'connected' || !message.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white p-3 rounded-2xl transition-all active:scale-90 shadow-lg shadow-blue-600/20"
                    >
                        <Send size={20} />
                    </button>
                </form>

                <button
                    onClick={onNextUser}
                    className="w-full bg-slate-800/40 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.8rem] flex items-center justify-center gap-3 border border-white/5 transition-all active:scale-[0.98] group"
                >
                    <SkipForward size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>{status === 'connected' ? 'Next Stranger' : 'Skip Queue'}</span>
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
