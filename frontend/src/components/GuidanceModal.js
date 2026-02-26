import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Info, MousePointer2, Box, LayoutGrid } from 'lucide-react';

const GuidanceModal = ({ isOpen, onClose, steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setCurrentStep(0);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    return (
        <div className={`fixed inset-0 z-[2000] flex items-center justify-center p-6 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-sm bg-[#1F1235]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Progress Dots */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`} 
                        />
                    ))}
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pt-12">
                    {/* Icon/Illustration Area */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            {step.icon || <Info className="w-10 h-10 text-white" />}
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center">
                        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                            {step.title}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white/5 flex items-center justify-between border-t border-white/5">
                    <button 
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white'}`}
                    >
                        <ChevronLeft size={16} />
                        Back
                    </button>

                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 rounded-2xl text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {isLastStep ? 'Got it!' : 'Next'}
                        {!isLastStep && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuidanceModal;
