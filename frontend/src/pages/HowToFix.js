import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Eye, RotateCcw } from 'lucide-react';

const HowToFix = () => {
    const navigate = useNavigate();

    const fixSteps = [
        {
            icon: Eye,
            title: "Double-Check Your Cube",
            description: "Look at your physical Rubik's Cube carefully. Count each colored sticker on all 6 faces.",
            tip: "Each face should have 9 stickers, totaling 54 stickers on the entire cube."
        },
        {
            icon: AlertTriangle,
            title: "Find the Incorrect Colors",
            description: "The error message tells you which colors have wrong counts. For example, if it says 'Orange: 10/9', you have one extra orange sticker.",
            tip: "Compare your physical cube with the colors you entered in the app."
        },
        {
            icon: RotateCcw,
            title: "Correct the Mistakes",
            description: "Go back to the manual input page and tap on the incorrect stickers to change their colors. Match them exactly with your physical cube.",
            tip: "Center stickers are locked because they never move on a real Rubik's Cube."
        },
        {
            icon: CheckCircle2,
            title: "Verify the Counts",
            description: "After fixing, each color should have exactly 9 stickers. The app will show 'Perfect (9/9)' for all colors when correct.",
            tip: "Once all counts are correct, the solve button will work!"
        }
    ];

    const commonMistakes = [
        {
            problem: "Confusing similar colors",
            solution: "Check red vs orange, and blue vs green carefully in good lighting"
        },
        {
            problem: "Entering stickers too quickly",
            solution: "Take your time and verify each face before moving to the next"
        },
        {
            problem: "Not matching the physical cube",
            solution: "Hold your cube and the app side-by-side while entering colors"
        }
    ];

    return (
        <div className="h-screen w-full bg-[#0D061A] text-white flex flex-col items-center justify-start font-sans relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-rose-900/10 blur-[140px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md p-4 pb-12 flex-1 overflow-y-auto custom-scrollbar">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 active:scale-95 py-2"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Back</span>
                    </button>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-500 rounded-[1.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#1F1235]/80 backdrop-blur-3xl rounded-[1.5rem] p-5 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Lightbulb className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white leading-tight">How to Fix</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Color errors guide</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Follow these steps to correct your cube colors so we can solve it.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fix Steps */}
                <div className="space-y-3 mb-6">
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Step-by-Step</h2>
                    {fixSteps.map((step, idx) => (
                        <div key={idx} className="bg-[#1F1235]/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg mt-1">
                                    <step.icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">STEP {idx + 1}</span>
                                        <h3 className="text-sm font-bold text-white leading-tight">{step.title}</h3>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">{step.description}</p>
                                    <div className="flex items-start gap-1.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-2">
                                        <Lightbulb className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-[10px] text-indigo-300 font-medium leading-tight">{step.tip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Common Mistakes */}
                <div className="bg-[#1F1235]/60 backdrop-blur-2xl rounded-2xl p-4 border border-white/10 shadow-lg mb-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" />
                        Avoid Mistakes
                    </h2>
                    <div className="space-y-2">
                        {commonMistakes.map((item, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[11px] font-bold text-rose-300 mb-0.5">❌ {item.problem}</p>
                                <p className="text-[11px] text-emerald-300 font-medium">✅ {item.solution}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-500 text-white font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
                >
                    <CheckCircle2 size={20} />
                    I'm Ready to Fix It
                </button>
            </div>
        </div>
    );
};

export default HowToFix;
