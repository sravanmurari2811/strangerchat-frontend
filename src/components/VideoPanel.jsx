import React, { useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Wifi, Zap, VideoOff } from 'lucide-react';

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
        <div className="relative h-full w-full bg-[#020617] flex items-center justify-center overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                 style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Main Viewport */}
            <div className="relative w-full h-full flex items-center justify-center bg-black/20">
                {status === 'connected' && remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover transition-opacity duration-1000"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-10 animate-portal">
                        <div className="relative">
                            <div className="w-36 h-36 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 backdrop-blur-3xl glow-primary">
                                <User size={64} className="text-blue-500/20" />
                            </div>
                            {status === 'searching' && (
                                <div className="absolute inset-[-12px] border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_12s_linear_infinite]" />
                            )}
                        </div>
                        <div className="text-center space-y-3">
                            <h3 className="text-4xl font-black text-white tracking-tighter">
                                {status === 'searching' ? 'Finding a Match' : 'Ready to Connect'}
                            </h3>
                            <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed uppercase tracking-[0.2em] opacity-60">
                                {status === 'searching'
                                    ? "Scanning worldwide for strangers..."
                                    : "Join the queue to meet new people"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Cinematic Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-black/20 pointer-events-none" />

                {/* Header Information */}
                {peer && status === 'connected' && (
                    <div className="absolute top-10 left-10 flex items-center gap-5 animate-portal">
                        <div className="glass pl-3 pr-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Zap size={22} className="text-white fill-white/20" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none mb-1.5">Connected</p>
                                <h4 className="text-base font-black text-white tracking-tight">{peer.nickname}</h4>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-3 glass px-5 py-3 rounded-2xl">
                           <Wifi size={14} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live Stream</span>
                        </div>
                    </div>
                )}
            </div>

            {/* PIP (Picture in Picture) Local Preview */}
            <div className="absolute bottom-10 right-10 w-44 h-64 md:w-56 md:h-80 glass rounded-[2.5rem] overflow-hidden p-1 shadow-2xl z-20 group transition-all duration-700 hover:scale-105 hover:border-blue-500/40">
                <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover mirror grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">You</span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-0 right-0 w-40 h-40 border-t border-r border-white/5 m-10 rounded-tr-[3rem] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 border-b border-l border-white/5 m-10 rounded-bl-[3rem] pointer-events-none" />
        </div>
    );
};

export default VideoPanel;
