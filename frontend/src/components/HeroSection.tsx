'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  Zap, 
  Sliders, 
  Clock, 
  Volume2,
  Film,
  Crop,
  ShieldCheck,
  Check
} from 'lucide-react';

interface HeroSectionProps {
  onGenerateClips: () => void;
  onSeeHowItWorks: () => void;
}

export default function HeroSection({ onGenerateClips, onSeeHowItWorks }: HeroSectionProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  return (
    <section id="hero" className="relative pt-6 pb-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-electric/25 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-neon/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Main Hero Container Billboard */}
      <div className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#121630] via-[#0D1024] to-[#090A12] border border-border overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-14">
        {/* Subtle grid pattern backdrop */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        {/* Ambient Top Rim Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-electric/80 to-transparent" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Modern Brutalist Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Small Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border backdrop-blur-md shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon"></span>
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-text-primary">
                AI-POWERED VIDEO CLIPPING
              </span>
            </div>

            {/* Brutalist Display Headline */}
            <div className="space-y-1 font-display uppercase tracking-tight">
              <h1 className="text-5xl sm:text-7xl xl:text-8xl font-black text-white leading-[0.88] select-none">
                <span className="block">STOP</span>
                <span className="block text-white">SCROLLING.</span>
                <span className="block text-white">START</span>
                <span className="relative inline-block text-neon">
                  CLIPPING.
                  {/* Brutalist slash strikethrough marker accent inspired by reference image */}
                  <span className="absolute left-0 top-[52%] -translate-y-1/2 w-[106%] -ml-1 sm:-ml-2 h-3.5 sm:h-5 bg-gradient-to-r from-[#FF4438] to-[#FF6B4A] -rotate-1 rounded-sm shadow-md pointer-events-none mix-blend-multiply opacity-90" />
                </span>
              </h1>
            </div>

            {/* Supporting Subtext */}
            <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed font-normal">
              Turn hours of YouTube content into scroll-stopping Shorts. Let AI find the best moments, edit your clips, and generate dynamic captions automatically.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onGenerateClips}
                className="px-8 py-4 rounded-full text-sm font-extrabold uppercase tracking-wider bg-neon hover:bg-neon-hover text-[#090A12] flex items-center justify-center gap-3 shadow-xl shadow-neon/25 hover:shadow-neon/45 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Generate My Clips</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onSeeHowItWorks}
                className="px-7 py-4 rounded-full text-sm font-bold uppercase tracking-wider bg-[#171A2B]/80 hover:bg-[#1F233A] text-white border border-border hover:border-electric transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-electric/20"
              >
                <span>See How It Works</span>
              </button>
            </div>

            {/* Social Proof & Metrics Strip */}
            <div className="pt-6 border-t border-border/80 flex flex-wrap items-center gap-6 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-electric/20 flex items-center justify-center text-electric">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-semibold text-text-primary">Zero Manual Editing</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-electric/20 flex items-center justify-center text-electric">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="font-semibold text-text-primary">Active 9:16 Face-Tracking</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center text-neon">
                  <Zap className="w-3 h-3 fill-neon" />
                </div>
                <span className="font-semibold text-text-primary">1080x1920 60FPS</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: High-End 3D Product Visual Illustration */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] sm:min-h-[520px]">
            
            {/* Electric Blue Circular Contrast Backdrop (Inspired by circular orb in reference) */}
            <div className="absolute w-72 sm:w-88 lg:w-96 h-72 sm:h-88 lg:h-96 rounded-full bg-gradient-to-tr from-electric via-electric-light to-[#FF5E3A] opacity-90 blur-sm shadow-[0_0_80px_rgba(52,59,255,0.6)] animate-pulse-glow" />

            {/* Floating 10 Clips Free Badge (Direct homage to "10 CALLS FREE NO CARD" badge in reference) */}
            <div className="absolute top-2 right-4 sm:top-6 sm:right-8 z-30 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-neon border-2 border-black flex flex-col items-center justify-center text-center shadow-xl rotate-12 hover:rotate-6 transition-transform cursor-pointer">
              <span className="font-display font-black text-sm sm:text-base leading-tight text-black">
                10 CLIPS
              </span>
              <span className="font-display font-black text-xs sm:text-sm text-black">
                FREE
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-black/75 mt-0.5">
                NO CARD
              </span>
            </div>

            {/* 3D Smartphone Device Mockup with 9:16 Short Video */}
            <div className="relative z-20 w-[240px] sm:w-[270px] aspect-[9/18] rounded-[36px] bg-[#0A0C16] border-[5px] border-[#292D42] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col transition-transform hover:scale-[1.02] duration-300">
              
              {/* Phone Speaker & Dynamic Island Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-30 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#181B2D] ml-auto mr-2" />
              </div>

              {/* Video Player Display Container */}
              <div className="relative flex-1 bg-gradient-to-b from-[#111322] to-[#0A0C16] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
                  alt="AI Video Speaker Framing"
                  className="w-full h-full object-cover brightness-95"
                />

                {/* Overlaid Animated Face Tracking Bounding Box */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 h-36 border-2 border-dashed border-neon/80 rounded-2xl flex flex-col justify-between p-1.5 shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-neon text-black uppercase">
                      FACE_LOCKED
                    </span>
                    <span className="text-[9px] font-mono text-neon font-bold">60 FPS</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-mono font-bold text-white bg-black/60 px-1 rounded">
                      CENTER: X:540 Y:960
                    </span>
                  </div>
                </div>

                {/* Live Dynamic Word Captions Overlaid on Video */}
                <div className="absolute bottom-16 inset-x-3 text-center pointer-events-none">
                  <div className="inline-block bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-xl">
                    <span className="font-display font-black text-xs sm:text-sm text-white tracking-wide">
                      THE <span className="bg-neon text-black px-1.5 py-0.5 rounded mx-1">3-SECOND</span> RETENTION HOOK
                    </span>
                  </div>
                </div>

                {/* Floating Bottom Video Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 h-8 bg-card/90 backdrop-blur-md rounded-xl border border-border px-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-electric flex items-center justify-center">
                      <Play className="w-2 h-2 text-white fill-white ml-0.5" />
                    </div>
                    <span className="text-[9px] font-mono text-text-primary font-bold">00:14 / 00:58</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon animate-ping" />
                    <span className="text-[9px] font-bold text-neon">VIRAL 98%</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Floating Subtitle Transcript Card (Directly inspired by the transcript card in reference) */}
            <div className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 z-30 w-64 sm:w-76 rounded-2xl bg-[#0F1122]/95 backdrop-blur-xl border border-border p-4 shadow-2xl shadow-black/80 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-text-muted border-b border-border/80 pb-2">
                <div className="flex items-center gap-1.5 text-rose-400">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>REC 00:34:12</span>
                </div>
                <span className="text-electric-light">VIRAL HOOK / 01</span>
              </div>

              {/* Bold Subtitle Phrase with Neon Yellow Highlight Block */}
              <div className="font-display font-black text-xs sm:text-sm leading-snug text-white">
                <span className="px-1.5 py-0.5 rounded bg-electric text-white text-[10px] font-bold uppercase mr-1.5">
                  AI HOOK
                </span>
                OKAY, WE SHIP THE <span className="bg-neon text-black px-1 rounded font-black">VIRAL SHORT</span> BY FRIDAY.
              </div>

              {/* Action Checklist Items (Inspired by checklist in reference) */}
              <div className="space-y-1.5 pt-2 border-t border-border/70 text-[11px] font-bold">
                <div className="flex items-center justify-between bg-card/70 px-2.5 py-1.5 rounded-lg border border-border/50 text-white">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                    <span>SMART FACE TRACKING</span>
                  </span>
                  <span className="text-[9px] text-text-muted uppercase">AUTO</span>
                </div>

                <div className="flex items-center justify-between bg-card/70 px-2.5 py-1.5 rounded-lg border border-border/50 text-white">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                    <span>DYNAMIC CAPTIONS</span>
                  </span>
                  <span className="text-[9px] text-neon uppercase font-black">SYNCED</span>
                </div>

                <div className="flex items-center justify-between bg-card/70 px-2.5 py-1.5 rounded-lg border border-border/50 text-white">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                    <span>ONE-CLICK MP4 EXPORT</span>
                  </span>
                  <span className="text-[9px] text-text-muted uppercase">60FPS</span>
                </div>
              </div>
            </div>

            {/* Bottom Audio Waveform Equalizer (Homage to the waveform in reference) */}
            <div className="absolute -bottom-8 right-6 z-10 hidden sm:flex items-end gap-1 h-12 px-3 py-2 bg-[#090A12]/80 backdrop-blur-md rounded-xl border border-border">
              {[30, 60, 95, 45, 80, 100, 70, 40, 85, 90, 50, 75, 95, 40, 65, 85].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-electric rounded-full animate-equalizer"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.1).toFixed(1)}s`
                  }}
                />
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
