import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Video, MessageSquare, Zap, ShieldCheck, ChevronRight, Ghost, Sparkles, Globe, Shield, AlertCircle } from 'lucide-react';

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
    }, [initialMode, setLocalStream, localStream]);

    const handleSubmit = (e, mode) => {
        e.preventDefault();
        setError('');

        if (!age) {
            setError("Age is required to ensure safety.");
            return;
        }

        if (parseInt(age) < 18) {
            setError("Safety first: You must be 18+ to enter.");
            return;
        }

        setInitialMode(mode);
        onJoin({ nickname: nickname.trim() || 'Stranger', age, gender, chatMode: mode });
    };

    return (
        <main className="min-h-screen w-full flex flex-col items-center p-4 md:p-8 relative overflow-y-auto overflow-x-hidden font-['Plus_Jakarta_Sans'] perspective-2000 scroll-smooth" role="main">

            {/* SEO Content (Hidden from view, but readable by Google) */}
            <h1 className="sr-only">MaskMeet - Free Anonymous Stranger Video Chat & Text Matchmaking</h1>
            <p className="sr-only">Connect with strangers worldwide using our secure P2P encrypted video chat platform. No registration required for instant random video chat.</p>

            {/* 3D Decorative Elements - Changed to fixed and -z-10 to stay in background while scrolling */}
            <div className="fixed top-20 left-[10%] w-32 h-32 bg-blue-500/10 rounded-3xl rotate-12 blur-2xl animate-pulse pointer-events-none -z-10" />
            <div className="fixed bottom-20 right-[10%] w-40 h-40 bg-purple-500/10 rounded-full -rotate-12 blur-3xl animate-pulse pointer-events-none -z-10" />

            <div className="max-w-6xl w-full flex flex-col items-center z-10 preserve-3d py-10">

                <header className="text-center mb-10 md:mb-16 space-y-4 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase backdrop-blur-md">
                        <Sparkles size={12} className="animate-pulse" />
                        Next-Gen Anonymous Networking
                    </div>
                    <div className="text-6xl md:text-[10rem] font-black tracking-tighter text-white leading-none brand-glow select-none">
                        Mask<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500">Meet.</span>
                    </div>
                    <p className="text-slate-400 font-medium max-w-xl mx-auto text-base md:text-xl px-4 opacity-80">
                        Encrypted. Anonymous. Instant. The future of meeting strangers online, reimagined with total privacy.
                    </p>
                </header>

                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch max-w-6xl px-4">

                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="glass-panel p-8 md:p-14 rounded-[3rem] flex flex-col justify-between space-y-8 animate-reveal hover-3d-card preserve-3d"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                    <ShieldCheck className="text-blue-500" size={24} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Identity Setup</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label htmlFor="nickname" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Your Alias</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} aria-hidden="true" />
                                        <input
                                            id="nickname"
                                            type="text"
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                            placeholder="Enter nickname..."
                                            className="w-full bg-black/40 border border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 focus:outline-none focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 transition-all font-bold text-slate-200 text-lg shadow-inner"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="age" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Profile Specs</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="relative">
                                            <input
                                                id="age"
                                                type="number"
                                                required
                                                min="18"
                                                value={age}
                                                onChange={(e) => {
                                                    setAge(e.target.value);
                                                    if(error) setError('');
                                                }}
                                                placeholder="Age (18+)"
                                                className={`w-full h-full bg-black/40 border ${error ? 'border-red-500/50 ring-4 ring-red-500/5' : 'border-white/10'} rounded-[1.5rem] py-5 px-8 focus:outline-none focus:border-blue-500/50 transition-all font-black text-center text-xl shadow-inner`}
                                            />
                                        </div>

                                        <div className="flex bg-black/40 border border-white/10 rounded-[1.5rem] p-2 gap-2 shadow-inner" role="group" aria-label="Select Gender">
                                            {[
                                                { id: 'male', label: 'M' },
                                                { id: 'female', label: 'F' },
                                                { id: 'other', label: 'O' }
                                            ].map((g) => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setGender(g.id)}
                                                    aria-pressed={gender === g.id}
                                                    className={`flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all duration-300 ${
                                                        gender === g.id
                                                        ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] scale-105'
                                                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-sm font-black uppercase tracking-tighter">{g.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-3 text-red-400 text-[10px] font-black uppercase tracking-widest animate-reveal mt-3 bg-red-400/10 py-3 px-5 rounded-xl border border-red-400/20" role="alert">
                                            <AlertCircle size={14} />
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-6">
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'video')}
                                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-7 rounded-[1.8rem] font-black tracking-[0.2em] text-white shadow-2xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center justify-center gap-4 relative z-10 text-sm md:text-base">
                                    <Video size={24} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
                                    <span>LAUNCH VIDEO CHAT</span>
                                    <ChevronRight className="group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, 'text')}
                                className="group bg-slate-800/20 border border-white/5 p-6 md:p-7 rounded-[1.8rem] font-black tracking-[0.2em] text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base backdrop-blur-sm"
                            >
                                <div className="flex items-center justify-center gap-4">
                                    <MessageSquare size={24} aria-hidden="true" />
                                    <span>TEXT-ONLY MODE</span>
                                </div>
                            </button>
                        </div>
                    </form>

                    <aside className="relative group animate-reveal hidden lg:block" style={{ animationDelay: '0.2s' }} aria-label="Feature Preview">
                        <div className="h-full bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[3rem] overflow-hidden relative shadow-2xl hover-3d-card preserve-3d">
                            {initialMode === 'video' ? (
                                <div className="h-full w-full relative">
                                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                    <div className="absolute bottom-10 left-10 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">System: Camera Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center p-16 space-y-10 text-center relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-10">
                                        <Zap size={120} aria-hidden="true" />
                                    </div>
                                    <div className="w-32 h-32 bg-blue-500/5 rounded-[2.5rem] flex items-center justify-center animate-bounce-slow border border-white/5 relative z-10 shadow-2xl">
                                        <Ghost size={64} className="text-blue-400/40" />
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        <h3 className="text-3xl font-black text-white tracking-tight">Incognito Mode</h3>
                                        <p className="text-slate-500 text-lg leading-relaxed max-w-sm mx-auto font-medium">
                                            Your session is ephemeral. No logs, no tracking, just pure interaction.
                                        </p>
                                    </div>
                                    <div className="flex gap-6 opacity-20 relative z-10">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10"><Globe size={24} /></div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10"><Shield size={24} /></div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10"><Zap size={24} /></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                </div>

                <section className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-30 animate-reveal" style={{ animationDelay: '0.3s' }} aria-label="Trust Badges">
                    <div className="flex flex-col items-center gap-3 text-center group">
                        <ShieldCheck className="text-blue-400 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Military-Grade Encryption</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-center group">
                        <Zap className="text-yellow-400 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ultra-Low Latency</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-center group">
                        <Globe className="text-emerald-400 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Matchmaking</span>
                    </div>
                    <div className="flex flex-col items-center gap-3 text-center group">
                        <Shield className="text-purple-400 group-hover:scale-110 transition-transform" size={28} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">100% Data Anonymity</span>
                    </div>
                </section>
            </div>

            <footer className="max-w-5xl w-full mt-24 pb-12 border-t border-white/5 pt-12 relative z-10 opacity-30 text-center px-6">
                <h2 className="text-xl md:text-2xl font-black tracking-[0.4em] uppercase text-white mb-6">MaskMeet Protocol v5.0</h2>
                <p className="text-xs md:text-sm leading-relaxed max-w-3xl mx-auto font-medium">
                    MaskMeet uses proprietary P2P technology to establish direct connections between users.
                    All communications are end-to-end encrypted and never stored on our servers.
                </p>
                <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-blue-400 transition-colors">Safety Guidelines</a>
                </div>
            </footer>
        </main>
    );
};

export default JoinForm;
