import React, { useEffect } from 'react';
import useChatStore from './store/useChatStore';
import { useWebRTC } from './hooks/useWebRTC';
import JoinForm from './components/JoinForm';
import VideoPanel from './components/VideoPanel';
import ChatPanel from './components/ChatPanel';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

function App() {
    const { status, setUser, chatMode } = useChatStore();

    // Initialize WebRTC hook ONCE here
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
        <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden bg-[#020617] relative">
            <div className="space-bg" aria-hidden="true" />

            {/* Main Content Area */}
            {showMedia ? (
                <main className="relative flex-1 bg-black overflow-hidden h-[45%] md:h-full animate-reveal" role="main">
                    <VideoPanel />
                </main>
            ) : (
                <main className="hidden md:flex flex-1 relative h-full items-center justify-center border-r border-white/5 overflow-hidden" role="main">
                    <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
                        <div className="relative">
                            <div className="w-40 h-40 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                                <MessageSquare size={48} className="text-slate-800" aria-hidden="true" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck size={40} className="text-blue-500/20" aria-hidden="true" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <p className="text-2xl font-black uppercase tracking-[0.4em] text-slate-700 select-none">
                                Private Link
                            </p>
                            <div className="flex items-center justify-center gap-2 opacity-20">
                                <Zap size={14} className="text-blue-400" aria-hidden="true" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Encrypted Connection</span>
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* Sidebar/Interaction Area */}
            <aside className={`flex flex-col overflow-hidden z-30 transition-all duration-700 ease-in-out
                ${!showMedia ? 'h-full w-full' : 'h-[55%] md:h-full w-full md:w-[380px] lg:w-[420px] xl:w-[480px] border-t md:border-t-0 md:border-l border-white/5'}`}
                role="complementary"
                aria-label="Chat and Interaction Sidebar">
                <ChatPanel
                    onSendMessage={rtc.sendMessage}
                    onNextUser={rtc.nextUser}
                    requestCall={rtc.requestCall}
                    handleAcceptCall={rtc.handleAcceptCall}
                    declineCall={rtc.declineCall}
                />
            </aside>
        </div>
    );
}

export default App;
