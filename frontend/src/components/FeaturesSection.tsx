'use client';

import React from 'react';
import { 
  Flame, 
  UserCheck, 
  Type, 
  Palette, 
  Crop, 
  Download, 
  Sparkles, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'AI Viral Moment Detection',
      tag: 'Proprietary NLP',
      desc: 'Our neural models analyze speech cadence, volume peaks, semantic emotional hooks, and viewer drop-off patterns to identify 30-90 second segments with maximum engagement probability.',
      icon: Flame,
      preview: (
        <div className="mt-4 p-3 rounded-xl bg-[#0F1122] border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon animate-ping" />
            <span className="font-mono text-white text-[11px]">Virality Model: 98.4%</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-electric text-white">
            High Retention
          </span>
        </div>
      )
    },
    {
      title: 'Automatic Face Tracking',
      tag: '60FPS Center Lock',
      desc: 'Computer vision frame-by-frame analysis actively centers the speaker or reaction subject in 9:16 vertical space with smooth camera pan-and-scan easing. No awkward cut-offs.',
      icon: UserCheck,
      preview: (
        <div className="mt-4 p-3 rounded-xl bg-[#0F1122] border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-neon rounded flex items-center justify-center text-[8px] font-mono text-neon font-bold">
              [+]
            </div>
            <span className="font-mono text-white text-[11px]">Active Speaker: Centered</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-neon/20 text-neon border border-neon/40">
            60 FPS Lock
          </span>
        </div>
      )
    },
    {
      title: 'Dynamic Animated Captions',
      tag: 'Word-By-Word Neon Pop',
      desc: 'Synchronized word-level highlighting with bold typography, high-contrast outlines, glowing accent words, and contextual emojis proven to boost watch-time past 100%.',
      icon: Type,
      preview: (
        <div className="mt-4 p-3 rounded-xl bg-[#0F1122] border border-border flex items-center justify-center text-center">
          <span className="font-display font-black text-xs text-white">
            STOP <span className="bg-neon text-black px-1.5 py-0.5 rounded mx-1 font-black">SCROLLING</span> START CLIPPING 🔥
          </span>
        </div>
      )
    },
    {
      title: 'Multiple Editing Styles',
      tag: '5 Creator Presets',
      desc: 'Switch effortlessly between Viral Podcast, Hormozi Bold Pop, Executive Speaker, Kinetic Glow, and Gaming Reactions with custom color grading and font pairings.',
      icon: Palette,
      preview: (
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
          <span className="px-2 py-1 rounded-lg bg-electric text-white whitespace-nowrap">Hormozi Gold</span>
          <span className="px-2 py-1 rounded-lg bg-card border border-border text-text-muted whitespace-nowrap">Viral Podcast</span>
          <span className="px-2 py-1 rounded-lg bg-card border border-border text-text-muted whitespace-nowrap">Cyber Gaming</span>
        </div>
      )
    },
    {
      title: 'Smart Vertical Cropping',
      tag: 'Multi-Aspect 9:16',
      desc: 'Choose between full-screen smart face tracking or cinematic blurred background pillarboxing to preserve original wide-angle composition when needed.',
      icon: Crop,
      preview: (
        <div className="mt-4 p-3 rounded-xl bg-[#0F1122] border border-border flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-text-muted">Aspect Ratio</span>
          <span className="font-mono font-bold text-neon text-[11px]">9:16 Vertical (1080x1920)</span>
        </div>
      )
    },
    {
      title: 'One-Click MP4 Export',
      tag: 'Full HD 60FPS',
      desc: 'Direct GPU-accelerated FFmpeg export with hardware encoding. Download individual clips or bulk ZIP archives bundled with auto-generated viral YouTube titles and tags.',
      icon: Download,
      preview: (
        <div className="mt-4 p-3 rounded-xl bg-[#0F1122] border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 font-bold text-[11px]">Export Ready</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white text-black">
            Download ZIP
          </span>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-text-muted uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-electric-light" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
          ENGINEERED FOR <span className="text-electric-light">MAXIMUM RETENTION</span>
        </h2>
        <p className="text-sm sm:text-base text-text-muted">
          Every tool in our AI pipeline is designed around algorithm-favored signals that keep viewers watching from the first frame.
        </p>
      </div>

      {/* 6-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="group rounded-3xl bg-card border border-border p-6 sm:p-8 flex flex-col justify-between hover:border-electric transition-all duration-300 hover:shadow-xl hover:shadow-electric/15 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-electric/15 border border-electric/40 flex items-center justify-center text-electric group-hover:scale-105 group-hover:bg-electric group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-surface border border-border text-text-muted">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-lg sm:text-xl text-white uppercase tracking-tight mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </div>

              {feat.preview}
            </div>
          );
        })}
      </div>
    </section>
  );
}
