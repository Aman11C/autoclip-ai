'use client';

import React from 'react';
import { Sparkles, Video, PlayCircle, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLoadDemo: () => void;
  isDemoLoading: boolean;
  activeProjectTitle?: string;
}

export default function Header({ onLoadDemo, isDemoLoading, activeProjectTitle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-borderSubtle bg-surface/30 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            AutoClip Workspace
          </span>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {activeProjectTitle || 'Autonomous Viral Short Production'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Demo Mode Button */}
        <button
          onClick={onLoadDemo}
          disabled={isDemoLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-purple/15 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/25 transition-all shadow-sm disabled:opacity-50"
          title="Load pre-analyzed demo project with verified clips"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>{isDemoLoading ? 'Loading Demo...' : 'Load Demo Project'}</span>
        </button>

        {/* Engine Security Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surfaceElevated border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Authorized Ingestion Only</span>
        </div>
      </div>
    </header>
  );
}
