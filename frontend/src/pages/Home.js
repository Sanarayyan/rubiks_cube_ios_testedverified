import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, History, Zap, Box, Brain, Play, Smartphone } from 'lucide-react';
import Cube3D from '../components/Cube3D';
import { generateSolvedCube } from '../services/api';

const Home = () => {
  const features = [
    {
      icon: Box,
      title: '3D Cube',
      description: 'See a real-looking cube that you can spin and move around',
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'Smart Solver',
      description: 'Our computer brain finds the fastest way to solve your cube',
      color: 'green'
    },
    {
      icon: Play,
      title: 'Easy Steps',
      description: 'We show you exactly which way to turn each part of the cube',
      color: 'yellow'
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Use it on your phone, tablet, or computer - it works great on all of them!',
      color: 'purple'
    }
  ];

  const actions = [
    {
      icon: Palette,
      title: 'Manual Input',
      description: 'Click on the cube to tell us what colors you see on each side',
      path: '/manual',
      color: 'green'
    },
    {
      icon: History,
      title: 'View History',
      description: 'See all the cubes you\'ve solved before and how you did it',
      path: '/history',
      color: 'purple'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600 text-white',
      green: 'bg-green-500 hover:bg-green-600 text-white',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      purple: 'bg-purple-500 hover:bg-purple-600 text-white'
    };
    return colors[color] || colors.blue;
  };

  const previewState = generateSolvedCube();

  return (
    <div className="min-h-screen relative bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Premium Animated Mesh Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-blue-600/20 blur-[120px] animate-float-slow" />
        <div className="absolute top-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-indigo-600/20 blur-[100px] animate-float-medium" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-purple-600/15 blur-[110px] animate-float-fast" />
        <div className="absolute top-[50%] left-[10%] h-[30%] w-[30%] rounded-full bg-emerald-600/10 blur-[80px] animate-float-slow" />

        {/* Noise/Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-100" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <div className="inline-flex items-center space-x-2 rounded-full px-4 py-1.5 mb-8 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">AI Powered Solver</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tight">
              MASTER THE <br />
              <span className="bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">CUBE</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Experience the future of Rubik's solving. Styled, step-by-step algorithms delivered with precision.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/manual"
                className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Palette className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                GET STARTED
              </Link>

              <button className="px-8 py-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800 transition-colors">
                LEARN MORE
              </button>
            </div>
          </div>

          {/* 3D Cube Preview with Glassmorphic Container */}
          <div className="mt-8 flex justify-center perspective-[2500px] px-2 sm:px-4">
            <div className="relative w-full max-w-4xl aspect-square sm:aspect-video rounded-[3rem] shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] overflow-hidden bg-slate-900/10 backdrop-blur-3xl ring-1 ring-white/10 group group-hover:ring-blue-500/40 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 opacity-60" />

              <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3 opacity-50">
                {[...Array(3)].map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]" />)}
              </div>

              <div className="absolute inset-0 flex items-center justify-center transform scale-[1.25] sm:scale-[1.5] transition-transform duration-1000 group-hover:scale-[1.6]">
                <Cube3D cubeState={previewState} autoRotate={true} />
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-2xl border border-white/10 px-8 py-3 rounded-full text-[11px] font-black tracking-[0.4em] text-white/50 uppercase">
                Interactive Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Cards Section */}
      <section className="py-24 px-4 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight">SOLVER MODES</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.path}
                  className="group relative flex items-center p-8 rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:bg-slate-900 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Icon size={120} />
                  </div>

                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center mr-8 ${getColorClasses(action.color)} shadow-2xl group-hover:scale-110 transition-transform`}>
                    <Icon size={32} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed max-w-xs">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-[0.3em] text-indigo-400 uppercase mb-4">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-white">ENGINEERED FOR SPEED</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm hover:translate-y-[-8px] transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${getColorClasses(feature.color)}`}>
                    <Icon size={24} />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 blur-[150px] mix-blend-screen" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight">READY TO <br /><span className="text-blue-500">SOLVE?</span></h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/manual"
              className="px-12 py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all active:scale-95 shadow-2xl shadow-blue-500/20"
            >
              LAUNCH SOLVER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 