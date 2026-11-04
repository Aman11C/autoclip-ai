'use client';

import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Sparkles, 
  Clipboard, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Crop,
  Target
} from 'lucide-react';

interface UrlInputSectionProps {
  onGenerate: (url: string, options?: { clipLength?: string; topicPrompt?: string; aspectRatio?: string }) => void;
  isSubmitting: boolean;
}

export default function UrlInputSection({ onGenerate, isSubmitting }: UrlInputSectionProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detectedVideoId, setDetectedVideoId] = useState<string | null>(null);
  
  // Advanced generation controls
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clipLength, setClipLength] = useState<'auto' | 'short' | 'medium' | 'long'>('auto');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '1:1' | '16:9'>('9:16');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [activePresetTopic, setActivePresetTopic] = useState<string | null>(null);

  const topicPresets = [
    { label: '🔥 Best Hooks', prompt: 'Find the most unexpected statement or explosive opening hook' },
    { label: '😂 Funny / Reactions', prompt: 'Find hilarious moments, laughing, and candid reactions' },
    { label: '💡 Mind-Blowing Insights', prompt: 'Focus on game-changing advice, secrets, and high-value knowledge' },
    { label: '⚡ High Energy', prompt: 'Pick loud arguments, hype delivery, and intense moments' },
    { label: '🏆 Climax & Story', prompt: 'Extract complete storytelling arcs with a setup, buildup, and payoff' },
  ];

  // Parse YouTube video ID for instant dynamic thumbnail preview
  useEffect(() => {
    if (!url.trim()) {
      setDetectedVideoId(null);
      setError(null);
      return;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      setDetectedVideoId(match[2]);
      setError(null);
    } else if (url.includes('youtube.com/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        const id = parts[1].split('?')[0].split('&')[0];
        setDetectedVideoId(id);
        setError(null);
      }
    } else if (url.length > 10) {
      setDetectedVideoId(null);
      setError('Please enter a valid video link (YouTube, Twitch, or Podcast)');
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.warn('Clipboard read denied:', err);
    }
  };

  const handlePresetClick = (preset: { label: string; prompt: string }) => {
    if (activePresetTopic === preset.label) {
      setActivePresetTopic(null);
      setTopicPrompt('');
    } else {
      setActivePresetTopic(preset.label);
      setTopicPrompt(preset.prompt);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a YouTube or video URL.');
      return;
    }
    if (error) return;
    onGenerate(url.trim(), { clipLength, topicPrompt, aspectRatio });
  };

  return (
    <div className="relative rounded-[32px] bg-[#111321] border border-border p-6 sm:p-10 shadow-2xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-electric/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-neon/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Workspace Headline */}
      <div className="max-w-2xl mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-[11px] font-bold text-text-muted uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-neon" />
          <span>Autonomous AI Video Pipeline</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-none">
          YOUR NEXT VIRAL <br />
          <span className="text-neon">VIDEO STARTS HERE.</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-muted font-normal pt-1">
          Paste any YouTube URL below. Our AI finds the high-retention moments, applies active face-tracking, and renders 60FPS vertical shorts.
        </p>
      </div>

      {/* Input Form with Glowing Electric Blue Border */}
      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="relative group">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#171A2B] rounded-2xl border-2 border-electric focus-within:border-electric-light focus-within:shadow-[0_0_35px_rgba(52,59,255,0.45)] transition-all p-2 sm:p-2.5 gap-2">
            
            {/* YouTube Icon */}
            <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border shrink-0 ml-1">
              <Youtube className="w-5 h-5 text-rose-500" />
            </div>

            {/* URL Input */}
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video or Shorts link (e.g. https://www.youtube.com/watch?v=...)"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-text-muted/60 focus:outline-none min-w-0"
              disabled={isSubmitting}
            />

            {/* Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-white bg-card hover:bg-surface border border-border transition-colors flex items-center justify-center gap-1.5 shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>

            {/* Primary Generate Clips Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white flex items-center justify-center gap-2 shadow-lg shadow-electric/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <span>GENERATE CLIPS</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3.5 py-2 rounded-xl animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Detected YouTube Video Preview Card */}
        {detectedVideoId && (
          <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-4 animate-in fade-in slide-in-from-top-1">
            <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black relative shrink-0 border border-border">
              <img
                src={`https://img.youtube.com/vi/${detectedVideoId}/mqdefault.jpg`}
                alt="Detected Video"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white drop-shadow-md" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  YouTube Video Verified & Ready
                </span>
              </div>
              <p className="text-[11px] font-mono text-text-muted mt-0.5">
                ID: {detectedVideoId} • 1080p Stream Ready for AI Ingestion
              </p>
            </div>
          </div>
        )}

        {/* Quick Topic Chips & Advanced Options Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Preset Topics */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 flex items-center gap-1 font-mono">
              <Target className="w-3.5 h-3.5 text-neon" /> Focus:
            </span>
            {topicPresets.map((preset) => {
              const isSelected = activePresetTopic === preset.label;
              return (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-electric text-white border-electric shadow-sm font-bold'
                      : 'bg-card text-text-muted hover:text-white border-border hover:border-electric/50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Toggle Advanced Controls */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-text-muted hover:text-white flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-electric-light" />
            <span>{showAdvanced ? 'Hide Advanced Options' : 'Advanced Settings'}</span>
          </button>
        </div>

        {/* Advanced Options Tray */}
        {showAdvanced && (
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Clip Duration */}
              <div>
                <label className="text-xs font-bold text-white block mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neon" />
                  Target Clip Length
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'auto', label: 'Auto (Best)' },
                    { id: 'short', label: '< 30s' },
                    { id: 'medium', label: '30-60s' },
                    { id: 'long', label: '60-90s' },
                  ].map((len) => (
                    <button
                      type="button"
                      key={len.id}
                      onClick={() => setClipLength(len.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                        clipLength === len.id
                          ? 'bg-electric text-white border-electric'
                          : 'bg-surface text-text-muted hover:text-white border-border'
                      }`}
                    >
                      {len.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-xs font-bold text-white block mb-1.5 flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5 text-electric-light" />
                  Aspect Ratio Framing
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '9:16', label: '9:16 Vertical (Shorts/Reels)' },
                    { id: '1:1', label: '1:1 Square' },
                    { id: '16:9', label: '16:9 Landscape' },
                  ].map((ar) => (
                    <button
                      type="button"
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id as any)}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                        aspectRatio === ar.id
                          ? 'bg-electric text-white border-electric'
                          : 'bg-surface text-text-muted hover:text-white border-border'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom AI Prompt */}
            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Custom Topic / Prompt Instruction (Optional)
              </label>
              <input
                type="text"
                value={topicPrompt}
                onChange={(e) => setTopicPrompt(e.target.value)}
                placeholder="e.g. Focus on the host's story about building his first company from zero"
                className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-text-muted/60 focus:outline-none focus:border-electric"
              />
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
