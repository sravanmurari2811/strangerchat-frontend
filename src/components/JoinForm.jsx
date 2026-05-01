import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Users, ShieldCheck, Video, MessageSquare, Sparkles, Zap, ChevronRight } from 'lucide-react';

const JoinForm = ({ onJoin }) => {
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const { chatMode, setChatMode, setLocalStream, localStream } = useChatStore();
    const videoRef = useRef(null);

    useEffect(() => {
        const startPreview = async () => {
            if (chatMode === 'video') {
                if (localStream) {
                    if (videoRef.current) {
                        videoRef.current.srcObject = localStream;
                    }
                    return;
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setLocalStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                }
            } else {
                // If switching to text mode, we might want to stop the stream
                // but let's keep it simple for now and just set store to null if needed
                // setLocalStream(null);
            }
        };
        startPreview();

        // Removed the cleanup that stops tracks here because we need them for the actual chat
    }, [chatMode, setLocalStream, localStream]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (age < 18) {
            alert("Please confirm you are 18 or older to continue.");
            return;
        }
        onJoin({ nickname: nickname || 'Stranger', age, gender, chatMode });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans']">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* Branding / Hero Section */}
                <div className="space-y-12 px-4 lg:px-0 text-center lg:text-left animate-reveal">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
                            <Sparkles size={14} />
                            The Global Meeting Ground
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black tracking-tight text-white leading-[0.9]">
                            Talk to <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Strangers.</span>
                        </h1>
                        <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed text-gradient">
                            Discover the next generation of social interaction. Fast, free, and completely anonymous.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                        <div className="flex items-center gap-4 group">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-all shadow-xl">
                                <Zap className="text-blue-400" size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-base">Instant Matching</h4>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-black opacity-50">No-wait matchmaking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/30 transition-all shadow-xl">
                                <ShieldCheck className="text-emerald-400" size={24} />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-base">Privacy Mode</h4>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-black opacity-50">Encrypted sessions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Interaction Card */}
                <div className="glass-panel p-1.5 rounded-[3rem] animate-reveal [animation-delay:0.1s]">
                    <div className="bg-[#0f172a]/80 rounded-[2.8rem] p-8 md:p-12 space-y-10">
                        {/* Tab Switcher */}
                        <div className="flex p-1.5 bg-black/40 rounded-3xl border border-white/5">
                            <button
                                onClick={() => setChatMode('video')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.25rem] text-sm font-black tracking-wide transition-all ${
                                    chatMode === 'video'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/25'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Video size={18} /> VIDEO CHAT
                            </button>
                            <button
                                onClick={() => setChatMode('text')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.25rem] text-sm font-black tracking-wide transition-all ${
                                    chatMode === 'text'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/25'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <MessageSquare size={18} /> TEXT ONLY
                            </button>
                        </div>

                        {/* Visual Preview */}
                        <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/10 ring-1 ring-white/5 group shadow-inner">
                            {chatMode === 'video' ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 mirror"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce" />
                                            <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1 h-3 bg-red-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Preview Ready</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-slate-700">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                        <MessageSquare size={32} className="opacity-20" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Privacy Mode Active</p>
                                </div>
                            )}
                        </div>

                        {/* Details Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Display name (optional)"
                                        className="input-field"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        required
                                        min="18"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Age"
                                        className="input-field"
                                    />
                                    <div className="relative">
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="input-field appearance-none cursor-pointer"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <ChevronRight size={18} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full"
                            >
                                Start Chatting
                                <ChevronRight className="group-hover:translate-x-1.5 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinForm;
