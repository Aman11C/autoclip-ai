'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Video, 
  Sparkles, 
  Settings, 
  Zap,
  PanelLeftClose,
  Play,
  Flame,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  credits: number;
  totalCredits: number;
  isOpen: boolean;
  onToggle: () => void;
  onBackToWebsite?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  credits, 
  totalCredits,
  isOpen,
  onToggle,
  onBackToWebsite
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'clips', label: 'Generated Clips', icon: Video, badge: 'Viral' },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const creditPercent = Math.min(100, Math.round((credits / totalCredits) * 100));

  return (
    <aside
      className={`border-r border-border bg-[#111321] flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out relative z-30 ${
        isOpen 
          ? 'w-64 p-4 opacity-100 translate-x-0' 
          : 'w-0 p-0 opacity-0 -translate-x-full overflow-hidden border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-56 min-w-[224px]">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-electric flex items-center justify-center shadow-lg shadow-electric/40">
              <div className="w-3.5 h-3.5 bg-neon rounded-full flex items-center justify-center">
                <Play className="w-2 h-2 text-black fill-black ml-0.2" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg tracking-tight text-white">
                  AUTOCLIP<span className="text-electric">.AI</span>
                </span>
              </div>
              <p className="text-[10px] text-text-muted">Pro Video Suite</p>
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={onToggle}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-card border border-transparent hover:border-border transition-all"
            title="Hide sidebar (Ctrl+B)"
            aria-label="Hide sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-electric text-white shadow-lg shadow-electric/30 font-extrabold'
                    : 'text-text-muted hover:text-white hover:bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neon' : 'text-text-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[9px] font-black rounded-md ${
                    isActive ? 'bg-neon text-black' : 'bg-neon/15 text-neon border border-neon/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Website Pill Button */}
        {onBackToWebsite && (
          <div className="mt-4 pt-4 border-t border-border/80">
            <button
              onClick={onBackToWebsite}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-text-muted hover:text-white hover:bg-card flex items-center gap-2 border border-dashed border-border hover:border-electric transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-electric-light" />
              <span>Back to Landing Page</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Area: Monthly Credits Card & Engine Status */}
      <div className="w-56 min-w-[224px] space-y-3 pt-4 border-t border-border">
        {/* Credits Box */}
        <div className="p-3.5 rounded-2xl bg-[#171A2B] border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-neon fill-neon" />
              Credits
            </span>
            <span className="text-xs font-mono font-bold text-neon">
              {credits} <span className="text-text-muted font-normal">/ {totalCredits}</span>
            </span>
          </div>
          <div className="w-full bg-[#0A0C16] h-2 rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-gradient-to-r from-electric to-neon transition-all duration-500 rounded-full"
              style={{ width: `${creditPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-2">
            10 credits per AI viral short generation.
          </p>
        </div>

        {/* Engine Live Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-card border border-border text-[11px] text-text-muted">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
            </span>
            <span className="font-semibold text-white">AI Engine 60FPS</span>
          </div>
          <span className="text-[10px] text-neon font-black uppercase tracking-wider">Ready</span>
        </div>
      </div>
    </aside>
  );
}
