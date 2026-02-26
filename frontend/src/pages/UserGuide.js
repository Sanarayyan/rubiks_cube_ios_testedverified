import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Camera, Box, Play, RotateCcw, AlertTriangle } from 'lucide-react';

const UserGuide = () => {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Getting Started",
            icon: Box,
            content: "Ensure you have a standard 3x3 Rubik's Cube. The app works by scanning your cube's current state and calculating the optimal solution.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Inputting Your Cube",
            icon: Camera,
            content: "You can input your cube manually using the 3D view or the Net view. Tap the stickers to match your physical cube's colors. Make sure to input exactly 9 stickers of each color.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Solving",
            icon: Play,
            content: "Once your cube is entered correctly, tap the 'Solve Cube' button. The app will generate a step-by-step solution. Follow the moves exactly as shown.",
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            title: "Resetting",
            icon: RotateCcw,
            content: "To start over, use the 'Reset Cube' button (rotate icon) to clear all your inputs and return the cube to a solved state.",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            title: "Common Issues",
            icon: AlertTriangle,
            content: "If you get a 'Check Your Cube' error, it means you have an invalid number of colors. The app will tell you which colors are incorrect.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
        }
    ];

    return (
        <div className="h-screen w-full bg-[#0D061A] text-white flex flex-col items-center justify-start font-sans relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/15 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/10 blur-[140px] rounded-full" />
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-[1.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#1F1235]/80 backdrop-blur-3xl rounded-[1.5rem] p-5 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Book className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white leading-tight">User Guide</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Master the App</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Everything you need to know to use the Rubik's Solver Suite effectively.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-3 mb-6">
                    {sections.map((section, idx) => (
                        <div key={idx} className={`rounded-2xl p-4 border shadow-lg backdrop-blur-xl ${section.bg} ${section.border}`}>
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 ${section.color}`}>
                                    <section.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white mb-1 leading-tight">{section.title}</h3>
                                    <p className="text-[11px] text-slate-300 leading-relaxed theme-transition">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pro Tip */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-2xl rounded-2xl p-5 border border-indigo-500/20 shadow-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">🎓</span>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Pro Tip</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        For the fastest entry, use the "Net" view (grid layout) to quickly tap in colors face by face without rotating a 3D model!
                    </p>
                </div>

            </div>
        </div>
    );
};

export default UserGuide;
