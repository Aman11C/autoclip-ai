'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Flame, Zap } from 'lucide-react';

interface TemplatesSectionProps {
  onSelectTemplate?: (templateId: string) => void;
}

export default function TemplatesSection({ onSelectTemplate }: TemplatesSectionProps) {
  const templates = [
    {
      id: 'cliphi_hook',
      title: 'ClipHi Dynamic Hook',
      category: 'Top TikTok / Reels Format',
      retentionTag: '🔥 88% Retention',
      desc: 'Clean 9:16 vertical video with active face tracking, top hook header pill banner, neon active-word highlights, and dynamic emojis.',
      features: ['Smart 9:16 face tracking', 'Smart auto-emojis (🔥, 🤯, 💰)', 'Top hook pill banner (0-4.5s)', 'Loudness normalization'],
      badgeColor: 'border-neon/40 bg-neon/10 text-neon',
      accentColor: 'border-neon',
    },
    {
      id: 'hormozi_pop',
      title: 'Hormozi Bold Gold Pop',
      category: 'Shorts & Reels Standard',
      retentionTag: '⚡ 1-2 Words/Beat',
      desc: 'Rapid-fire bold typography with animated yellow pops, thick dark borders, and instant audio punch. Proven to maximize average watch time.',
      features: ['1-2 word rapid transitions', 'Rich yellow glow pop', 'Subtle camera punch-in', 'Dialogue normalization'],
      badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
      accentColor: 'border-amber-400',
    },
    {
      id: 'executive_speaker',
      title: 'Executive Speaker Pro',
      category: 'Interviews & Podcasts',
      retentionTag: '🎙️ Speaker Focus',
      desc: 'Full-screen 9:16 vertical speaker tracking with smooth reframing and clean minimalist subtitles for an authoritative appearance.',
      features: ['Centered speaker framing', 'Minimalist clean captions', 'Smooth audio crossfades', 'Professional color profile'],
      badgeColor: 'border-electric/40 bg-electric/15 text-electric-light',
      accentColor: 'border-electric',
    },
    {
      id: 'kinetic_glow',
      title: 'Kinetic Text Retention',
      category: 'Retention Maximizer',
      retentionTag: '✨ Kinetic Glow',
      desc: 'Full-screen subject tracking paired with large high-contrast typography and subtle dark vignette to keep viewer eyes glued to text.',
      features: ['Smart face framing', 'Glow word highlight', 'Atmospheric subtle vignette', 'Seamless loopable transition'],
      badgeColor: 'border-neon/40 bg-neon/10 text-neon',
      accentColor: 'border-neon',
    },
    {
      id: 'gaming_reactions',
      title: 'Gaming & Stream Reactions',
      category: 'Twitch / Kick VODs',
      retentionTag: '🎮 Dynamic Action',
      desc: 'Full-screen motion reframing with electric neon subtitles, punchy color balance, and suspenseful vignette shading.',
      features: ['Active subject reframing', 'Electric magenta/pink text', 'High impact sound profile', 'Dynamic camera pacing'],
      badgeColor: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
      accentColor: 'border-rose-400',
    },
    {
      id: 'documentary_grade',
      title: 'Documentary Film Blur',
      category: 'Storytelling & Essays',
      retentionTag: '🎬 Filmic Grade',
      desc: 'Rich warm contrast grade, blurred backdrop with centered 16:9 foreground, elegant minimal subtitles, and cinematic smooth crossfades.',
      features: ['Warm filmic color curve', 'Gentle fade-in/fade-out', 'Minimal Pro subtitles', 'Deep dark tones'],
      badgeColor: 'border-border bg-surface text-text-muted',
      accentColor: 'border-border',
    }
  ];

  return (
    <section id="templates" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-text-muted uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-neon" />
          <span>Proven Formatting Presets</span>
        </div>
        <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
          CREATOR-GRADE <span className="text-neon">EDITING STYLES</span>
        </h2>
        <p className="text-sm sm:text-base text-text-muted">
          Pre-configured subtitle styles, typography animations, and color grades tuned for maximum virality across TikTok, YouTube Shorts, and Instagram Reels.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="group rounded-3xl bg-card border border-border p-6 flex flex-col justify-between hover:border-electric transition-all duration-300 hover:shadow-xl hover:shadow-electric/15 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                  {tmpl.category}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tmpl.badgeColor}`}>
                  {tmpl.retentionTag}
                </span>
              </div>

              <h3 className="font-display font-black text-lg text-white mb-2 uppercase tracking-tight">
                {tmpl.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mb-5 font-normal">
                {tmpl.desc}
              </p>

              <div className="space-y-2 pt-3 border-t border-border/80 mb-6">
                {tmpl.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-[11px] text-text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectTemplate && onSelectTemplate(tmpl.id)}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-surface hover:bg-electric text-white border border-border hover:border-electric flex items-center justify-center gap-2 transition-all group-hover:shadow-lg"
            >
              <span>Use This Preset</span>
              <ArrowRight className="w-3.5 h-3.5 text-neon group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
