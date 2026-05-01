import React, { useEffect } from 'react';
import useChatStore from './store/useChatStore';
import { useWebRTC } from './hooks/useWebRTC';
import JoinForm from './components/JoinForm';
import VideoPanel from './components/VideoPanel';
import ChatPanel from './components/ChatPanel';
import { MessageSquare } from 'lucide-react';

function App() {
    const { status, setUser, chatMode } = useChatStore();
    const { join, sendMessage, nextUser } = useWebRTC();

    // Wake up Render backend immediately on load
    useEffect(() => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        fetch(`${BACKEND_URL}/health`).catch(() => {});
    }, []);

    const handleJoin = (userData) => {
        setUser(userData);
        join(userData);
    };

    if (status === 'idle') {
        return <JoinForm onJoin={handleJoin} />;
    }

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] w-screen overflow-hidden bg-[#020617] relative">
            <div className="mesh-bg" />

            {/* Main Area: Video or Placeholder */}
            {chatMode === 'video' ? (
                <main className="relative flex-1 bg-black overflow-hidden h-[45%] md:h-full">
                    <VideoPanel />
                </main>
            ) : (
                <main className="hidden md:flex flex-1 relative h-full bg-[#020617] items-center justify-center border-r border-white/5">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-20 select-none">
                        <div className="w-40 h-40 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center">
                            <MessageSquare size={64} className="text-slate-400" />
                        </div>
                        <p className="text-2xl font-black uppercase tracking-[0.3em] text-slate-400">Secure Chat Mode</p>
                    </div>
                </main>
            )}

            {/* Sidebar/Interaction Area */}
            <aside className={`flex flex-col overflow-hidden z-30 transition-all duration-500
                ${chatMode === 'text' ? 'h-full w-full' : 'h-[55%] md:h-full w-full md:w-[380px] lg:w-[420px] xl:w-[480px] border-t md:border-t-0 md:border-l border-white/5'}`}>
                <ChatPanel
                    onSendMessage={sendMessage}
                    onNextUser={nextUser}
                />
            </aside>
        </div>
    );
}

export default App;
