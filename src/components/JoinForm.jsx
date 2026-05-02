import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Video, MessageSquare, Zap, ShieldCheck, ChevronRight, Ghost, Sparkles, Globe2, Shield } from 'lucide-react';

const JoinForm = ({ onJoin }) => {
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const { initialMode, setInitialMode, setLocalStream, localStream } = useChatStore();
    const videoRef = useRef(null);

    useEffect(() => {
        const startPreview = async () => {
            if (initialMode === 'video') {
                if (localStream) {
                    if (videoRef.current) videoRef.current.srcObject = localStream;
                    return;
                }
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setLocalStream(stream);
                    if (videoRef.current) videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Camera access denied:", err);
                }
            } else {
                // If switching to text, stop the preview stream
                if (localStream) {
                    localStream.getTracks().forEach(track => track.stop());
                    setLocalStream(null);
                }
            }
        };
        startPreview();
    }, [initialMode, setLocalStream]);

    const handleSubmit = (e, mode) => {
        e.preventDefault();
        if (!age || age < 18) {
            alert("Please enter your age (18+ only).");
            return;
        }
        setInitialMode(mode);
        onJoin({ nickname: nickname || 'Stranger', age, gender, chatMode: mode });
    };

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-['Plus_Jakarta_Sans']">
            {/* Animated 3D-like Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Main Container */}
            <div className="max-w-6xl w-full flex flex-col items-center z-10">

                {/* Header Branding */}
                <div className="text-center mb-12 space-y-4 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
                        <Sparkles size={12} />
                        Next-Gen Anonymous Chat
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-none brand-glow">
                        Mask<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">meet.</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-lg mx-auto text-lg">
                        Meet strangers worldwide with a click. Similar to DuckChat, but with privacy and high-end video quality.
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl">

                    {/* Interaction Card (Left) */}
                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-between space-y-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-white tracking-tight">Personalize Profile</h2>
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Enter nickname..."
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-200"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        required
                                        min="18"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Age (18+)"
                                        className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-center"
                                    />
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="bg-black/40 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-center appearance-none cursor-pointer"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <button
                                onClick={(e) => handleSubmit(e, 'video')}
                                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl font-black tracking-widest text-white shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    <Video size={24} /> START VIDEO CHAT
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>

                            <button
                                onClick={(e) => handleSubmit(e, 'text')}
                                className="group bg-slate-800/50 border border-white/10 p-6 rounded-2xl font-black tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <MessageSquare size={24} /> START TEXT CHAT
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Preview/Info Card (Right) */}
                    <div className="relative group perspective-1000 animate-reveal" style={{ animationDelay: '0.2s' }}>
                        <div className="h-full bg-gradient-to-br from-slate-900 to-black border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-transform duration-700 group-hover:rotate-y-1">
                            {initialMode === 'video' ? (
                                <div className="h-full w-full relative">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute bottom-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Camera Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center p-12 space-y-8 text-center">
                                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
                                        <Ghost size={48} className="text-blue-400 opacity-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white">Privacy Mode</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Text-first connection. You can request audio or video calls once you've met someone cool.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 opacity-40">
                                        <div className="p-3 bg-white/5 rounded-xl"><Globe2 size={20} /></div>
                                        <div className="p-3 bg-white/5 rounded-xl"><Shield size={20} /></div>
                                        <div className="p-3 bg-white/5 rounded-xl"><Zap size={20} /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Trust Footer */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-30 animate-reveal" style={{ animationDelay: '0.3s' }}>
                    <div className="flex flex-col items-center gap-2">
                        <ShieldCheck className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Zap className="text-yellow-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Low Latency</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Globe2 className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global Pool</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <User className="text-purple-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">100% Private</span>
                    </div>
                </div>
            </div>

            {/* Content for SEO at the bottom */}
            <div className="max-w-4xl w-full mt-24 pb-12 border-t border-white/5 pt-12 relative z-10 opacity-40 text-center">
                <h2 className="text-xl font-black tracking-widest uppercase text-white mb-4">Stranger Chat by MaskMeet</h2>
                <p className="text-sm leading-relaxed max-w-2xl mx-auto">
                    Experience the best <strong>free stranger video chat</strong>. Our platform is the top <strong>MaskMeet alternative</strong> for high-quality random connections.
                    Whether you start with text or jump into video, we prioritize your safety and experience.
                </p>
            </div>
        </div>
    );
};

export default JoinForm;
