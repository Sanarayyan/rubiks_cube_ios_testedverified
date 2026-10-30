import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cube3D from '../components/Cube3D';
import GuidanceModal from '../components/GuidanceModal';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, Zap, Clock, Box, Trophy, X } from 'lucide-react';
import Confetti from 'react-confetti';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { playMoveSound, playCelebrationSound } from '../utils/audio';
import '../solution.css';

const notifyFlutter = (payload) => {
  if (window.FlutterBridge?.postMessage) {
    window.FlutterBridge.postMessage(JSON.stringify(payload));
  }
};

const Solution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800); // Animation duration in ms
  const [isAnimating, setIsAnimating] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const solution = location.state?.solution;
  const initialCubeState = location.state?.cubeState;
  const [displayCubeState, setDisplayCubeState] = useState(initialCubeState);

  const timelineRef = useRef(null);

  useEffect(() => {
    if (!solution) {
      navigate('/');
      return;
    }

    // Show tour if first time seeing solution
    const hasSeenSolutionTour = localStorage.getItem('hasSeenSolutionTour');
    if (!hasSeenSolutionTour) {
      setIsTourOpen(true);
      localStorage.setItem('hasSeenSolutionTour', 'true');
    }
    // Track window resize for confetti
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [solution, navigate]);



  // Use a ref for isPlaying to access the latest value inside callbacks/timeouts without dependency issues
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const currentMoveIndexRef = useRef(currentMoveIndex);
  useEffect(() => { currentMoveIndexRef.current = currentMoveIndex; }, [currentMoveIndex]);

  const isSolvedRef = useRef(isSolved);
  useEffect(() => { isSolvedRef.current = isSolved; }, [isSolved]);

  const handleMoveDone = useCallback((nextFacelets) => {
    if (nextFacelets) {
      setDisplayCubeState(nextFacelets);
    }

    // Check if solution is complete
    if (currentMoveIndexRef.current === solution?.moves.length - 1 && !isSolvedRef.current) {
      setIsSolved(true);
      notifyFlutter({
        type: 'cube_solved',
        source: 'solution_screen',
        timestamp: Date.now(),
      });
      playCelebrationSound();
      try {
        Haptics.notification({ type: NotificationType.Success });
      } catch (e) { console.log('Haptics not available'); }
    }

    // Small stabilization window to let React and Three.js sync their states
    setTimeout(() => {
      setIsAnimating(false);
      setPendingMove(null);
    }, 30);
  }, [solution]);

  const getInverseMove = (move) => {
    if (move.includes("'")) return move.replace("'", "");
    if (move.includes("2")) return move;
    return move + "'";
  };

  const handleStepForward = useCallback(() => {
    if (isAnimating || !solution?.moves) return;

    if (currentMoveIndex < solution.moves.length - 1) {
      const nextIdx = currentMoveIndex + 1;
      const move = solution.moves[nextIdx];

      setIsAnimating(true);
      setPendingMove(move.notation);
      setCurrentMoveIndex(nextIdx);
    } else {
      setIsPlaying(false);
    }
  }, [currentMoveIndex, isAnimating, solution]);

  const handleStepBackward = useCallback(() => {
    if (isAnimating || !solution?.moves || currentMoveIndex < 0) return;

    const move = solution.moves[currentMoveIndex];
    const inverse = getInverseMove(move.notation);

    setIsAnimating(true);
    setPendingMove(inverse);
    setCurrentMoveIndex(prev => prev - 1);
    setIsPlaying(false); // Stop auto-play when manually stepping back
  }, [currentMoveIndex, isAnimating, solution]);

  // Play sound when a move starts
  useEffect(() => {
    if (pendingMove) {
      playMoveSound();
    }
  }, [pendingMove]);

  // Main Playback Loop
  useEffect(() => {
    let timer;
    if (isPlaying && !isAnimating) {
      // Pause duration scales with speed for a more natural feel
      const pauseDuration = Math.max(50, speed * 0.1);

      timer = setTimeout(() => {
        if (isPlayingRef.current) {
          handleStepForward();
        }
      }, pauseDuration);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, isAnimating, handleStepForward, speed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetToStart = () => {
    if (isAnimating) return;
    setCurrentMoveIndex(-1);
    setDisplayCubeState(initialCubeState);
    setIsPlaying(false);
    setIsSolved(false); // Reset solved state
  };

  const resetCube = () => {
    resetToStart();
  };

  if (!solution) return null;

  return (
    <div className="h-screen w-full bg-[#0D061A] text-white font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      {isSolved && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.15}
          />
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto p-4">
            <div className="bg-black/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-yellow-500/30 shadow-[0_0_80px_rgba(234,179,8,0.4)] flex flex-col items-center animate-in fade-in zoom-in duration-500 scale-100 ring-2 ring-white/5 w-full max-w-sm relative">
              <button
                onClick={() => setIsSolved(false)}
                aria-label="Close solved message"
                className="absolute top-3 right-3 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
              >
                <X size={18} className="text-white/70" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent rounded-[2rem] pointer-events-none"></div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-2xl animate-bounce border-[3px] border-yellow-300 relative z-10">
                <Trophy size={32} className="text-white drop-shadow-md sm:w-10 sm:h-10" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-200 uppercase tracking-widest mb-2 text-center drop-shadow-sm relative z-10">
                Solved!
              </h2>

              <p className="text-slate-300 font-medium text-sm text-center leading-relaxed relative z-10 max-w-[80%]">
                You've successfully solved the cube!
              </p>

              <div className="mt-6 flex gap-4 relative z-10 pointer-events-auto w-full">
                <button onClick={() => navigate('/manual')} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 rounded-xl text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-yellow-500/20 active:scale-95">
                  Try Another Solve
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="relative z-10 max-w-lg mx-auto flex flex-col flex-1 w-full p-6 pt-10 pb-12 overflow-y-auto custom-scrollbar">

        {/* Header with volume & reset */}
        <div className="w-full h-10 flex items-center justify-end gap-3 mb-6">

          <button
            onClick={resetCube}
            aria-label="Replay solution"
            className="w-10 h-10 bg-blue-500/20 backdrop-blur-md rounded-xl flex items-center justify-center text-blue-400 border border-white/5 active:scale-90 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* 3D Cube Player Viewport */}
        <div className="w-full aspect-[4/3] bg-gradient-to-b from-blue-900/20 to-transparent rounded-[2.5rem] p-4 flex items-center justify-center relative mb-8 border border-white/5 group shadow-2xl">
          <div className="w-full h-full">
            <Cube3D
              cubeState={displayCubeState}
              animateMove={pendingMove}
              onMoveDone={handleMoveDone}
              durationMs={speed}
            />
          </div>

          {/* Current Move Notation Display */}
          {pendingMove && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm px-5 py-2 rounded-xl border border-white/20">
                <span className="text-white font-mono text-2xl font-bold tracking-wider">
                  {pendingMove}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Playback Progress Slider (Speed) */}
        <div className="w-full px-4 mb-8">
          <div className="flex justify-between text-[10px] font-black text-slate-500 tracking-widest uppercase mb-3">
            <span>Fast</span>
            <span>Speed: {speed}ms</span>
            <span>Slow</span>
          </div>
          <div className="relative group">
            <input
              aria-label="Animation speed"
              type="range"
              min="200"
              max="1500"
              step="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-6 mb-12">
          <button
            onClick={handleStepBackward}
            aria-label="Previous move"
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all font-bold"
          >
            <SkipBack size={24} fill="white" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause solution' : 'Play solution'}
            className="w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-[0_15px_35px_rgba(99,102,241,0.4)] active:scale-95 transition-all p-5"
          >
            {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
          </button>
          <button
            onClick={handleStepForward}
            aria-label="Next move"
            className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all font-bold"
          >
            <SkipForward size={24} fill="white" />
          </button>
        </div>

        {/* Time Lines Section */}
        <div className="w-full flex flex-col mb-8 h-auto">
          <h3 className="text-sm font-black text-slate-300 tracking-widest uppercase mb-6 flex items-center gap-3 px-2">
            Time Lines <div className="h-px flex-1 bg-white/5"></div>
          </h3>
          <div
            ref={timelineRef}
            className="pr-2 space-y-4"
          >
            {solution.moves.map((move, i) => (
              <div
                key={i}
                className={`relative group transition-all duration-500 ${i === currentMoveIndex ? 'scale-[1.02] z-20' : 'opacity-60'}`}
              >
                <div className={`p-5 rounded-[1.5rem] border flex items-center justify-between transition-all duration-500 bg-[#1F1235]/40 ${i === currentMoveIndex
                  ? 'border-blue-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.15)] bg-blue-500/10'
                  : 'border-white/5'}`}
                >
                  <div className="flex-1 px-4">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-base font-black text-blue-400 w-6">{i + 1}.</span>
                      <span className="text-2xl font-black text-white">{move.notation}</span>
                      {move.hand && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-tighter rounded">
                          {move.hand}
                        </span>
                      )}
                    </div>

                    {move.grip && (
                      <p className="text-[10px] text-slate-300 leading-tight mb-1 font-medium">
                        {move.grip}
                      </p>
                    )}

                    {move.tip && (
                      <p className="text-[9px] text-amber-400/80 italic leading-tight">
                        Tip: {move.tip}
                      </p>
                    )}

                    {!move.grip && (
                      <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                        ROTATE {move.notation[0]} FACE {move.notation.includes("'") ? 'COUNTER-CLOCKWISE' : 'CLOCKWISE'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="w-full bg-[#1F1235]/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 mb-8 mt-auto grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Total Moves</span>
            <span className="text-lg font-black text-white">{solution.moves.length}</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Estimate Time</span>
            <span className="text-lg font-black text-white">{solution.estimatedTime || (solution.moves.length * 2)} sec</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-center">Method</span>
            <span className="text-lg font-black text-white truncate w-full text-center">{solution.solvingMethod || 'Two Phase'}</span>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/manual')}
          className="w-full h-16 bg-gradient-to-r from-rose-500 via-indigo-600 to-blue-700 rounded-[2rem] flex items-center justify-center p-0.5 group active:scale-[0.98] transition-all shadow-xl shadow-indigo-900/20"
        >
          <div className="w-full h-full bg-[#0D061A]/10 rounded-[2rem] flex items-center justify-center gap-3 text-white">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-[0.2em]">Back to Game</span>
          </div>
        </button>

      </div>

      {/* Guidance Tour */}
      <GuidanceModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        steps={[
          {
            title: "Your Solution is Ready!",
            description: "We've calculated the best way to solve your cube. Follow these steps carefully.",
            icon: <Zap className="w-10 h-10 text-white" />
          },
          {
            title: "The 3D Guide",
            description: "The cube at the top will animate each move. You can drag to rotate and see it from any angle!",
            icon: <Box className="w-10 h-10 text-white" />
          },
          {
            title: "Control the Flow",
            description: "Use Play to watch it happen, or Step through one by one. Adjust the speed if it's going too fast!",
            icon: <Pause className="w-10 h-10 text-white" />
          },
          {
            title: "Step-by-Step",
            description: `Below the cube, you'll see a list of moves. 'R' means Right face clockwise, "R'" means counter-clockwise. Don't worry, we explain each one!`,
            icon: <Clock className="w-10 h-10 text-white" />
          }
        ]}
      />
    </div>
  );
};

export default Solution;
