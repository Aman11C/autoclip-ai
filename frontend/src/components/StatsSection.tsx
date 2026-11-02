'use client';

import React from 'react';
import { Video, Flame, Clock, Zap, CheckCircle2 } from 'lucide-react';
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
      color: 'text-primary-400',
      bg: 'bg-primary-500/10 border-primary-500/20'
    },
    {
      label: 'Avg Virality Score',
      value: `${stats.avg_virality_score}%`,
      sub: 'Estimated retention',
      icon: Flame,
      color: 'text-accent-purple',
      bg: 'bg-accent-purple/10 border-accent-purple/20'
    },
    {
      label: 'Production Hours Saved',
      value: `${stats.hours_saved}h`,
      sub: 'Zero manual editing',
      icon: Clock,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/10 border-accent-cyan/20'
    },
    {
      label: 'Available Credits',
      value: stats.available_credits,
      sub: `of ${stats.total_credits} monthly units`,
      icon: Zap,
      color: 'text-accent-amber',
      bg: 'bg-accent-amber/10 border-accent-amber/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="glass-card p-4 rounded-2xl flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${c.bg}`}>
              <Icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">{c.label}</span>
              <span className="text-xl font-extrabold text-white tracking-tight">{c.value}</span>
              <span className="text-[11px] text-slate-500 block truncate">{c.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
