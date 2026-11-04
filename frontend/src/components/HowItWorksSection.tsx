'use client';

import React from 'react';
import { 
  Link2, 
  Sparkles, 
  Video, 
  ArrowRight, 
  Youtube, 
  Sliders, 
  Bot, 
  Zap, 
  CheckCircle2, 
  Play, 
  Flame 
} from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'DROP YOUR LINK',
      subtitle: 'Paste your YouTube URL.',
      desc: 'Simply copy and paste any long-form YouTube video, podcast, Twitch VOD, or interview link. AutoClip parses the high-definition stream in seconds.',
      badge: 'Zero Upload Time',
      badgeColor: 'text-neon bg-neon/10 border-neon/30',
      illustration: (
        <div className="relative w-full h-44 rounded-2xl bg-[#0F1120] border border-border overflow-hidden flex flex-col justify-center items-center p-4 group-hover:border-electric transition-colors">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          
          {/* Animated Input URL Bar mockup */}
          <div className="w-full max-w-xs bg-[#171A2B] rounded-xl border border-electric/60 p-2.5 shadow-lg shadow-electric/20 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-lg bg-rose-600 flex items-center justify-center shrink-0">
                <Youtube className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[11px] font-mono text-white truncate">
                https://youtube.com/watch?v=...
              </span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-neon text-black shrink-0">
              PASTED
            </span>
          </div>

          {/* Connected data flow indicator */}
          <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-text-muted z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Resolving 1080p stream & transcripts...</span>
          </div>
        </div>
      )
    },
    {
      num: '02',
      title: 'AI FINDS THE MOMENTS',
      subtitle: 'Our AI discovers the most engaging parts of your video.',
      desc: 'Proprietary speech sentiment models and energy detection pinpoint viral hooks, high-retention stories, controversial statements, and natural punchlines.',
      badge: '98% Virality Accuracy',
      badgeColor: 'text-electric-light bg-electric/15 border-electric/40',
      illustration: (
        <div className="relative w-full h-44 rounded-2xl bg-[#0F1120] border border-border overflow-hidden flex flex-col justify-center items-center p-4 group-hover:border-electric transition-colors">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* AI Moment Detection Visual Graphic */}
          <div className="w-full max-w-xs space-y-2 z-10">
            <div className="flex items-center justify-between text-[11px] font-bold text-white bg-card p-2 rounded-lg border border-border">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-neon" />
                <span>HOOK DETECTED (02:14 - 02:58)</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-neon text-black">
                98% VIRAL
              </span>
            </div>

            {/* Simulated Energy Waveform with peak marker */}
            <div className="h-10 bg-[#171A2B] rounded-lg border border-border flex items-center px-3 gap-1 relative overflow-hidden">
              <div className="absolute left-[45%] top-0 bottom-0 w-16 bg-electric/25 border-x border-neon/60 flex items-center justify-center">
                <span className="text-[8px] font-mono font-bold text-neon">VIRAL SWEETSPOT</span>
              </div>
              {[30, 40, 50, 45, 60, 55, 95, 100, 90, 85, 40, 35, 45, 30, 50, 65, 40].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full ${i >= 6 && i <= 9 ? 'bg-neon h-8' : 'bg-electric/60 h-3'}`} 
                />
              ))}
            </div>

            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>Face Tracker: Centered</span>
              <span>Audio Pacing: Optimal</span>
            </div>
          </div>
        </div>
      )
    },
    {
      num: '03',
      title: 'GET YOUR SHORTS',
      subtitle: 'Receive professionally edited vertical clips with animated captions.',
      desc: 'Automatic 9:16 vertical crop with active face-tracking, word-by-word dynamic subtitle pop animations, and one-click 60FPS MP4 exports ready for TikTok & Shorts.',
      badge: 'Ready To Post',
      badgeColor: 'text-neon bg-neon/10 border-neon/30',
      illustration: (
        <div className="relative w-full h-44 rounded-2xl bg-[#0F1120] border border-border overflow-hidden flex items-center justify-center p-3 group-hover:border-electric transition-colors">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* Mini 9:16 Preview Card */}
          <div className="flex items-center gap-4 z-10 w-full max-w-xs">
            <div className="w-20 aspect-[9/16] rounded-xl bg-card border-2 border-neon overflow-hidden relative shadow-lg shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" 
                alt="Short Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 inset-x-1 bg-black/80 rounded px-1 text-[7px] font-black text-center text-neon truncate">
                VIRAL HOOK
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-left">
              <span className="text-[10px] font-extrabold uppercase text-neon tracking-wider">
                1080x1920 MP4
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1">
                The 3-Second Retention Secret
              </h4>
              <p className="text-[10px] text-text-muted">
                Word-highlight captions + 60FPS face tracking applied
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-electric text-white shadow-sm">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>Download MP4</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-text-muted uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-neon" />
          <span>Simple 3-Step Workflow</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
          HOW IT <span className="text-neon">WORKS</span>
        </h2>
        <p className="text-sm sm:text-base text-text-muted">
          From YouTube URL to viral vertical short in under 60 seconds. No complex timelines, no video editing experience required.
        </p>
      </div>

      {/* 3 Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="group relative rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-electric transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 hover:-translate-y-1"
          >
            {/* Top Row: Big Neon Number + Badge */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="font-display font-black text-4xl sm:text-5xl text-neon tracking-tighter">
                  {step.num}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${step.badgeColor}`}>
                  {step.badge}
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mb-1">
                {step.title}
              </h3>
              <p className="text-xs font-semibold text-text-primary mb-3">
                {step.subtitle}
              </p>
              <p className="text-xs text-text-muted leading-relaxed mb-6 font-normal">
                {step.desc}
              </p>
            </div>

            {/* Interactive Visual Graphic */}
            <div className="mt-auto">
              {step.illustration}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
