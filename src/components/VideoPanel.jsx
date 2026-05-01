import React, { useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Wifi, Zap, Video } from 'lucide-react';

const VideoPanel = () => {
    const { localStream, remoteStream, status, peer } = useChatStore();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="relative h-full w-full bg-[#010409] flex items-center justify-center overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Remote Viewport */}
            <div className="relative w-full h-full flex items-center justify-center bg-black">
                {status === 'connected' && remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain md:object-cover transition-opacity duration-1000"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-reveal px-6 text-center">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-36 md:h-36 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 backdrop-blur-3xl glow-blue">
                                <Video size={48} className="text-blue-500/20" />
                            </div>
                            {status === 'searching' && (
                                <div className="absolute inset-[-12px] border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                            )}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase brand-glow">
                                {status === 'searching' ? 'Matching...' : 'Waiting'}
                            </h3>
                            <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-40">
                                {status === 'searching' ? 'Scanning Global Network' : 'Ready to Connect'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {peer && status === 'connected' && (
                    <div className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-4 animate-reveal">
                        <div className="luxury-glass pl-3 pr-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/5">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap size={20} className="text-white fill-white/20" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none mb-1">Stranger</p>
                                <h4 className="text-base font-black text-white tracking-tight leading-none">{peer.nickname}</h4>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-3 luxury-glass px-5 py-3 rounded-2xl border border-white/5">
                           <Wifi size={14} className="text-emerald-500 animate-pulse" />
                           <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">P2P Link Active</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Local Preview (PIP) - Scaled for high-end look */}
            <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 w-28 h-40 md:w-56 md:h-80 luxury-glass rounded-[2rem] md:rounded-[2.8rem] overflow-hidden p-1 shadow-2xl z-20 group transition-all duration-700 hover:scale-105 border border-white/10">
                <div className="relative w-full h-full rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden bg-slate-900">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover mirror grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">You</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Aesthetic Frame Markers */}
            <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-white/5 m-10 rounded-tr-[3rem] pointer-events-none hidden md:block" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-white/5 m-10 rounded-bl-[3rem] pointer-events-none hidden md:block" />
        </div>
    );
};

export default VideoPanel;
