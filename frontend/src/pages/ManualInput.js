import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, RotateCcw, Play, LayoutGrid, MousePointer2, Info, Zap, Orbit, Sparkles } from 'lucide-react';
import { cubeAPI, generateSolvedCube, getFriendlySolveError, validateCubeStateDetailed } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import CubeNet2D from '../components/CubeNet2D';
import Cube3D from '../components/Cube3D';
import GuidanceModal from '../components/GuidanceModal';

const ManualInput = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError, showInfo } = useToast();

    const [cubeState, setCubeState] = useState(location.state?.cubeState || generateSolvedCube());
    const [inputMode, setInputMode] = useState('3d');
    const [mode] = useState('beginner');
    const [solution, setSolution] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [validation, setValidation] = useState(null);
    const [highlightErrors, setHighlightErrors] = useState(false);
    const [showGuide, setShowGuide] = useState(false); // Default false, toggled by useEffect
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const isSolved = JSON.stringify(cubeState) === JSON.stringify(generateSolvedCube());

    useEffect(() => {
        const checkBackend = async () => {
            try {
                await cubeAPI.healthCheck();
                setBackendStatus('online');
            } catch (err) {
                console.error("Backend unreachable on mount:", err);
                setBackendStatus('offline');
            }
        };
        checkBackend();

        // Check if tour should be shown
        const hasSeenTour = localStorage.getItem('hasSeenManualTour');
        if (!hasSeenTour) {
            setIsTourOpen(true);
            localStorage.setItem('hasSeenManualTour', 'true');
        } else {
            // Only show guide if user hasn't interacted in this session
            const hasInteractedThisSession = sessionStorage.getItem('hasInteractedWithCube');
            if (!hasInteractedThisSession) {
                setShowGuide(true);
            }
        }
    }, []);

    const colors = ['W', 'O', 'B', 'Y', 'R', 'G'];
    const faces = [
        { key: 'U', name: 'Up Face', color: 'bg-white' },
        { key: 'R', name: 'Right Face', color: 'bg-orange-500' },
        { key: 'F', name: 'Front Face', color: 'bg-blue-600' },
        { key: 'D', name: 'Down Face', color: 'bg-yellow-400' },
        { key: 'L', name: 'Left Face', color: 'bg-red-600' },
        { key: 'B', name: 'Back Face', color: 'bg-green-600' }
    ];

    const handleStickerClick = (faceIndex, squareIndex) => {
        const globalIndex = faceIndex * 9 + squareIndex;
        const currentColor = cubeState[globalIndex];
        const currentIndex = colors.indexOf(currentColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        handleColorChange(faceIndex, squareIndex, colors[nextIndex]);
    };

    const handleColorChange = (faceIndex, squareIndex, newColor) => {
        const newCubeState = [...cubeState];
        const globalIndex = faceIndex * 9 + squareIndex;
        newCubeState[globalIndex] = newColor;
        setCubeState(newCubeState);

        // Hide guide and mark that user has interacted in this session
        if (showGuide) {
            setShowGuide(false);
            sessionStorage.setItem('hasInteractedWithCube', 'true');
        }

        setValidation(null);
        setHighlightErrors(false);
    };

    const resetCube = () => {
        setCubeState(generateSolvedCube());
        // Clear session flag to show guide again for new solve
        sessionStorage.removeItem('hasInteractedWithCube');
        setShowGuide(true);
        showInfo('Cube reset to solved state.');
    };

    const solveCube = async () => {
        setIsLoading(true);
        const validationResult = validateCubeStateDetailed(cubeState);
        setValidation(validationResult);

        if (!validationResult.isValid) {
            navigate('/notfound', { state: { cubeState, validation: validationResult } });
            setIsLoading(false);
            return;
        }

        if (isSolved) {
            showInfo('Your cube is already solved! Try scrambling it first.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await cubeAPI.solveCube(cubeState, mode);
            if (result.success) {
                setSolution(result.solution);
                showSuccess('Cube solved successfully!');
                navigate(`/solution/${Date.now()}`, {
                    state: { solution: result.solution, cubeState },
                });
            } else {
                const errorMsg = getFriendlySolveError(result.error);

                showError(errorMsg);
                const errorValidation = {
                    isValid: false,
                    errors: [errorMsg],
                    technicalDetails: result.error
                };
                navigate('/notfound', { state: { cubeState, validation: errorValidation } });
            }
        } catch (error) {
            console.error('Solve cube error:', error);
            const errorMsg = getFriendlySolveError(error.message);
            showError(errorMsg);
            navigate('/notfound', {
                state: {
                    cubeState,
                    validation: {
                        isValid: false,
                        errors: [errorMsg],
                        technicalDetails: error.message
                    }
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const viewSolution = () => {
        if (solution) {
            navigate(`/solution/${Date.now()}`, {
                state: { solution, cubeState },
            });
        }
    };

    const getColorClasses = (color, faceIdx, sqIdx) => {
        const isError = highlightErrors && validation?.errors?.some(e => e.includes(`Face ${faceIdx + 1}`));
        const base = "transition-all duration-200 shadow-sm hover:scale-105 hover:brightness-110 active:scale-95 ";
        const errStyle = isError ? "ring-2 ring-red-500 ring-offset-1 " : "";

        switch (color) {
            case 'W': return base + errStyle + "bg-white";
            case 'Y': return base + errStyle + "bg-yellow-400";
            case 'R': return base + errStyle + "bg-red-600";
            case 'O': return base + errStyle + "bg-orange-500";
            case 'B': return base + errStyle + "bg-blue-600";
            case 'G': return base + errStyle + "bg-green-600";
            default: return base + errStyle + "bg-slate-700";
        }
    };

    return (
        <div className="h-screen w-full bg-[#03000A] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden">
            {/* Premium Neon Geometric Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    {/* Abstract Neon Lines */}
                    <path d="M-10,20 L30,50 L-10,80" fill="none" stroke="url(#neonGrad)" strokeWidth="0.2" className="animate-pulse" />
                    <path d="M110,10 L70,40 L110,70" fill="none" stroke="url(#neonGrad)" strokeWidth="0.2" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#neonGrad)" strokeWidth="0.05" strokeDasharray="1 2" />
                    {/* Hexagonal Grid Overlay */}
                    <pattern id="hexagons" width="10" height="17.32" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
                        <path d="M5 0 L10 2.88 L10 8.66 L5 11.54 L0 8.66 L0 2.88 Z" fill="none" stroke="white" strokeWidth="0.05" opacity="0.1" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                </svg>
                {/* Master Glows */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/10 blur-[150px] rounded-full" />
            </div>

            {/* HUD-Style Augmented Header */}
            <div className="w-full px-8 pt-10 pb-4 z-20 flex-none relative">
                {/* Discrete HUD Corner Elements - Rubik's Inspired Multi-color borders */}
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 opacity-40 rounded-tl-xl pointer-events-none" style={{ borderImageSource: 'linear-gradient(to bottom right, #3B82F6, #22C55E, #FFFFFF)', borderImageSlice: 1 }} />
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 opacity-40 rounded-tr-xl pointer-events-none" style={{ borderImageSource: 'linear-gradient(to bottom left, #F97316, #EF4444, #EAB308)', borderImageSlice: 1 }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <div className="flex flex-col items-center gap-1">
                    {/* Floating Assistant Indicator */}
                    <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="grid grid-cols-3 gap-0.5 items-center">
                                <div className={`w-1 h-1 rounded-sm bg-white ${backendStatus === 'online' ? 'animate-pulse' : 'opacity-20'}`} />
                                <div className={`w-1 h-1 rounded-sm bg-yellow-400 ${backendStatus === 'online' ? 'animate-pulse delay-75' : 'opacity-20'}`} />
                                <div className={`w-1 h-1 rounded-sm bg-blue-500 ${backendStatus === 'online' ? 'animate-pulse delay-150' : 'opacity-20'}`} />
                                <div className={`w-1 h-1 rounded-sm bg-red-500 ${backendStatus === 'online' ? 'animate-pulse delay-[200ms]' : 'opacity-20'}`} />
                                <div className={`w-1 h-1 rounded-sm bg-green-500 ${backendStatus === 'online' ? 'animate-pulse delay-[300ms]' : 'opacity-20'}`} />
                                <div className={`w-1 h-1 rounded-sm bg-orange-500 ${backendStatus === 'online' ? 'animate-pulse delay-[400ms]' : 'opacity-20'}`} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Cube Setup
                            </span>
                        </div>
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <div className="flex items-center gap-2">
                            <Orbit size={10} className="text-slate-400/40 animate-spin-slow" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Solve Guide
                            </span>
                        </div>
                    </div>

                    {/* Main Assistant Guidance */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-3 flex items-center justify-center">
                            <div className={`absolute -inset-10 rounded-full blur-[40px] opacity-10 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-orange-500 animate-pulse`} />
                            {isSolved ? (
                                <Sparkles className="w-10 h-10 text-white/90 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                            ) : (
                                <Orbit className="w-10 h-10 text-white/40 relative z-10 animate-spin-slow" />
                            )}
                        </div>

                        <h1 className="text-xl font-black tracking-tight text-center uppercase text-white">
                            {isSolved ? "Ready to solve?" : "Matching Colors"}
                        </h1>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 text-center max-w-[280px] leading-relaxed">
                            {isSolved
                                ? "Set your cube colours first. Press Solve when ready."
                                : "We’re matching this cube to the one in your hands."}
                        </p>
                    </div>

                    {/* Diagnostic Line (Multi-color spectrum scan) */}
                    <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-60 translate-x-[-100%] animate-scan" />
                    </div>
                </div>
            </div>

            {/* Cube Display Area */}
            {/* Cube Display Area - Fixed for phone screens with standard scroll */}
            <div className="flex-1 w-full flex flex-col items-center relative z-10 px-6 overflow-y-auto overflow-x-hidden scrollbar-hide pt-2 pb-20 touch-pan-y">
                {/* Subtle top/bottom fade for premium scroll feel */}
                <div className="sticky top-0 left-0 w-full h-8 bg-gradient-to-b from-[#03000A] to-transparent z-30 pointer-events-none opacity-60" />

                {inputMode === '3d' && (
                    <div className="w-full h-full max-w-[500px] flex items-center justify-center relative">
                        <Cube3D
                            cubeState={cubeState}
                            onStickerClick={handleStickerClick}
                            lockCenters={false}
                        />
                        {showGuide && (
                            <>
                                {/* Floating Pointer - More focused on a sticker */}
                                <div className="absolute top-[40%] left-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 flex flex-col items-center justify-center">
                                    <div className="relative">
                                        <MousePointer2 className="w-10 h-10 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] fill-white/20 animate-pointer-bounce rotate-[-12deg]" strokeWidth={2} />
                                        <div className="absolute top-0 left-0 w-10 h-10 border-2 border-white/50 rounded-full animate-ping opacity-40" />
                                    </div>
                                </div>

                                {/* Compact Guide Message */}
                                <div className="absolute top-[70%] left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center w-full px-10">
                                    <div className="bg-[#1F1235]/90 backdrop-blur-2xl px-6 py-4 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-500">
                                        <span className="text-xs font-black text-white uppercase tracking-[0.1em] leading-normal text-center">
                                            Tap to choose a color
                                        </span>
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest text-center opacity-90">
                                            Match your real cube colors
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {inputMode === 'grid' && (
                    <div className="w-full max-w-sm grid grid-cols-2 gap-3 p-4 py-10">
                        {faces.map((face, faceIndex) => (
                            <div key={face.key} className="bg-[#1F1235]/40 backdrop-blur-lg rounded-3xl p-3 border border-white/5 shadow-xl">
                                <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-tight">{face.name}</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {Array.from({ length: 9 }, (_, sqIdx) => {
                                        const color = cubeState[faceIndex * 9 + sqIdx];
                                        return (
                                            <button
                                                key={sqIdx}
                                                onClick={() => handleStickerClick(faceIndex, sqIdx)}
                                                className={`w-full aspect-square rounded-lg border border-black/10 ${getColorClasses(color, faceIndex, sqIdx)}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {inputMode === 'net' && (
                    <div className="scale-[1.15] sm:scale-120 transition-all duration-500 py-12 flex flex-col items-center">
                        <CubeNet2D cubeState={cubeState} onCellClick={handleStickerClick} lockCenters={false} />
                    </div>
                )}

                {/* Bottom fade indicator */}
                <div className="sticky bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#03000A] to-transparent z-30 pointer-events-none opacity-80" />
            </div>

            {/* Mobile Actions Section */}
            <div className="w-full px-6 pb-28 z-20 flex-none scale-100 mb-4">
                <p className="text-center text-xs font-black text-slate-500 uppercase tracking-widest mb-5 opacity-80">
                    {inputMode === '3d' ? 'Rotate the cube with your fingers.' : 'Manual Grid Input'}
                </p>
                <div className="flex items-center gap-3 w-full max-w-sm mx-auto">
                    <button
                        onClick={resetCube}
                        aria-label="Reset cube"
                        className="w-16 h-16 rounded-[2rem] bg-[#1F1235]/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                    >
                        <RotateCcw size={22} />
                    </button>

                    <button
                        onClick={solveCube}
                        disabled={isLoading}
                        className={`flex-1 h-14 rounded-3xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 border border-white/10 ${isLoading ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 text-white shadow-blue-500/20'}`}
                    >
                        {isLoading ? (
                            <>
                                <RotateCcw className="w-5 h-5 animate-spin" />
                                <span>Solving...</span>
                            </>
                        ) : (
                            <>
                                <Play size={16} fill="white" />
                                <span>Solve My Cube</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom Menu Icons - Enhanced Neon Style */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1F1235]/80 backdrop-blur-[25px] border border-white/10 rounded-[2.5rem] p-2.5 flex items-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.7)] z-[100] group">
                {/* Glow Border Effect */}
                <div className="absolute inset-0 rounded-[2.5rem] border border-blue-500/20 pointer-events-none group-hover:border-blue-500/40 transition-colors" />

                <button
                    onClick={() => setInputMode('3d')}
                    aria-label="3D cube input"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === '3d' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <Box size={20} strokeWidth={2.5} />
                    {inputMode === '3d' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <button
                    onClick={() => setInputMode('grid')}
                    aria-label="Grid input"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === 'grid' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <LayoutGrid size={20} strokeWidth={2.5} />
                    {inputMode === 'grid' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <button
                    onClick={() => setInputMode('net')}
                    aria-label="Cube net input"
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${inputMode === 'net' ? 'bg-white text-[#1F1235] shadow-[0_4px_20px_rgba(255,255,255,0.2)]' : 'text-slate-400'}`}
                >
                    <div className="flex flex-col items-center gap-[1px]">
                        <div className="w-1.5 h-1.5 rounded-[1px] bg-current" />
                        <div className="flex gap-[1px]">
                            {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-current" />)}
                        </div>
                    </div>
                    {inputMode === 'net' && <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />

                <button
                    onClick={() => setIsTourOpen(true)}
                    aria-label="Open guide"
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all text-slate-400 hover:text-white"
                >
                    <Info size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Guidance Tour */}
            <GuidanceModal
                isOpen={isTourOpen}
                onClose={() => {
                    setIsTourOpen(false);
                    setShowGuide(true);
                }}
                steps={[
                    {
                        title: "Meet Your Solver",
                        description: "Match the colors on this screen with your real Rubik's Cube. Just place your cube in front of you and match what you see!",
                        icon: <Box className="w-10 h-10 text-white" />
                    },
                    {
                        title: "Full Freedom",
                        description: "You have total control. Tap ANY square to change its color, including the centers. Match your cube exactly as it looks!",
                        icon: <Zap className="w-10 h-10 text-white" />
                    },
                    {
                        title: "Beginner Friendly",
                        description: "Don't worry about 'cube mechanics' or rotations. Just focus on matching the colors face by face.",
                        icon: <MousePointer2 className="w-10 h-10 text-white" />
                    },
                    {
                        title: "Solve It!",
                        description: "When your screen cube looks just like your real cube, hit 'Solve My Cube'. We'll show you exactly how to fix it!",
                        icon: <Zap className="w-10 h-10 text-white" />
                    }
                ]}
            />

            {/* Floating Solve Indicator */}
            {solution && (
                <button
                    onClick={viewSolution}
                    aria-label="View solution"
                    className="fixed top-36 right-4 w-12 h-12 bg-gradient-to-br from-blue-500 via-yellow-500 to-red-500 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce z-50 border-2 border-white/20"
                >
                    <Play size={20} fill="white" className="drop-shadow-lg" />
                </button>
            )}
        </div>
    );
};

export default ManualInput;
