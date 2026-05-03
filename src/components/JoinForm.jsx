import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import {
  User,
  Video,
  MessageSquare,
  Zap,
  ShieldCheck,
  ChevronRight,
  Ghost,
  Sparkles,
  Globe,
  Shield,
  AlertCircle,
  Users
} from 'lucide-react';

const GENDER_OPTIONS = [
  { id: 'male', label: 'Male', icon: User, color: 'text-blue-400', activeBorder: 'border-blue-500/50', activeBg: 'bg-blue-500/10' },
  { id: 'female', label: 'Female', icon: User, color: 'text-rose-400', activeBorder: 'border-rose-500/50', activeBg: 'bg-rose-500/10' },
  { id: 'other', label: 'Other', icon: Users, color: 'text-purple-400', activeBorder: 'border-purple-500/50', activeBg: 'bg-purple-500/10' }
];

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
    <main className="min-h-[100dvh] w-full flex flex-col items-center p-4 md:p-6 relative overflow-y-auto overflow-x-hidden font-['Plus_Jakarta_Sans'] perspective-2000 scroll-smooth" role="main">
      <h1 className="sr-only">MaskMeet - Free Anonymous Stranger Video Chat & Text Matchmaking</h1>

      <div className="fixed top-20 left-[10%] w-24 h-24 bg-blue-500/10 rounded-3xl rotate-12 blur-2xl animate-pulse pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-[10%] w-32 h-32 bg-purple-500/10 rounded-full -rotate-12 blur-3xl animate-pulse pointer-events-none -z-10" />

      <div className="max-w-5xl w-full flex flex-col items-center z-10 preserve-3d py-6 md:py-10">
        <header className="text-center mb-8 md:mb-12 space-y-3 animate-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-black tracking-[0.3em] uppercase backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse" />
            Next-Gen Anonymous Networking
          </div>
          <div className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight brand-glow select-none">
            Mask<span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500">Meet.</span>
          </div>
          <p className="text-slate-400 font-medium max-w-lg mx-auto text-sm md:text-base px-4 opacity-90 leading-relaxed">
            Encrypted. Anonymous. Instant. The future of meeting strangers online, reimagined with total privacy.
          </p>
        </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-stretch max-w-5xl px-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="glass-panel p-5 md:p-8 rounded-[2rem] flex flex-col justify-between space-y-6 animate-reveal hover-3d-card preserve-3d"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck className="text-blue-500" size={20} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-white tracking-tight">Identity Setup</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="nickname" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Your Alias</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} aria-hidden="true" />
                    <input
                      id="nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Enter nickname..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-5 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-100 text-sm md:text-base shadow-inner"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="age" className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Age Verification</label>
                      <input
                        id="age"
                        type="number"
                        required
                        min="18"
                        value={age}
                        onChange={(e) => {
                          setAge(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="Age (18+)"
                        className={`w-full bg-black/40 border ${error ? 'border-red-500/50 ring-4 ring-red-500/5' : 'border-white/10'} rounded-xl py-3.5 px-5 focus:outline-none focus:border-blue-500/50 transition-all font-black text-center text-sm md:text-base shadow-inner`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Gender Identity</label>
                      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select Gender">
                        {GENDER_OPTIONS.map((g) => {
                          const Icon = g.icon;
                          const isActive = gender === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => setGender(g.id)}
                              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                                isActive
                                  ? `${g.activeBg} ${g.activeBorder} ring-1 ring-blue-500/20`
                                  : 'bg-black/20 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <Icon size={20} className={isActive ? g.color : 'text-slate-500'} />
                              <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-500'}`}>
                                {g.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 text-red-400 text-xs font-black uppercase tracking-widest animate-reveal mt-2 bg-red-400/10 py-3 px-4 rounded-lg border border-red-400/20" role="alert">
                      <AlertCircle size={14} />
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'video')}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl font-black tracking-[0.2em] text-white shadow-xl shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-center gap-2 relative z-10 text-xs md:text-sm">
                  <Video size={18} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
                  <span>LAUNCH VIDEO CHAT</span>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} aria-hidden="true" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'text')}
                className="group bg-slate-800/40 border border-white/10 p-4 rounded-xl font-black tracking-[0.2em] text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all hover:scale-[1.01] active:scale-[0.99] text-xs md:text-sm backdrop-blur-sm"
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare size={18} aria-hidden="true" />
                  <span>TEXT-ONLY MODE</span>
                </div>
              </button>
            </div>
          </form>

          <aside className="relative group animate-reveal hidden lg:block" style={{ animationDelay: '0.2s' }} aria-label="Feature Preview">
            <div className="h-full bg-gradient-to-br from-slate-900 to-black border border-white/10 rounded-[2rem] overflow-hidden relative shadow-2xl hover-3d-card preserve-3d">
              {initialMode === 'video' ? (
                <div className="h-full w-full relative">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl rounded-lg border border-white/10 shadow-2xl">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">System: Camera Active</span>
                  </div>
                </div>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center p-10 space-y-6 text-center relative">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Zap size={60} aria-hidden="true" />
                  </div>
                  <div className="w-20 h-20 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center animate-bounce-slow border border-white/5 relative z-10 shadow-2xl">
                    <Ghost size={40} className="text-blue-400/40" />
                  </div>
                  <div className="space-y-3 relative z-10">
                    <h3 className="text-xl font-black text-white tracking-tight">Incognito Mode</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto font-medium">
                      Ephemeral sessions. No logs, no tracking, just interactions.
                    </p>
                  </div>
                  <div className="flex gap-4 opacity-30 relative z-10">
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10"><Globe size={20} /></div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10"><Shield size={20} /></div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10"><Zap size={20} /></div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 opacity-50 animate-reveal" style={{ animationDelay: '0.3s' }} aria-label="Trust Badges">
          {[
            { icon: ShieldCheck, text: "Encrypted", color: "text-blue-400" },
            { icon: Zap, text: "Low Latency", color: "text-yellow-400" },
            { icon: Globe, text: "Global", color: "text-emerald-400" },
            { icon: Shield, text: "Anonymity", color: "text-purple-400" }
          ].map((badge, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 text-center group">
              <badge.icon className={`${badge.color} group-hover:scale-110 transition-transform`} size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{badge.text}</span>
            </div>
          ))}
        </section>
      </div>

      <footer className="max-w-4xl w-full mt-10 pb-8 border-t border-white/5 pt-6 relative z-10 opacity-40 text-center px-6">
        <h2 className="text-sm font-black tracking-[0.3em] uppercase text-white mb-3">MaskMeet Protocol v5.0</h2>
        <p className="text-xs leading-relaxed max-w-xl mx-auto font-medium text-slate-400">
          MaskMeet uses proprietary P2P technology. All communications are end-to-end encrypted.
        </p>
        <div className="mt-4 flex justify-center gap-5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Safety</a>
        </div>
      </footer>
    </main>
  );
};

export default JoinForm;
