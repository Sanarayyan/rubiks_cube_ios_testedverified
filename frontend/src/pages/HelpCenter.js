import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Book, Video, MessageCircle, Mail, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const HelpCenter = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "Why does it say 'Check Your Cube'?",
            answer: "This error appears when the colors you entered don't match a valid Rubik's Cube. Every Rubik's Cube has exactly 9 stickers of each of the 6 colors (54 total). Check that you have exactly 9 of each: White, Yellow, Red, Orange, Blue, and Green."
        },
        {
            question: "What does 'Network error' mean?",
            answer: "This means the app couldn't connect to the solver. Make sure both the frontend and backend servers are running. You need to start the backend server first before using the solve feature."
        },
        {
            question: "How do I enter my cube correctly?",
            answer: "You have 3 input modes: 3D View (rotate and tap), Grid View (face-by-face), and Net View (cross pattern). Choose whichever is easiest for you. Tap each sticker to cycle through colors until it matches your physical cube exactly."
        },
        {
            question: "Why can't I change the center stickers?",
            answer: "Center stickers are locked because they define each face's color and never move on a real Rubik's Cube. They help the app understand which face is which."
        },
        {
            question: "The solution isn't working on my cube!",
            answer: "Make sure you entered your cube's colors exactly as they appear. Even one wrong sticker will give an incorrect solution. Double-check your input before solving."
        },
        {
            question: "How many moves will it take to solve?",
            answer: "Our solver uses the Kociemba algorithm, which typically finds solutions in 20 moves or less. The actual number depends on how scrambled your cube is."
        }
    ];

    const resources = [
        {
            icon: Book,
            title: "User Guide",
            description: "Complete documentation on using all features",
            action: "Read Guide",
            gradient: "from-blue-500 to-cyan-500",
            link: "/user-guide"
        },
        {
            icon: Video,
            title: "Video Tutorials",
            description: "Watch step-by-step video demonstrations",
            action: "Watch Videos",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: MessageCircle,
            title: "Community Forum",
            description: "Ask questions and get help from other users",
            action: "Join Forum",
            gradient: "from-emerald-500 to-teal-500"
        }
    ];

    return (
        <div className="h-screen w-full bg-[#0D061A] text-white flex flex-col items-center justify-start font-sans relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/15 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 blur-[140px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md px-6 pt-10 pb-12 flex-1 overflow-y-auto custom-scrollbar">
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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 rounded-[1.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#1F1235]/80 backdrop-blur-3xl rounded-[1.5rem] p-5 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <HelpCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-white leading-tight">Help Center</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support & Answers</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Find answers, learn how to use the app, and get help.
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">FAQ</h2>
                    <div className="space-y-2">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-[#1F1235]/60 backdrop-blur-2xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-4 flex items-center justify-between text-left active:bg-white/5 transition-all"
                                >
                                    <span className="text-[13px] font-bold text-white pr-3 leading-tight">{faq.question}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-4 pb-4 pt-0">
                                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                                            <p className="text-[11px] text-slate-300 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resources */}
                <div className="mb-6">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1">Resources</h2>
                    <div className="space-y-3">
                        {resources.map((resource, idx) => (
                            <div key={idx} className="bg-[#1F1235]/60 backdrop-blur-2xl rounded-xl p-4 border border-white/10 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 bg-gradient-to-br ${resource.gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                        <resource.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-black text-white mb-0.5 truncate">{resource.title}</h3>
                                        <p className="text-[10px] text-slate-400 font-medium truncate">{resource.description}</p>
                                    </div>
                                    <button
                                        onClick={() => resource.link && navigate(resource.link)}
                                        className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white active:scale-90 transition-all"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-2xl rounded-2xl p-5 border border-indigo-500/20 shadow-xl mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white leading-none mb-1">Support</h3>
                            <p className="text-[10px] text-slate-300 leading-tight">
                                Need more help? Contact us.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = 'mailto:info@ferryswiss.com'}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-xs hover:shadow-indigo-500/40"
                    >
                        <Mail size={16} />
                        Contact Team
                    </button>
                </div>


            </div>
        </div>
    );
};

export default HelpCenter;
