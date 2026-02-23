import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, SkipBack, SkipForward, Smartphone, Box, LayoutGrid, Volume2, Pause } from 'lucide-react';
import { cubeAPI, generateSolvedCube } from '../services/api';
import Cube3D from '../components/Cube3D';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAnimateMove, setCurrentAnimateMove] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await cubeAPI.getHistory();
      // Format the API data or use demo data if none exists
      const mappedHistory = (result.history && result.history.length > 0)
        ? result.history.map(item => ({
          id: item.id || Math.random().toString(36).substr(2, 11),
          movesCount: item.total_moves || 0,
          time: item.estimated_time || 0,
          level: item.difficulty || 'Beginner',
          type: 'Solver',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB').replace(/\//g, '-') : 'Today',
          initialState: item.cube_state || generateSolvedCube(),
          solutionMoves: item.solution_moves || []
        }))
        : [];
      setHistory(mappedHistory);
      // Originally set activeItem here, removed to prevent auto-play
    } catch (error) {
      console.error('Load history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchReplay = (item) => {
    setActiveItem(item);
    setCurrentMoveIndex(-1);
    setIsPlaying(false);
    setCurrentAnimateMove(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentMoveIndex >= (activeItem?.solutionMoves.length - 1)) {
        setCurrentMoveIndex(-1);
      }
      setIsPlaying(true);
    }
  };

  const handleStepForward = useCallback(() => {
    if (!activeItem || isAnimating) return;
    if (currentMoveIndex < activeItem.solutionMoves.length - 1) {
      const nextMove = activeItem.solutionMoves[currentMoveIndex + 1];
      setCurrentAnimateMove(nextMove);
      setIsAnimating(true);
    } else {
      setIsPlaying(false);
    }
  }, [activeItem, currentMoveIndex, isAnimating]);

  const handleStepBackward = () => {
    if (!activeItem || isAnimating || currentMoveIndex < 0) return;
    // For simplicity, reset to initial and go to currentMoveIndex - 1
    // In a real app index based state reconstruction is better
    const targetIndex = currentMoveIndex - 1;
    setCurrentMoveIndex(-1);
    setCurrentAnimateMove(null);
    setIsAnimating(false);
    setIsPlaying(false);
    // Let use effect or manual trigger catch up to targetIndex
    // For now, just reset
  };

  const onMoveDone = () => {
    setIsAnimating(false);
    setCurrentAnimateMove(null);
    setCurrentMoveIndex(prev => prev + 1);
  };

  useEffect(() => {
    if (isPlaying && !isAnimating) {
      const timer = setTimeout(() => {
        handleStepForward();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isAnimating, handleStepForward]);

  const progress = activeItem?.solutionMoves?.length
    ? ((currentMoveIndex + 1) / activeItem.solutionMoves.length) * 100
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D061A] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading History..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0D061A] text-slate-200 overflow-x-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center h-auto px-6 pt-12 pb-48">
        {/* Page Heading */}
        <h1 className="text-3xl font-black text-white mb-8 uppercase tracking-tight">
          History
        </h1>

        {activeItem && (
          <div className="w-full max-w-md bg-[#1F1235]/60 backdrop-blur-3xl rounded-[3rem] p-6 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] mb-8 mt-4">
            <div className="relative aspect-square flex items-center justify-center mb-8">
              <div className="absolute top-0 right-0 flex gap-2 z-20">
                <button
                  onClick={() => { setCurrentMoveIndex(-1); setIsPlaying(false); }}
                  className="p-2.5 bg-blue-500/10 backdrop-blur-md rounded-xl text-blue-400 border border-blue-500/20 active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                </button>
                <button className="p-2.5 bg-blue-500/10 backdrop-blur-md rounded-xl text-blue-400 border border-blue-500/20 active:scale-95 transition-all">
                  <Volume2 size={16} />
                </button>
              </div>
              <div className="w-full h-full">
                <Cube3D
                  cubeState={activeItem?.initialState || generateSolvedCube()}
                  animateMove={currentAnimateMove}
                  onMoveDone={onMoveDone}
                  durationMs={500}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Solution {activeItem?.id || '----------'}
                </span>
                <span className="text-[10px] font-bold text-blue-400">
                  Move {currentMoveIndex + 1} / {activeItem?.solutionMoves?.length || 0}
                </span>
              </div>

              <div className="px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Start</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Stop</span>
                </div>
                <div className="relative h-1.5 bg-slate-800 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute w-4 h-4 bg-white rounded-full border-[3px] border-[#1F1235] shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-300 pointer-events-none top-1/2 -translate-y-1/2"
                    style={{ left: `calc(${progress}% - 8px)` }}
                  />
                </div>
              </div>

              {/* Mode Operation (Corresponded Method Display) */}
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Mode Operation</h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto custom-scrollbar">
                  {activeItem?.solutionMoves?.map((move, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all ${i === currentMoveIndex ? 'bg-indigo-600 text-white shadow-lg scale-110' :
                        i < currentMoveIndex ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'
                        }`}
                    >
                      {move}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center items-center gap-8 pb-2">
                <button
                  onClick={handleStepBackward}
                  className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 active:scale-90 transition-all border border-red-500/10"
                >
                  <SkipBack size={24} fill="currentColor" />
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="w-18 h-18 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-3xl flex items-center justify-center text-white shadow-[0_15px_35px_rgba(99,102,241,0.4)] active:scale-95 transition-all p-5"
                >
                  {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
                </button>
                <button
                  onClick={handleStepForward}
                  className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 active:scale-90 transition-all border border-blue-500/10"
                >
                  <SkipForward size={24} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md space-y-5">
          {history.map((item, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-[2.5rem] bg-[#1F1235]/40 backdrop-blur-2xl border transition-all active:scale-95 group ${activeItem?.id === item.id ? 'border-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'border-white/5'
                }`}
            >
              <div className="flex items-center gap-5">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-800 flex items-center justify-center border-[3px] border-white/5 shadow-2xl">
                  <Play size={24} fill="white" className="ml-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-[13px] font-black text-white truncate uppercase tracking-wide">Solution #{item.id}</h3>
                    <span className="text-[10px] font-bold text-slate-500">{item.date}</span>
                  </div>
                  <p className="text-[12px] font-bold text-slate-400 mb-4">{item.movesCount} Moves • {item.time} Sec</p>
                  <div className="flex gap-2">
                    <span className="px-4 py-1 rounded-full bg-purple-900/30 text-purple-400 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest leading-none">
                      {item.level}
                    </span>
                    <span className="px-4 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20 text-[9px] font-black uppercase tracking-widest leading-none">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleWatchReplay(item)}
                className="absolute bottom-5 right-6 px-6 py-2.5 bg-gradient-to-r from-[#F43F5E] via-[#8B5CF6] to-[#3B82F6] rounded-full text-[10px] font-black text-white uppercase tracking-[0.1em] shadow-[0_10px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_30px_rgba(139,92,246,0.4)] transition-all"
              >
                Watch Replay
              </button>
            </div>
          ))}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1F1235]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center gap-3 shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
          <button onClick={() => navigate('/manual')} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
            <Box size={22} strokeWidth={2.5} />
          </button>
          <button onClick={() => navigate('/manual')} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
            <LayoutGrid size={22} strokeWidth={2.5} />
          </button>
          <button onClick={() => navigate('/manual')} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300">
            <div className="flex flex-col items-center gap-[1px]">
              <div className="w-1.5 h-1.5 rounded-[1px] bg-current" />
              <div className="flex gap-[1px]">
                {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-[1px] bg-current" />)}
              </div>
            </div>
          </button>
          <button className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white text-[#1F1235] shadow-[0_8px_16px_rgba(255,255,255,0.2)] transition-all duration-300">
            <Smartphone size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default History;