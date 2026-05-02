import React, { useEffect } from 'react';
import useChatStore from './store/useChatStore';
import { useWebRTC } from './hooks/useWebRTC';
import JoinForm from './components/JoinForm';
import VideoPanel from './components/VideoPanel';
import ChatPanel from './components/ChatPanel';
import { ShieldCheck, Zap, Lock, EyeOff, Globe, Info, Heart } from 'lucide-react';

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
            <>
                <div className="space-bg" aria-hidden="true" />
                <JoinForm onJoin={handleJoin} />
            </>
        );
    }

    const showMedia = chatMode === 'video' || chatMode === 'audio';

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-[#020617] relative font-['Plus_Jakarta_Sans']">
            <div className="space-bg" aria-hidden="true" />

            {/* 25% Sidebar: About our site (Desktop only) */}
            {!showMedia && (
                <aside className="hidden md:flex md:w-1/4 h-full flex-col border-r border-white/10 bg-slate-900/60 backdrop-blur-3xl z-20 p-8 overflow-y-auto" role="complementary">
                    <div className="animate-reveal">
                        <div className="mb-10">
                            <h2 className="text-xl font-black tracking-tighter text-white brand-glow">
                                Mask<span className="text-blue-500">Meet.</span>
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">v5.0 Secure Network</p>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-4">The Platform</h3>
                                <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                                    MaskMeet is a privacy-first anonymous chat protocol. We connect strangers worldwide using direct Peer-to-Peer encrypted tunnels.
                                </p>
                            </section>

                            <section className="space-y-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                        <Lock size={14} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-100">E2E Encrypted</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Your data never touches our servers.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                        <EyeOff size={14} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-100">Anti-Logging</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">No history, no IPs, no footprints.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                        <Globe size={14} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-100">Global Nodes</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">Match with users in 150+ countries.</p>
                                    </div>
                                </div>
                            </section>

                            <div className="pt-8 border-t border-white/5">
                                <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck size={12} className="text-blue-400" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">Trust Protocol</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        MaskMeet uses WebRTC for direct browser-to-browser media and data exchange.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 opacity-30 flex items-center gap-2">
                            <Heart size={10} className="text-rose-500" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Built for Freedom</span>
                        </div>
                    </div>
                </aside>
            )}

            {/* Main Area: Chat Window / Media */}
            <main className={`relative h-full flex flex-col transition-all duration-500 ease-in-out
                ${!showMedia ? 'flex-1 md:w-3/4' : 'flex-1'}`} role="main">

                {showMedia ? (
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="flex-1 bg-black relative overflow-hidden h-[45%] md:h-full animate-reveal">
                            <VideoPanel />
                        </div>
                        <aside className="h-[55%] md:h-full w-full md:w-[380px] lg:w-[420px] xl:w-[460px] border-t md:border-t-0 md:border-l border-white/10 z-30 shadow-2xl">
                            <ChatPanel
                                onSendMessage={rtc.sendMessage}
                                onNextUser={rtc.nextUser}
                                requestCall={rtc.requestCall}
                                handleAcceptCall={rtc.handleAcceptCall}
                                declineCall={rtc.declineCall}
                                onLeave={rtc.leaveChat}
                                onEndCall={rtc.endCall}
                            />
                        </aside>
                    </div>
                ) : (
                    <ChatPanel
                        onSendMessage={rtc.sendMessage}
                        onNextUser={rtc.nextUser}
                        requestCall={rtc.requestCall}
                        handleAcceptCall={rtc.handleAcceptCall}
                        declineCall={rtc.declineCall}
                        onLeave={rtc.leaveChat}
                        onEndCall={rtc.endCall}
                    />
                )}
            </main>
        </div>
    );
}

export default App;
