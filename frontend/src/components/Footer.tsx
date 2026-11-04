'use client';

import React from 'react';
import { Play, Sparkles, Youtube, Twitter, Github } from 'lucide-react';

interface FooterProps {
  onOpenStudio: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export default function Footer({ onOpenStudio, onNavigateSection }: FooterProps) {
  return (
    <footer className="border-t border-border bg-[#07080E] py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        
        {/* Brand Info */}
        <div className="space-y-3 max-w-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-electric flex items-center justify-center shadow-md">
              <div className="w-3 h-3 bg-neon rounded-full flex items-center justify-center">
                <Play className="w-1.5 h-1.5 text-black fill-black ml-0.2" />
              </div>
            </div>
            <span className="font-display font-black text-xl text-white tracking-tight">
              AUTOCLIP<span className="text-electric">.AI</span>
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed font-normal">
            ONE LINK. MULTIPLE VIRAL-READY SHORTS. Turn long-form YouTube content into engaging vertical clips in under a minute with AI face-tracking and dynamic animated captions.
          </p>
          <div className="text-[11px] font-mono text-text-muted">
            &copy; {new Date().getFullYear()} AutoClip AI Technologies Inc. All rights reserved.
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-1.5 text-text-muted">
              <li>
                <button onClick={() => onNavigateSection('how-it-works')} className="hover:text-neon transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('features')} className="hover:text-neon transition-colors">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('templates')} className="hover:text-neon transition-colors">
                  Templates
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('pricing')} className="hover:text-neon transition-colors">
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white">Workspace</h4>
            <ul className="space-y-1.5 text-text-muted">
              <li>
                <button onClick={onOpenStudio} className="hover:text-neon transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={onOpenStudio} className="hover:text-neon transition-colors">
                  My Projects
                </button>
              </li>
              <li>
                <button onClick={onOpenStudio} className="hover:text-neon transition-colors">
                  Generated Clips
                </button>
              </li>
              <li>
                <button onClick={onOpenStudio} className="hover:text-neon transition-colors">
                  Clip Editor
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-white">AI Engine</h4>
            <ul className="space-y-1.5 text-text-muted">
              <li><span>60 FPS Face Tracker</span></li>
              <li><span>Word-Level Subtitles</span></li>
              <li><span>FastAPI + FFmpeg</span></li>
              <li><span>Offline Heuristic NLP</span></li>
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
}
