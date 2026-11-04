'use client';

import React from 'react';
import { 
  PlayCircle, 
  ShieldCheck, 
  PanelLeftClose, 
  PanelLeftOpen,
  ArrowUpRight,
  Globe
} from 'lucide-react';

interface HeaderProps {
  onLoadDemo: () => void;
  isDemoLoading: boolean;
  activeProjectTitle?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onBackToWebsite?: () => void;
}

export default function Header({ 
  onLoadDemo, 
  isDemoLoading, 
  activeProjectTitle,
  isSidebarOpen,
  onToggleSidebar,
  onBackToWebsite
}: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-[#111321]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 transition-all z-20">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-text-muted hover:text-white bg-card hover:bg-[#1F233A] border border-border hover:border-electric transition-all flex items-center justify-center shrink-0 shadow-sm group"
          title={isSidebarOpen ? "Hide sidebar (Ctrl+B)" : "Show sidebar (Ctrl+B)"}
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4 text-electric-light group-hover:text-neon transition-colors" />
          ) : (
            <PanelLeftOpen className="w-4 h-4 text-electric-light group-hover:text-neon transition-colors" />
          )}
        </button>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold block font-mono">
            AutoClip Workspace
          </span>
          <h2 className="text-sm font-bold text-white flex items-center gap-2 truncate max-w-xs sm:max-w-sm md:max-w-md">
            {activeProjectTitle || 'Autonomous Viral Short Production'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Demo Mode Button */}
        <button
          onClick={onLoadDemo}
          disabled={isDemoLoading}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold bg-electric hover:bg-electric-hover text-white shadow-md shadow-electric/25 transition-all disabled:opacity-50"
          title="Load pre-analyzed demo project with verified clips"
        >
          <PlayCircle className="w-3.5 h-3.5 text-neon" />
          <span className="hidden xs:inline sm:inline">{isDemoLoading ? 'Loading Demo...' : 'Load Sample Demo'}</span>
          <span className="inline xs:hidden sm:hidden">Demo</span>
        </button>

        {/* Back to Landing Page Shortcut */}
        {onBackToWebsite && (
          <button
            onClick={onBackToWebsite}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:border-electric text-xs font-semibold text-text-muted hover:text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-neon" />
            <span>Landing Page</span>
          </button>
        )}

        {/* Resolution Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-xs text-text-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-neon" />
          <span>1080x1920 60FPS</span>
        </div>
      </div>
    </header>
  );
}
