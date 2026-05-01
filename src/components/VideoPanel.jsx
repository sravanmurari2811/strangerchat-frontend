import React, { useEffect, useRef } from 'react';
import useChatStore from '../store/useChatStore';
import { User, Zap } from 'lucide-react';

const VideoPanel = () => {
    const { localStream, remoteStream, status, peer } = useChatStore();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
    }, [remoteStream]);

    return (
        <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden">
            {/* Remote Video - Uses 'contain' to ensure faces aren't cropped on laptops */}
            <div className="w-full h-full flex items-center justify-center">
                {status === 'connected' && remoteStream ? (
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-reveal px-6 text-center">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-36 md:h-36 bg-blue-500/5 rounded-full flex items-center justify-center border border-blue-500/10 backdrop-blur-3xl">
                                <User size={48} className="text-blue-500/20" />
                            </div>
                            {status === 'searching' && (
                                <div className="absolute inset-[-10px] border-2 border-dashed border-blue-500/20 rounded-full animate-spin" />
                            )}
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase">
                                {status === 'searching' ? 'Finding Match' : 'Ready'}
                            </h3>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold opacity-40">Scanning Worldwide...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays */}
            {peer && status === 'connected' && (
                <div className="absolute top-4 left-4 md:top-8 md:left-8 animate-reveal">
                    <div className="glass-panel pl-2 pr-5 py-2 rounded-2xl flex items-center gap-3 shadow-2xl">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Zap size={18} /></div>
                        <div>
                            <p className="text-[8px] font-black text-blue-400 uppercase leading-none mb-1">Stranger</p>
                            <h4 className="text-xs md:text-sm font-black text-white leading-none">{peer.nickname}</h4>
                        </div>
                    </div>
                </div>
            )}

            {/* Local Preview (PIP) - Scaled specifically for mobile fitting */}
            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-24 h-36 md:w-44 md:h-64 glass-panel rounded-[1.2rem] md:rounded-[2rem] overflow-hidden p-0.5 shadow-2xl z-20 transition-all border border-white/10 hover:scale-105">
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror bg-slate-900" />
                <div className="absolute bottom-2 left-3"><span className="text-[8px] font-black uppercase text-white/40">You</span></div>
            </div>
        </div>
    );
};

export default VideoPanel;
