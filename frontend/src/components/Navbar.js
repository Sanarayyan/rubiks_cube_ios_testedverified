import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Palette, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/manual', label: 'Manual Input', icon: Palette },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/manual" className="flex items-center space-x-3 group transition-transform active:scale-95">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Box className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight uppercase">
                CUBE <span className="text-blue-500 font-medium">SOLVER</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative text-xs font-black tracking-[0.2em] uppercase transition-all hover:text-white ${isActive(item.path) ? 'text-white' : 'text-slate-400'
                    }`}
                >
                  <span className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {isActive(item.path) && (
                    <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500 rounded-full shadow-[0_4px_12px_rgba(59,130,246,0.5)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-90"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-6 pb-12 space-y-2 bg-slate-950/95 backdrop-blur-3xl border-b border-white/10 pt-4 animate-in slide-in-from-top duration-300">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-4 px-6 py-5 rounded-[1.5rem] text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] ${isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-white/5'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 
