import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { Send, SkipForward, MessageSquare, Home, Video, Mic, Sparkles, Phone, X, MicOff, VideoOff, RefreshCw } from 'lucide-react';

/**
 * ChatPanel Component
 * Handles messaging and call signaling UI with non-blocking banners.
 */
const ChatPanel = ({
    onSendMessage,
    onNextUser,
    requestCall,
    handleAcceptCall,
    declineCall,
    onCancelCall,
    onLeave,
    onEndCall,
    onToggleMute,
    onToggleVideo,
    onSwitchCamera
}) => {
    const [message, setMessage] = useState('');
    const {
        messages, status, peer, chatMode,
        incomingCall, callRequest, initialMode,
        isMuted, isVideoOff
    } = useChatStore();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, status]);

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

            {/* Incoming Call Notification */}
            {incomingCall && (
                <div className="absolute top-0 left-0 right-0 z-[100] bg-blue-600/95 backdrop-blur-md p-3 md:p-4 flex items-center justify-between animate-reveal border-b border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            {incomingCall === 'video' ? <Video className="w-4 h-4 md:w-6 md:h-6 text-white" /> : <Phone className="w-4 h-4 md:w-6 md:h-6 text-white" />}
                        </div>
                        <div className="min-w-0 text-left">
                            <p className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Incoming {incomingCall} call</p>
                            <p className="text-white/70 text-[11px] font-bold truncate">{peer?.nickname} calling...</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={declineCall} className="p-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl text-white transition-colors shadow-lg" title="Decline">
                            <X className="w-4 h-4 md:w-6 md:h-6" />
                        </button>
                        <button onClick={handleAcceptCall} className="p-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-colors shadow-lg animate-bounce-slow" title="Accept">
                            <Phone className="w-4 h-4 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* Outgoing Call Notification */}
            {callRequest && (
                <div className="absolute top-0 left-0 right-0 z-[100] bg-slate-900/95 backdrop-blur-md p-3 md:p-4 flex items-center justify-between animate-reveal border-b border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Phone className="w-4 h-4 md:w-6 md:h-6 text-blue-500 animate-pulse" />
                        </div>
                        <div className="min-w-0 text-left">
                            <p className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Calling {peer?.nickname}...</p>
                            <p className="text-slate-500 text-[10px] font-bold uppercase">Waiting for answer</p>
                        </div>
                    </div>
                    <button onClick={onCancelCall} className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all whitespace-nowrap">
                        Cancel
                    </button>
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

                <div className="flex items-center gap-1.5 md:gap-2">
                    {status === 'connected' && !isMediaMode && (
                        <>
                            <button onClick={() => requestCall('audio')} className="p-1.5 md:p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all" title="Audio Call"><Mic className="w-4 h-4 md:w-5 md:h-5" /></button>
                            <button onClick={() => requestCall('video')} className="p-1.5 md:p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all" title="Video Call"><Video className="w-4 h-4 md:w-5 md:h-5" /></button>
                            {initialMode === 'video' && (
                                <button onClick={onNextUser} className="p-1.5 md:p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 ml-1" title="End Call">
                                    <Phone className="w-4 h-4 md:w-6 md:h-6 rotate-[135deg]" />
                                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">End Call</span>
                                </button>
                            )}
                        </>
                    )}

                    {(status === 'connected' || status === 'searching') && isMediaMode && (
                        <>
                            <button onClick={onToggleMute} className={`p-1.5 md:p-2.5 rounded-lg transition-all ${isMuted ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-slate-400 hover:text-white'}`} title={isMuted ? "Unmute" : "Mute"}>
                                {isMuted ? <MicOff className="w-4 h-4 md:w-6 md:h-6" /> : <Mic className="w-4 h-4 md:w-6 md:h-6" />}
                            </button>
                            {chatMode === 'video' && (
                                <>
                                    <button onClick={onToggleVideo} className={`p-1.5 md:p-2.5 rounded-lg transition-all ${isVideoOff ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-slate-400 hover:text-white'}`} title={isVideoOff ? "Video On" : "Video Off"}>
                                        {isVideoOff ? <VideoOff className="w-4 h-4 md:w-6 md:h-6" /> : <Video className="w-4 h-4 md:w-6 md:h-6" />}
                                    </button>
                                    <button onClick={onSwitchCamera} className="p-1.5 md:p-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all" title="Switch Camera"><RefreshCw className="w-4 h-4 md:w-6 md:h-6" /></button>
                                </>
                            )}
                            {(initialMode === 'text' || status === 'connected') && (
                                <button onClick={status === 'connected' ? onEndCall : onNextUser} className="p-1.5 md:p-2.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 ml-1" title="End Call">
                                    <Phone className="w-4 h-4 md:w-6 md:h-6 rotate-[135deg]" />
                                    <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">End Call</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </header>

            {/* Content Area: Search Animation or Chat Feed */}
            <div className="flex-1 relative min-h-0 w-full overflow-hidden">
                {status === 'searching' && !isMediaMode ? (
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
                    <div ref={scrollRef} className="h-full overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => {
                            if (msg.sender === 'system') {
                                const isConnected = msg.type === 'connected';
                                const isDisconnected = msg.type === 'disconnected';
                                return (
                                    <div key={idx} className="flex justify-center py-2 animate-reveal">
                                        <span className={`px-5 py-2 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border transition-all duration-300 shadow-lg ${
                                            isConnected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                                            isDisconnected ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' :
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
                                    <span className="text-[8px] md:text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter opacity-40 px-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="p-3 md:p-6 bg-black/40 border-t border-white/5">
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
        </section>
    );
};

export default ChatPanel;
