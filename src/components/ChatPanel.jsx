import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageCircle } from 'lucide-react';

const ChatPanel = ({ onSendMessage, onNextUser }) => {
    const [message, setMessage] = useState('');
    const { messages, status, peer } = useChatStore();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim() && status === 'connected') {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] border-l border-white/5 w-full relative">
            {/* Header */}
            <div className="px-5 py-4 md:px-8 md:py-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500">
                        <MessageCircle size={22} />
                    </div>
                    <div>
                        <h2 className="font-black text-xs md:text-sm text-white uppercase tracking-tight">
                            {status === 'connected' ? peer?.nickname : 'Chat'}
                        </h2>
                        <span className="text-[8px] md:text-[10px] font-black uppercase text-blue-400 opacity-60">
                            {status === 'connected' ? 'Secure Channel' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
                {status === 'searching' && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Matchmaking...</p>
                    </div>
                )}

                {status === 'disconnected' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Stranger Left</p>
                        <button onClick={onNextUser} className="px-6 py-2 bg-blue-600 rounded-full font-black text-[10px] uppercase">Find New Stranger</button>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'} animate-reveal`}>
                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm font-medium ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'}`}>
                            {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-600 mt-2 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ))}
            </div>

            {/* Input Controls */}
            <div className="p-4 md:p-8 bg-black/40 border-t border-white/5 space-y-4">
                <form onSubmit={handleSend} className="relative group">
                    <input
                        type="text"
                        placeholder={status === 'connected' ? "Type a message..." : "Waiting..."}
                        className="input-field pr-16"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={status !== 'connected'}
                    />
                    <button type="submit" disabled={status !== 'connected' || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-3 rounded-xl">
                        <Send size={18} />
                    </button>
                </form>

                <button onClick={onNextUser} className="btn-primary flex items-center justify-center gap-2">
                    <SkipForward size={18} />
                    <span>NEXT STRANGER</span>
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;
