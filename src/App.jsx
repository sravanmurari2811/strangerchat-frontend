import React, { useEffect } from 'react';
import useChatStore from './store/useChatStore';
import { useWebRTC } from './hooks/useWebRTC';
import JoinForm from './components/JoinForm';
import VideoPanel from './components/VideoPanel';
import ChatPanel from './components/ChatPanel';
import { MessageCircle, ShieldCheck, Zap, Lock, Globe, Heart } from 'lucide-react';

function App() {
    const { status, setUser, chatMode } = useChatStore();
    const rtc = useWebRTC();

    useEffect(() => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        fetch(`${BACKEND_URL}/health`).catch(() => {});
    }, []);

    const handleJoin = (userData) => {
        setUser(userData);
        rtc.join(userData);
    };

    if (status === 'idle') {
        return (
            <div className="fixed inset-0 overflow-hidden h-[100dvh] w-full bg-[#020617]">
                <div className="space-bg absolute inset-0" aria-hidden="true" />
                <div className="relative z-10 h-full w-full overflow-y-auto custom-scrollbar">
                    <JoinForm onJoin={handleJoin} />
                </div>
            </div>
        );
    }

    const showMedia = chatMode === 'video' || chatMode === 'audio';

    return (
        <div className="fixed inset-0 flex flex-col md:flex-row w-full h-[100dvh] overflow-hidden bg-[#020617] font-['Plus_Jakarta_Sans']">
            {/* Global Background */}
            <div className="space-bg absolute inset-0 pointer-events-none" aria-hidden="true" />

            {/* Sidebar: Desktop Only (Only when not in media mode) */}
            {!showMedia && (
                <aside className="hidden md:flex md:w-[30%] lg:w-[25%] h-full flex-col border-r border-white/10 bg-slate-900/40 backdrop-blur-3xl z-20 p-8 overflow-y-auto custom-scrollbar">
                    <div className="animate-reveal space-y-10">
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter text-white brand-glow flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <MessageCircle size={20} className="text-white fill-white/20" />
                                </div>
                                Mask<span className="text-blue-500">Meet.</span>
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-3 ml-1">Privacy First Chat</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Status</p>
                                <p className="text-emerald-400 text-sm font-black">ACTIVE</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Security</p>
                                <p className="text-blue-400 text-sm font-black">AES-256</p>
                            </div>
                        </div>

                        <nav className="space-y-6">
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4 px-1">Security Standards</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                                            <Lock size={16} className="text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">P2P Encrypted</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                                            <ShieldCheck size={16} className="text-emerald-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Identity Guard</span>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                                            <Globe size={16} className="text-purple-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-300">Global Match</span>
                                    </div>
                                </div>
                            </section>
                        </nav>

                        <div className="pt-10 flex flex-col gap-4">
                            <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-2xl p-5 border border-blue-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={14} className="text-blue-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Low Latency</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    Real-time P2P data flow via WebRTC secure sockets.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 opacity-40 px-1">
                                <Heart size={12} className="text-rose-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Secure Network</span>
                            </div>
                        </div>
                    </div>
                </aside>
            )}

            <main className="relative flex-1 flex flex-col min-h-0 h-full w-full overflow-hidden z-20">
                <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 w-full">
                    {showMedia && (
                        <div className="h-[40%] md:h-full md:flex-1 bg-black relative overflow-hidden animate-reveal border-b md:border-b-0 border-white/5">
                            <VideoPanel
                                onToggleMute={rtc.toggleMute}
                                onToggleVideo={rtc.toggleVideo}
                                onSwitchCamera={rtc.switchCamera}
                            />
                        </div>
                    )}
                    <aside className={`flex flex-col min-h-0 relative ${
                        showMedia
                        ? 'h-[60%] md:h-full md:w-[360px] lg:w-[400px] border-t md:border-t-0 md:border-l'
                        : 'flex-1 h-full w-full'
                    } border-white/10 shadow-2xl bg-[#020617]/80 backdrop-blur-md overflow-hidden`}>
                        <ChatPanel
                            onSendMessage={rtc.sendMessage}
                            onNextUser={rtc.nextUser}
                            requestCall={rtc.requestCall}
                            handleAcceptCall={rtc.handleAcceptCall}
                            declineCall={rtc.declineCall}
                            onCancelCall={rtc.cancelCall}
                            onLeave={rtc.leaveChat}
                            onEndCall={rtc.endCall}
                            onToggleMute={rtc.toggleMute}
                            onToggleVideo={rtc.toggleVideo}
                            onSwitchCamera={rtc.switchCamera}
                        />
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default App;
