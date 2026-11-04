'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X, 
  Video,
  Play
} from 'lucide-react';

interface NavbarProps {
  onOpenStudio: () => void;
  isStudioActive?: boolean;
  onNavigateLandingSection?: (sectionId: string) => void;
}

export default function Navbar({ onOpenStudio, isStudioActive, onNavigateLandingSection }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onNavigateLandingSection) {
      onNavigateLandingSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      <nav className="backdrop-blur-xl bg-[#090A12]/85 border border-border rounded-2xl sm:rounded-full px-5 py-3 shadow-2xl shadow-black/80 flex items-center justify-between transition-all">
        {/* Left: AutoClip AI Logo */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-electric flex items-center justify-center shadow-lg shadow-electric/40 group-hover:scale-105 transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
            <div className="w-3.5 h-3.5 bg-neon rounded-full flex items-center justify-center">
              <Play className="w-2 h-2 text-[#090A12] fill-[#090A12] ml-0.5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-neon transition-colors">
              AUTOCLIP<span className="text-electric ml-0.5">.AI</span>
            </span>
            <span className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neon/15 text-neon rounded border border-neon/30">
              PRO
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-text-muted">
          <button 
            onClick={() => handleNavClick('how-it-works')} 
            className="hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleNavClick('features')} 
            className="hover:text-white transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('templates')} 
            className="hover:text-white transition-colors"
          >
            Templates
          </button>
          <button 
            onClick={() => handleNavClick('pricing')} 
            className="hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={onOpenStudio} 
            className={`transition-colors flex items-center gap-1.5 ${
              isStudioActive ? 'text-neon font-bold' : 'hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-neon" />
            <span>Studio App</span>
          </button>
        </div>

        {/* Right CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenStudio}
            className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onOpenStudio}
            className="px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-neon hover:bg-neon-hover text-[#090A12] flex items-center gap-2 shadow-lg shadow-neon/20 hover:shadow-neon/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenStudio}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-neon text-[#090A12]"
          >
            Studio
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-muted hover:text-white rounded-xl bg-card border border-border"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 p-5 rounded-2xl bg-card/95 border border-border backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={() => handleNavClick('how-it-works')} 
            className="text-left text-sm font-semibold text-text-muted hover:text-white py-1"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleNavClick('features')} 
            className="text-left text-sm font-semibold text-text-muted hover:text-white py-1"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavClick('templates')} 
            className="text-left text-sm font-semibold text-text-muted hover:text-white py-1"
          >
            Templates
          </button>
          <button 
            onClick={() => handleNavClick('pricing')} 
            className="text-left text-sm font-semibold text-text-muted hover:text-white py-1"
          >
            Pricing
          </button>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudio();
              }}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-text-muted hover:text-white bg-surface"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudio();
              }}
              className="w-full py-2.5 rounded-xl text-center text-xs font-extrabold uppercase bg-neon text-[#090A12] shadow-lg shadow-neon/20 flex items-center justify-center gap-2"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
