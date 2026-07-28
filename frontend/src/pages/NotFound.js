import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cubeState, validation } = location.state || {};

  // If no state, we could redirect back or show empty, but we'll fallback to dummy for safety
  const counts = useMemo(() => {
    if (!cubeState) return {};
    const c = {};
    cubeState.forEach(color => {
      c[color] = (c[color] || 0) + 1;
    });
    return c;
  }, [cubeState]);

  const colorConfig = [
    { id: 'O', name: 'Orange', color: '#F97316' },
    { id: 'B', name: 'Blue', color: '#3B82F6' },
    { id: 'Y', name: 'Yellow', color: '#EAB308' },
    { id: 'W', name: 'White', color: '#FFFFFF' },
    { id: 'R', name: 'Red', color: '#EF4444' },
    { id: 'G', name: 'Green', color: '#22C55E' },
  ];

  const colorCounts = colorConfig.map(cfg => {
    const current = counts[cfg.id] || 0;
    const isError = current !== 9;
    return {
      ...cfg,
      status: isError ? `Incorrect (${current}/9)` : `Perfect (9/9)`,
      isError,
      isPerfect: !isError
    };
  });

  const problems = validation?.errors || [];
  const isValid = validation?.isValid || false;
  const hasColorCountError = colorCounts.some(item => item.isError);
  const hasSolverError = !isValid && !hasColorCountError && problems.length > 0;

  return (
    <div className="h-screen w-full bg-[#0D061A] text-white flex flex-col items-center justify-start font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 pt-10 pb-12 flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Header Card */}
        <div className="bg-[#1F1235]/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl mb-8 relative">
          <button
            onClick={() => navigate('/manual', { state: { cubeState } })}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
          >
            <X size={20} />
          </button>

          <h1 className="text-3xl font-black text-white mb-2">
            {isValid ? "Cube Is Ready!" : hasSolverError ? "Solver Issue" : "Check Your Cube"}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">
            {isValid
              ? "Everything looks perfect for solving"
              : hasSolverError
                ? "Your colours look valid, but the solver could not finish this request."
                : "Each colour should appear exactly 9 times."}
          </p>

          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Colour Counts</h2>

          {/* Color Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-10">
            {colorCounts.map((item, idx) => (
              <div key={idx} className={`p-3 sm:p-4 rounded-2xl border flex items-center gap-2 sm:gap-4 transition-transform active:scale-95 
                ${item.isError ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg relative overflow-hidden"
                  style={{ backgroundColor: item.color }}
                >
                  {item.isPerfect && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[10px] sm:text-xs font-black text-white leading-tight mb-0.5">{item.name}</h3>
                  <p className={`text-[9px] sm:text-[10px] font-bold ${item.isError ? 'text-red-400' : 'text-blue-400'} leading-tight`}>
                    {item.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons - Temporarily disabled */}
          {/* 
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/howtofix')}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-[#F43F5E] to-[#9333EA] flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <AlertCircle size={18} />
              <span className="text-[10px] font-black uppercase tracking-wider">How to Fix</span>
            </button>
            <button
              onClick={() => navigate('/help')}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-300 text-[#1F1235] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Info size={18} />
              <span className="text-[10px] font-black uppercase tracking-wider">Help Center</span>
            </button>
          </div>
          */}

          {/* Return to Setup Action */}
          <button
            onClick={() => navigate('/manual', { state: { cubeState } })}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all mt-4"
          >
            <AlertCircle size={24} />
            <span className="text-sm font-black uppercase tracking-[0.2em]">Return to Setup</span>
          </button>
        </div>

        {/* Problems List Card */}
        <div className={`backdrop-blur-2xl rounded-[2.5rem] p-8 border shadow-xl ${isValid ? 'bg-blue-500/5 border-white/10' : 'bg-[#1F1235]/40 border-white/5'}`}>
          <div className="space-y-6">
            {isValid ? (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
                  <CheckCircle2 size={24} className="text-white relative z-10" />
                </div>
                <p className="text-xs font-bold text-slate-300 leading-relaxed">
                  Your cube configuration is valid! You can now proceed to see the magic solution.
                </p>
              </div>
            ) : (
              problems.map((prob, idx) => (
                <div key={idx} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                    <AlertCircle size={24} className="text-red-400/80" />
                  </div>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed">{prob}</p>
                </div>
              ))
            )}

            {!isValid && problems.length === 0 && (
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Info size={22} className="text-yellow-400" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  Scan or manually input all 54 stickers to see if your cube can be solved.
                </p>
              </div>
            )}
          </div>
        </div>

        {isValid && (
          <button
            onClick={() => navigate('/history')}
            className="mt-8 w-full h-16 rounded-[2rem] bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            Go to Solution
          </button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
