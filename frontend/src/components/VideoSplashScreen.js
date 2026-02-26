import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoSplashScreen = () => {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        // Attempt to play with sound if possible
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.log("Autoplay with sound was blocked:", error);
            });
        }

        // Reduced transition time for an "instant" feel
        const navTimer = setTimeout(() => {
            setFadeOut(true);
            // Navigate almost instantly after fade starts
            setTimeout(() => navigate('/manual'), 150);
        }, 6500);

        return () => clearTimeout(navTimer);
    }, [navigate]);

    const handleVideoEnd = () => {
        setFadeOut(true);
        setTimeout(() => navigate('/manual'), 150);
    };

    const unmuteAndPlay = () => {
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-[#020208] flex items-center justify-center transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                webkit-playsinline="true"
                controls={false}
                disablePictureInPicture
                onEnded={handleVideoEnd}
                className="w-full h-full object-cover md:object-contain pointer-events-none"
                style={{ filter: 'contrast(1.1) brightness(0.9)' }}
            >
                <source src={process.env.PUBLIC_URL + '/splash_video.mp4'} type="video/mp4" />
                <div className="text-white text-center">
                    <h1 className="text-4xl font-black tracking-widest animate-pulse">RUBIK'S SOLVER</h1>
                </div>
            </video>

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40 pointer-events-none" />

            {/* Skip Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setFadeOut(true);
                    setTimeout(() => navigate('/manual'), 150);
                }}
                className="absolute top-12 right-6 z-50 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all active:scale-95 hover:border-white/20"
            >
                Skip
            </button>

            {/* Faster Loading Bar */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-white/5 overflow-hidden rounded-full">
                <div className="h-full bg-blue-500 animate-loading-bar shadow-[0_0_10px_#3b82f6]" />
            </div>

            <style jsx>{`
                @keyframes loading-bar {
                    0% { width: 0; transform: translateX(-100%); }
                    100% { width: 100%; transform: translateX(0); }
                }
                .animate-loading-bar {
                    animation: loading-bar 6.5s linear forwards;
                }
            `}</style>
        </div>
    );
};

export default VideoSplashScreen;
