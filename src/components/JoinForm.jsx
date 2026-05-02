import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Video, MessageSquare, Zap, ShieldCheck, ChevronRight, Ghost } from 'lucide-react';

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
            alert("Please confirm you are 18 or older to enter.");
            return;
        }
        onJoin({ nickname: nickname || 'Stranger', age, gender, chatMode });
    };

    return (
        <div className="min-h-[100dvh] w-full bg-[#020617] text-slate-200 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-y-auto overflow-x-hidden font-['Plus_Jakarta_Sans']">
            {/* Mesh Background */}
            <div className="mesh-bg" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 py-6 md:py-12">

                {/* Branding Section */}
                <div className="space-y-8 md:space-y-12 text-center lg:text-left animate-reveal flex flex-col items-center lg:items-start order-1">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
                            <Ghost size={14} className="text-blue-400" />
                            Anonymous & Secure
                        </div>
                        <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-9xl font-black tracking-tighter text-white leading-tight lg:leading-[0.8] brand-glow">
                            Mask<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">meet.</span>
                        </h1>
                        <p className="text-base md:text-xl text-slate-400 font-medium max-w-lg leading-relaxed opacity-80 px-4 md:px-0 mt-4">
                            The ultimate <strong>free stranger video chat</strong> platform. Connect worldwide while keeping your identity masked. Fast, free, and secure.
                        </p>
                    </div>

                    <div className="hidden lg:flex flex-wrap items-center gap-10 opacity-60">
                        <div className="flex items-center gap-4">
                            <Zap size={24} className="text-blue-400" />
                            <div className="text-left font-black uppercase">
                                <h4 className="text-white text-xs tracking-widest">Instant Match</h4>
                                <p className="text-[10px] text-slate-500 tracking-widest">Zero Latency</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <ShieldCheck size={24} className="text-emerald-400" />
                            <div className="text-left font-black uppercase">
                                <h4 className="text-white text-xs tracking-widest">Privacy First</h4>
                                <p className="text-[10px] text-slate-500 tracking-widest">End-to-End</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interaction Card */}
                <div className="glass-panel p-1 md:p-1.5 rounded-[3rem] md:rounded-[4rem] shadow-2xl animate-reveal w-full max-w-[500px] mx-auto order-2">
                    <div className="bg-[#0f172a]/90 rounded-[2.8rem] md:rounded-[3.8rem] p-8 md:p-14 space-y-8 md:space-y-12">

                        <div className="flex p-1.5 bg-black/40 rounded-[2rem] border border-white/5 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setChatMode('video')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] text-[11px] font-black tracking-widest transition-all duration-300 ${
                                    chatMode === 'video'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <Video size={16} /> VIDEO
                            </button>
                            <button
                                type="button"
                                onClick={() => setChatMode('text')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.6rem] text-[11px] font-black tracking-widest transition-all duration-300 ${
                                    chatMode === 'text'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                <MessageSquare size={16} /> TEXT
                            </button>
                        </div>

                        <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/10 ring-1 ring-white/5 shadow-2xl">
                            {chatMode === 'video' ? (
                                <>
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/90">LIVE PREVIEW</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 text-slate-700 bg-black/40">
                                    <Ghost size={48} className="opacity-10 animate-float" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30 text-center px-8 leading-loose">Privacy Protocol Active</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-10">
                            <div className="space-y-4">
                                <div className="relative group">
                                    <User className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="Pick a nickname..."
                                        className="input-field pl-16 font-bold text-base"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:gap-6">
                                    <input
                                        type="number"
                                        required
                                        min="18"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Age"
                                        className="input-field font-bold text-base text-center"
                                    />
                                    <div className="relative">
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="input-field appearance-none cursor-pointer font-bold text-base text-center pr-10"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full group py-6 md:py-7 rounded-[2rem] shadow-2xl shadow-blue-600/40"
                            >
                                <span className="relative z-10 flex items-center gap-4 text-base tracking-[0.2em]">
                                    START CHATTING
                                    <ChevronRight className="group-hover:translate-x-2 transition-transform size-6" />
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* SEO FOOTER SECTION */}
            <div className="max-w-4xl w-full mt-20 pb-20 relative z-10 border-t border-white/5 pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <div className="space-y-4">
                        <h2 className="text-xl font-black tracking-widest uppercase text-white">Stranger Chat Redefined</h2>
                        <p className="text-sm leading-relaxed">
                            Welcome to <strong>StrangerChat</strong>, the premier destination for high-quality, anonymous interaction.
                            Our platform is the top-rated <strong>MaskMeet alternative</strong>, designed to connect you with
                            people around the globe instantly. Whether you prefer <strong>free stranger video chat</strong> or
                            secure text messaging, our technology ensures a seamless experience.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-xl font-black tracking-widest uppercase text-white">Why Choose MaskMeet?</h2>
                        <p className="text-sm leading-relaxed">
                            Unlike other <strong>random video chat</strong> sites, we prioritize your security and privacy.
                            Our "masked" philosophy means you decide how much you share. Talk to strangers, make new friends,
                            and enjoy the best <strong>stranger chat</strong> features available online today. 100% Free. 100% Real.
                        </p>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-20">
                        © 2023 MaskMeet & StrangerChat. All Rights Reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinForm;
