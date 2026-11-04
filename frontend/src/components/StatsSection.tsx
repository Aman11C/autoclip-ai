'use client';

import React from 'react';
import { Video, Flame, Clock, Zap } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsSectionProps {
  stats: DashboardStats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const cards = [
    {
      label: 'Generated Clips',
      value: stats.total_clips,
      sub: `${stats.rendered_variants} 9:16 MP4s ready`,
      icon: Video,
      color: 'text-neon',
      bg: 'bg-neon/10 border-neon/30'
    },
    {
      label: 'Avg Virality Score',
      value: `${stats.avg_virality_score}%`,
      sub: 'AI-predicted retention index',
      icon: Flame,
      color: 'text-neon',
      bg: 'bg-neon/15 border-neon/30'
    },
    {
      label: 'Production Hours Saved',
      value: `${stats.hours_saved}h`,
      sub: 'Zero manual timeline editing',
      icon: Clock,
      color: 'text-electric-light',
      bg: 'bg-electric/15 border-electric/40'
    },
    {
      label: 'Available Credits',
      value: stats.available_credits,
      sub: `of ${stats.total_credits} monthly units`,
      icon: Zap,
      color: 'text-electric-light',
      bg: 'bg-electric/20 border-electric/40'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div 
            key={i} 
            className="rounded-2xl bg-card border border-border p-4.5 flex items-center gap-3.5 shadow-md hover:border-electric/60 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${c.bg}`}>
              <Icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-text-muted block font-medium truncate uppercase tracking-wider">
                {c.label}
              </span>
              <span className="font-display text-2xl font-black text-white tracking-tight">
                {c.value}
              </span>
              <span className="text-[10px] text-text-muted block truncate font-mono">
                {c.sub}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
