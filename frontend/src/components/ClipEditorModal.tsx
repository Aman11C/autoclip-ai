'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Palette, 
  Crop, 
  Volume2, 
  Type, 
  Check, 
  Clock,
  Layers,
  Flame,
  Wand2,
  Sliders
} from 'lucide-react';
import { Clip } from '../types';

interface ClipEditorModalProps {
  clip: Clip;
  onClose: () => void;
  onSaveAndRerender: (updatedClip: {
    clipId: string;
    startTime: number;
    endTime: number;
    editingStyle: string;
    cropMode: string;
    subtitlePreset: string;
    hookTitle?: string;
    autoEmojis?: boolean;
  }) => Promise<any>;
  onDownload: (clip: Clip) => void;
}

const EDITING_STYLES = [
  { id: 'VIRAL_PODCAST', label: 'Viral Podcast', desc: 'Speaker focus, bold animated subtitles, smooth zoom-in' },
  { id: 'HIGH_ENERGY', label: 'High Energy', desc: 'Punchy cuts, electric neon captions, fast-paced retention' },
  { id: 'CINEMATIC', label: 'Cinematic', desc: 'Subtle contrast grade, blurred background pillarbox, minimal pro subtitles' },
  { id: 'CAPTION_FOCUSED', label: 'Caption Focused', desc: 'High typography contrast, glowing active-word pops' },
  { id: 'GAMING_STORYTELLING', label: 'Gaming / Story', desc: 'Dramatic vignette, reaction framing, suspenseful pacing' },
];

const SUBTITLE_PRESETS = [
  { id: 'bold_viral', label: 'Bold Viral', color: '#FACC15', font: 'Arial Black' },
  { id: 'neon_highlight', label: 'Neon Highlight', color: '#39FF14', font: 'Impact' },
  { id: 'minimal_pro', label: 'Minimal Pro', color: '#38BDF8', font: 'Segoe UI' },
  { id: 'gaming_captions', label: 'Gaming Captions', color: '#FF00E5', font: 'Arial Black' },
];

export default function ClipEditorModal({ clip, onClose, onSaveAndRerender, onDownload }: ClipEditorModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(clip.start_time);
  const [endTime, setEndTime] = useState(clip.end_time);
  const latestVariant = clip.variants && clip.variants.length > 0 ? clip.variants[0] : null;
  const [editingStyle, setEditingStyle] = useState<string>(latestVariant?.editing_style || 'VIRAL_PODCAST');
  const [cropMode, setCropMode] = useState<string>(
    latestVariant?.crop_mode === 'blurred_bg' ? 'blurred_bg' : 'smart_fullscreen'
  );
  const [subtitlePreset, setSubtitlePreset] = useState<string>(latestVariant?.subtitle_preset || 'bold_viral');
  const [hookTitle, setHookTitle] = useState<string>(clip.hook_title || clip.title || '');
  const [autoEmojis, setAutoEmojis] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const initialVideoUrl = clip.preview_url || latestVariant?.output_url || '/static/demo/clip_demo_01_VIRAL_PODCAST.mp4';
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(initialVideoUrl);

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleApplyRerender = async () => {
    setIsRendering(true);
    setRenderSuccess(false);
    setRenderError(null);
    try {
      const data: any = await onSaveAndRerender({
        clipId: clip.id,
        startTime,
        endTime,
        editingStyle,
        cropMode,
        subtitlePreset,
        hookTitle,
        autoEmojis
      });

      const newUrl = data?.preview_url ? `${data.preview_url}?t=${Date.now()}` : null;
      if (newUrl) {
        setCurrentVideoUrl(newUrl);
        if (videoRef.current) {
          videoRef.current.src = newUrl;
          videoRef.current.load();
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      }

      setRenderSuccess(true);
      setTimeout(() => setRenderSuccess(false), 4000);
    } catch (err: any) {
      console.error('Rerender failed:', err);
      setRenderError(err.message || 'Failed to re-render clip');
    } finally {
      setIsRendering(false);
    }
  };

  const duration = Math.max(1, endTime - startTime);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-primary-500/30 shadow-2xl shadow-primary-950/80 flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
        
        {/* Left Column: 9:16 Video Player Workspace */}
        <div className="w-full md:w-[420px] bg-slate-950 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-borderSubtle shrink-0">
          <div className="relative aspect-[9/16] h-[460px] md:h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-black border border-slate-800 bg-black">
            <video
              ref={videoRef}
              src={currentVideoUrl}
              loop
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlay}
            />

            {/* In-Video Active Subtitle Simulator Overlay */}
            <div className="absolute bottom-16 inset-x-4 text-center pointer-events-none">
              <span className="inline-block px-3 py-1 bg-black/75 rounded-lg text-white font-black text-sm uppercase tracking-wide border border-black/40 shadow-xl">
                <span>VIRAL RETENTION </span>
                <span style={{ color: SUBTITLE_PRESETS.find(p => p.id === subtitlePreset)?.color || '#FACC15' }}>
                  SECRET
                </span>
              </span>
            </div>

            {/* Center Play Button Overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          {/* Quick playback info */}
          <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-slate-400 font-mono">
            <span>{startTime.toFixed(1)}s</span>
            <span className="text-accent-cyan font-bold">Duration: {duration.toFixed(1)}s</span>
            <span>{endTime.toFixed(1)}s</span>
          </div>
        </div>

        {/* Right Column: Editing Controls & Presets */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-borderSubtle mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                    {clip.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-accent-emerald">
                    <Flame className="w-3.5 h-3.5" /> {clip.virality_score}/100
                  </div>
                </div>
                <h2 className="text-xl font-extrabold text-white">{clip.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surfaceElevated transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline Controls */}
            <div className="space-y-4 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary-400" />
                Clip Boundaries & Timing
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-surfaceElevated/70 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Start Timestamp (sec)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={startTime}
                    onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-surfaceElevated/70 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">End Timestamp (sec)</span>
                  <input
                    type="number"
                    step="0.5"
                    value={endTime}
                    onChange={(e) => setEndTime(parseFloat(e.target.value) || startTime + 15)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* 9:16 Vertical Framing Modes */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Crop className="w-3.5 h-3.5 text-accent-cyan" />
                  Framing & Layout Style
                </span>
                <span className="text-[10px] text-accent-cyan font-mono uppercase bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/30">
                  9:16 Vertical
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCropMode('smart_fullscreen')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    cropMode === 'smart_fullscreen'
                      ? 'bg-primary-950/40 border-primary-500 text-white shadow-md'
                      : 'bg-surfaceElevated/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-white mb-1">👤 Smart Face Tracking</span>
                  <span className="text-[11px] text-slate-400">Clean 9:16 full-screen tracking speaker face with smooth pans.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCropMode('blurred_bg')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    cropMode === 'blurred_bg'
                      ? 'bg-primary-950/40 border-primary-500 text-white shadow-md'
                      : 'bg-surfaceElevated/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block text-white mb-1">🖼️ Blurred Background</span>
                  <span className="text-[11px] text-slate-400">Centered original video with smooth 25px Gaussian blur backdrop.</span>
                </button>
              </div>
            </div>

            {/* Viblo Hook Header Banner & Smart Emojis */}
            <div className="p-3.5 rounded-2xl bg-surfaceElevated/50 border border-slate-800 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-accent-amber" />
                  Viblo Hook Header Pill (0s - 4.5s)
                </label>
                <button
                  type="button"
                  onClick={() => setAutoEmojis(!autoEmojis)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    autoEmojis
                      ? 'bg-accent-emerald/20 border-accent-emerald/50 text-accent-emerald'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Smart Emojis {autoEmojis ? 'ON 💰' : 'OFF'}</span>
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="e.g. WAIT FOR THE END 😱 or HOW TO WIN $100K 💰"
                  value={hookTitle}
                  onChange={(e) => setHookTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-primary-500 font-semibold"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Renders a high-contrast attention hook banner at the top of the video during the critical first 4.5 seconds.
                </span>
              </div>
            </div>

            {/* Subtitle Presets */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Type className="w-3.5 h-3.5 text-accent-purple" />
                Dynamic Subtitle Presets (Word-level Animated)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUBTITLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSubtitlePreset(p.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      subtitlePreset === p.id
                        ? 'bg-surfaceElevated border-primary-400 text-white shadow-inner'
                        : 'bg-surfaceElevated/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full mx-auto mb-1.5 block"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-xs font-bold block text-white truncate">{p.label}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{p.font}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editing Style Selector */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-accent-amber" />
                Editing Style Variation
              </label>
              <div className="space-y-2">
                {EDITING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setEditingStyle(style.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      editingStyle === style.id
                        ? 'bg-primary-950/30 border-primary-500/60 text-white'
                        : 'bg-surfaceElevated/30 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{style.label}</span>
                      <span className="text-[11px] text-slate-400 block">{style.desc}</span>
                    </div>
                    {editingStyle === style.id && (
                      <Check className="w-4 h-4 text-primary-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-borderSubtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs">
              {renderError ? (
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {renderError}
                </span>
              ) : renderSuccess ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Clip re-rendered with new style & updated!
                </span>
              ) : (
                <span className="text-slate-400">Re-renders this clip into 9:16 vertical format.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onDownload(clip)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-surfaceElevated hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </button>

              <button
                type="button"
                onClick={handleApplyRerender}
                disabled={isRendering}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-600 to-accent-purple hover:from-primary-500 hover:to-accent-purple text-white flex items-center gap-2 transition-all shadow-lg shadow-primary-900/40 disabled:opacity-50"
              >
                {isRendering ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rendering 9:16 MP4...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Apply & Re-render</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
