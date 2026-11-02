'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Video, 
  Sparkles, 
  Settings, 
  CreditCard, 
  Cpu, 
  Flame,
  ChevronRight,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  credits: number;
  totalCredits: number;
}

export default function Sidebar({ activeTab, setActiveTab, credits, totalCredits }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'clips', label: 'Generated Clips', icon: Video, badge: 'Viral' },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const creditPercent = Math.min(100, Math.round((credits / totalCredits) * 100));

  return (
    <aside className="w-64 border-r border-borderSubtle bg-surface/50 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 select-none">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-purple to-accent-cyan flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary-400 bg-clip-text text-transparent">
                AutoClip
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-accent-purple/20 text-accent-purple rounded border border-accent-purple/40">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Viral Short Generator</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/30 to-accent-purple/20 text-white border border-primary-500/30 shadow-md shadow-primary-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surfaceElevated/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-accent-rose/20 text-accent-rose rounded-full border border-accent-rose/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Engine Status & Credit Card */}
      <div className="space-y-3 pt-4 border-t border-borderSubtle">
        {/* Credit Card Box */}
        <div className="p-3.5 rounded-xl bg-surfaceElevated/70 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-accent-amber" />
              Usage & Credits
            </span>
            <span className="text-xs font-mono font-bold text-accent-cyan">
              {credits} <span className="text-slate-400 font-normal">/ {totalCredits}</span>
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan transition-all duration-500"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Each viral generation uses 10 credits.
          </p>
        </div>

        {/* Engine Live Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surfaceElevated/40 border border-slate-800/50 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-emerald"></span>
            </span>
            <span>AI Render Engine</span>
          </div>
          <span className="text-[10px] text-accent-emerald font-semibold uppercase">Ready</span>
        </div>
      </div>
    </aside>
  );
}
