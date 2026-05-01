import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Video, MessageSquare, Sparkles, Zap, ShieldCheck, ChevronRight, Ghost } from 'lucide-react';

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
            }
        };
        startPreview();
    }, [chatMode, setLocalStream, localStream]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (age < 18) {
            alert("You must be 18+ to enter.");
            return;
        }
        onJoin({ nickname: nickname || 'Stranger', age, gender, chatMode });
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#020617] flex items-center justify-center p-4 md:p-8 relative overflow-y-auto font-['Plus_Jakarta_Sans']">
            <div className="mesh-bg" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 py-8">
                <div className="space-y-10 text-center lg:text-left animate-reveal">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase">
                            <Ghost size={14} className="text-blue-400" /> Masked & Anonymous
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.85]">
                            Mask<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">meet.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            The ultimate anonymous meeting ground. Connect with people worldwide while keeping your identity <span className="text-white border-b-2 border-blue-500/30">masked</span>.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-80">
                        <div className="flex items-center gap-4">
                            <Zap size={24} className="text-blue-400" />
                            <div className="text-left">
                                <h4 className="font-bold text-white text-base">Instant Pair</h4>
                                <p className="text-slate-500 text-xs uppercase tracking-[0.1em]">Zero-Wait matching</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ShieldCheck size={24} className="text-emerald-400" />
                            <div className="text-left">
                                <h4 className="font-bold text-white text-base">Privacy</h4>
                                <p className="text-slate-500 text-xs uppercase tracking-[0.1em]">Encrypted sessions</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-1.5 rounded-[3.5rem] shadow-2xl animate-reveal [animation-delay:0.1s]">
                    <div className="bg-[#0f172a]/90 rounded-[3.2rem] p-8 md:p-12 space-y-8">
                        <div className="flex p-1.5 bg-black/40 rounded-[2rem] border border-white/5">
                            <button type="button" onClick={() => setChatMode('video')} className={`flex-1 flex items-center justify-center gap-3 py-4.5 rounded-[1.5rem] text-xs font-black tracking-[0.1em] transition-all duration-300 ${chatMode === 'video' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Video size={16} /> VIDEO
                            </button>
                            <button type="button" onClick={() => setChatMode('text')} className={`flex-1 flex items-center justify-center gap-3 py-4.5 rounded-[1.5rem] text-xs font-black tracking-[0.1em] transition-all duration-300 ${chatMode === 'text' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 hover:text-slate-300'}`}>
                                <MessageSquare size={16} /> TEXT
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-inner">
                            {chatMode === 'video' ? (
                                <>
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce" />
                                            <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Preview Ready</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-6 text-slate-700">
                                    <Ghost size={48} className="opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">Identity Masked</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Display name (optional)" className="input-field pl-16 font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" required min="18" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="input-field font-bold" />
                                    <div className="relative">
                                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-field appearance-none cursor-pointer font-bold">
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <ChevronRight size={18} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary w-full group py-6">
                                Enter Maskmeet <ChevronRight className="group-hover:translate-x-1.5 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JoinForm;
