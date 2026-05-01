import React from 'react';
import useChatStore from './store/useChatStore';
import { useWebRTC } from './hooks/useWebRTC';
import JoinForm from './components/JoinForm';
import VideoPanel from './components/VideoPanel';
import ChatPanel from './components/ChatPanel';
import { MessageSquare } from 'lucide-react';

function App() {
    const { status, setUser, chatMode } = useChatStore();
    const { join, sendMessage, nextUser } = useWebRTC();

    const handleJoin = (userData) => {
        setUser(userData);
        join(userData);
    };

    if (status === 'idle') {
        return <JoinForm onJoin={handleJoin} />;
    }

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
            {/* Main Area */}
            {chatMode === 'video' ? (
                <main className="flex-1 relative h-[60%] md:h-full bg-black">
                    <VideoPanel />
                </main>
            ) : (
                <main className="hidden md:flex flex-1 relative h-full bg-[#0a0a0a] items-center justify-center border-r border-white/5">
                    <div className="flex flex-col items-center justify-center space-y-6 opacity-20">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                            <MessageSquare size={48} className="text-gray-400" />
                        </div>
                        <p className="text-xl font-bold uppercase tracking-[0.2em] text-gray-400">Text Chat Mode</p>
                    </div>
                </main>
            )}

            {/* Sidebar/Chat Area */}
            <aside className={`${chatMode === 'text' ? 'flex-1' : 'h-[40%] md:h-full w-full md:w-[380px] lg:w-[420px] xl:w-[450px]'} shadow-2xl z-30 transition-all duration-500`}>
                <ChatPanel
                    onSendMessage={sendMessage}
                    onNextUser={nextUser}
                />
            </aside>

            {/* Subtle background glow */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 blur-[120px] rounded-full" />
            </div>
        </div>
    );
}

export default App;
