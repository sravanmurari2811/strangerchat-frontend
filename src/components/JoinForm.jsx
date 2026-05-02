import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Video, MessageSquare, Zap, ShieldCheck, ChevronRight, Ghost, Sparkles, Globe, Shield, CircleAlert, Mars, Venus, Users } from 'lucide-react';

const JoinForm = ({ onJoin }) => {
    const [nickname, setNickname] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [error, setError] = useState('');
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
        setError('');

        if (!age) {
            setError("Age is required to ensure a safe community.");
            return;
        }

        if (age < 18) {
            setError("You must be at least 18 years old to enter.");
            return;
        }

        setInitialMode(mode);
        onJoin({ nickname: nickname || 'Stranger', age, gender, chatMode: mode });
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-['Plus_Jakarta_Sans']">

            <div className="max-w-6xl w-full flex flex-col items-center z-10">

                {/* Header Branding */}
                <div className="text-center mb-10 space-y-4 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase">
                        <Sparkles size={12} />
                        Masked Identity • Total Privacy
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-none brand-glow">
                        Mask<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">meet.</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-lg mx-auto text-lg">
                        The world's most secure and anonymous random video chat. Connect with real people, instantly.
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl">

                    {/* Interaction Card (Left) */}
                    <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] flex flex-col justify-between space-y-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-white tracking-tight">Personalize Profile</h2>

                            <div className="space-y-6">
                                {/* Nickname Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nickname (Optional)</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="Stranger"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Age & Gender Section */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Profile Details</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="18"
                                                value={age}
                                                onChange={(e) => {
                                                    setAge(e.target.value);
                                                    if(error) setError('');
                                                }}
                                                placeholder="Age (18+)"
                                                className={`w-full h-full bg-black/40 border ${error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-white/5'} rounded-2xl py-4 px-6 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-center text-lg`}
                                            />
                                        </div>

                                        {/* Modern Gender Card Selection */}
                                        <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1.5 gap-1.5">
                                            {[
                                                { id: 'male', icon: <Mars size={16} /> },
                                                { id: 'female', icon: <Venus size={16} /> },
                                                { id: 'other', icon: <Users size={16} /> }
                                            ].map((g) => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setGender(g.id)}
                                                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                                                        gender === g.id
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                                    }`}
                                                >
                                                    {g.icon}
                                                    <span className="text-[9px] font-black uppercase tracking-tighter mt-1">{g.id}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inline Error UI */}
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-[10px] font-black uppercase tracking-widest animate-reveal mt-2 bg-red-400/10 py-2 px-4 rounded-lg border border-red-400/20">
                                            <CircleAlert size={14} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mode Selection Buttons */}
                        <div className="grid grid-cols-1 gap-4 pt-6">
                            <button
                                onClick={(e) => handleSubmit(e, 'video')}
                                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl font-black tracking-widest text-white shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center justify-center gap-3 relative z-10">
                                    <Video size={24} /> START VIDEO CHAT
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>

                            <button
                                onClick={(e) => handleSubmit(e, 'text')}
                                className="group bg-slate-800/40 border border-white/5 p-6 rounded-2xl font-black tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <MessageSquare size={24} /> START TEXT CHAT
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Preview Area (Right) */}
                    <div className="relative group perspective-1000 animate-reveal" style={{ animationDelay: '0.2s' }}>
                        <div className="h-full bg-gradient-to-br from-slate-900 to-black border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl transition-transform duration-700 group-hover:rotate-y-1">
                            {initialMode === 'video' ? (
                                <div className="h-full w-full relative">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-80" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute bottom-8 left-8 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Live View Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center p-12 space-y-8 text-center">
                                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center animate-bounce-slow">
                                        <Ghost size={48} className="text-blue-400 opacity-40" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white">Masked Access</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                                            Start with a secure text link. You decide when to reveal your camera to a stranger.
                                        </p>
                                    </div>
                                    <div className="flex gap-4 opacity-30">
                                        <div className="p-3 bg-white/5 rounded-xl"><Globe size={20} /></div>
                                        <div className="p-3 bg-white/5 rounded-xl"><Shield size={20} /></div>
                                        <div className="p-3 bg-white/5 rounded-xl"><Zap size={20} /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Trust Footer */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 animate-reveal" style={{ animationDelay: '0.3s' }}>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <ShieldCheck className="text-blue-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Zap className="text-yellow-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global P2P Network</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Globe className="text-emerald-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Worldwide Access</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Shield className="text-purple-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">100% Private</span>
                    </div>
                </div>
            </div>

            {/* SEO Section */}
            <div className="max-w-4xl w-full mt-24 pb-12 border-t border-white/5 pt-12 relative z-10 opacity-40 text-center">
                <h2 className="text-xl font-black tracking-widest uppercase text-white mb-4">Official MaskMeet Chat</h2>
                <p className="text-sm leading-relaxed max-w-2xl mx-auto">
                    Welcome to <strong>MaskMeet</strong>, the premier destination for high-quality anonymous interaction.
                    Our technology connects you with strangers worldwide while maintaining 100% privacy and secure connections.
                </p>
            </div>
        </div>
    );
};

export default JoinForm;
