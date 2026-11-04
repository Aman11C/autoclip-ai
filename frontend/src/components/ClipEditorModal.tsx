'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  Palette, 
  Crop, 
  Type, 
  Check, 
  Clock, 
  Flame, 
  Wand2, 
  Sliders, 
  Youtube, 
  Copy, 
  Save, 
  RefreshCw, 
  Hash, 
  FileText 
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
  { id: 'bold_viral', label: 'Neon Yellow', color: '#E8FF36', font: 'Space Grotesk' },
  { id: 'neon_highlight', label: 'Electric Blue', color: '#343BFF', font: 'Inter' },
  { id: 'minimal_pro', label: 'Clean White', color: '#F7F7FA', font: 'Inter' },
  { id: 'gaming_captions', label: 'Cyber Pink', color: '#FF00E5', font: 'Impact' },
];

export default function ClipEditorModal({ clip, onClose, onSaveAndRerender, onDownload }: ClipEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'style' | 'youtube'>('style');
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

  // YouTube Shorts Publishing State
  const [ytTitle, setYtTitle] = useState<string>(
    clip.youtube_title || `🔥 ${clip.title} 🤯 #shorts`
  );
  const [ytDescription, setYtDescription] = useState<string>(
    clip.youtube_description ||
    `Wait until you see how this plays out... 🤯\n\n📌 Topic: ${clip.title}\n\n👉 Subscribe for daily viral moments!\n\n#shorts #viral #trending #fyp #youtubeshorts`
  );
  const [ytTags, setYtTags] = useState<string>(
    clip.youtube_tags || 'shorts, youtube shorts, viral shorts, trending, fyp, podcast clips'
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRegeneratingMeta, setIsRegeneratingMeta] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [metaSaveSuccess, setMetaSaveSuccess] = useState(false);

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

  const copyToClipboard = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleCopyFullKit = () => {
    const fullBundle = `TITLE:\n${ytTitle}\n\nDESCRIPTION:\n${ytDescription}\n\nTAGS:\n${ytTags}`;
    copyToClipboard(fullBundle, 'all');
  };

  const handleRegenerateMetadata = async () => {
    setIsRegeneratingMeta(true);
    try {
      const res = await fetch(`/api/clips/${clip.id}/metadata/generate`, {
        method: 'POST'
      });
      if (res.ok) {
        const meta = await res.json();
        if (meta.youtube_title) setYtTitle(meta.youtube_title);
        if (meta.youtube_description) setYtDescription(meta.youtube_description);
        if (meta.youtube_tags) setYtTags(meta.youtube_tags);
      }
    } catch (err) {
      console.error('Failed to regenerate metadata:', err);
    } finally {
      setIsRegeneratingMeta(false);
    }
  };

  const handleSaveMetadata = async () => {
    setIsSavingMeta(true);
    setMetaSaveSuccess(false);
    try {
      const res = await fetch(`/api/clips/${clip.id}/metadata`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_title: ytTitle,
          youtube_description: ytDescription,
          youtube_tags: ytTags
        })
      });
      if (res.ok) {
        setMetaSaveSuccess(true);
        setTimeout(() => setMetaSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save metadata:', err);
    } finally {
      setIsSavingMeta(false);
    }
  };

  const duration = Math.max(0, endTime - startTime);
  const titleCharCount = ytTitle.length;
  const isTitleOverLimit = titleCharCount > 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#111321] rounded-3xl border border-border shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
        
        {/* Left Column: 9:16 Video Player Workspace */}
        <div className="w-full md:w-[400px] bg-[#0A0C16] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border shrink-0">
          <div className="relative aspect-[9/16] h-[440px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border bg-black">
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
              <span className="inline-block px-3 py-1 bg-black/80 backdrop-blur-md rounded-xl text-white font-display font-black text-xs uppercase tracking-wide border border-border shadow-xl">
                <span>VIRAL RETENTION </span>
                <span style={{ color: SUBTITLE_PRESETS.find(p => p.id === subtitlePreset)?.color || '#E8FF36' }}>
                  SECRET
                </span>
              </span>
            </div>

            {/* Center Play Button Overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-electric/80 backdrop-blur-md text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-xl"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Quick playback info */}
          <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-text-muted font-mono">
            <span>{startTime.toFixed(1)}s</span>
            <span className="text-neon font-bold">Duration: {duration.toFixed(1)}s</span>
            <span>{endTime.toFixed(1)}s</span>
          </div>
        </div>

        {/* Right Column: Editing Controls & Presets / YouTube Kit */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#111321]">
          <div>
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-card text-text-muted border border-border">
                    {clip.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-black text-neon">
                    <Flame className="w-3.5 h-3.5 fill-neon" /> {clip.virality_score}% VIRAL
                  </div>
                </div>
                <h2 className="font-display font-extrabold text-lg text-white truncate max-w-md">{clip.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-card transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-5 p-1 bg-card rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'style'
                    ? 'bg-electric text-white shadow-md font-extrabold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Video Style & Subtitles</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'youtube'
                    ? 'bg-rose-600 text-white shadow-md font-extrabold'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                <Youtube className="w-4 h-4 text-white" />
                <span>YouTube Shorts Kit</span>
              </button>
            </div>

            {/* TAB 1: STYLE & TIMING */}
            {activeTab === 'style' && (
              <div className="space-y-5">
                {/* Timeline Controls */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-neon" />
                    Clip Timing & Boundaries
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-card border border-border">
                      <span className="text-[11px] text-text-muted block mb-1">Start Timestamp (sec)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={startTime}
                        onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0A0C16] border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-electric"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border">
                      <span className="text-[11px] text-text-muted block mb-1">End Timestamp (sec)</span>
                      <input
                        type="number"
                        step="0.5"
                        value={endTime}
                        onChange={(e) => setEndTime(parseFloat(e.target.value) || startTime + 15)}
                        className="w-full bg-[#0A0C16] border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-electric"
                      />
                    </div>
                  </div>
                </div>

                {/* 9:16 Vertical Framing Modes */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between font-mono">
                    <span className="flex items-center gap-2">
                      <Crop className="w-3.5 h-3.5 text-electric-light" />
                      Framing & Layout Style
                    </span>
                    <span className="text-[10px] text-neon font-mono uppercase bg-neon/10 px-2 py-0.5 rounded border border-neon/30">
                      9:16 Vertical
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCropMode('smart_fullscreen')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        cropMode === 'smart_fullscreen'
                          ? 'bg-electric/20 border-electric text-white shadow-md'
                          : 'bg-card border-border text-text-muted hover:border-border/80'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white mb-1">👤 Smart Face Tracking</span>
                      <span className="text-[11px] text-text-muted">Clean 9:16 full-screen tracking speaker face with smooth pans.</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCropMode('blurred_bg')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        cropMode === 'blurred_bg'
                          ? 'bg-electric/20 border-electric text-white shadow-md'
                          : 'bg-card border-border text-text-muted hover:border-border/80'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white mb-1">🖼️ Blurred Background</span>
                      <span className="text-[11px] text-text-muted">Centered original video with smooth Gaussian blur backdrop.</span>
                    </button>
                  </div>
                </div>

                {/* Hook Header Pill Banner */}
                <div className="p-3.5 rounded-2xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-mono">
                      <Flame className="w-3.5 h-3.5 text-neon" />
                      Hook Header Pill (0s - 4.5s)
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoEmojis(!autoEmojis)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                        autoEmojis
                          ? 'bg-neon/15 border-neon/40 text-neon'
                          : 'bg-surface border-border text-text-muted'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Smart Emojis {autoEmojis ? 'ON 🔥' : 'OFF'}</span>
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="e.g. WAIT FOR THE END 😱 or THE 3-SECOND SECRET ⚡"
                      value={hookTitle}
                      onChange={(e) => setHookTitle(e.target.value)}
                      className="w-full bg-[#0A0C16] border border-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-electric font-semibold"
                    />
                  </div>
                </div>

                {/* Subtitle Presets */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-mono">
                    <Type className="w-3.5 h-3.5 text-neon" />
                    Dynamic Subtitle Presets
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SUBTITLE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSubtitlePreset(p.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          subtitlePreset === p.id
                            ? 'bg-electric/25 border-electric text-white'
                            : 'bg-card border-border text-text-muted hover:border-border/80'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 rounded-full mx-auto mb-1.5 block shadow-sm"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-xs font-bold block text-white truncate">{p.label}</span>
                        <span className="text-[10px] text-text-muted block font-mono">{p.font}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editing Style Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2 font-mono">
                    <Palette className="w-3.5 h-3.5 text-electric-light" />
                    Editing Style Preset
                  </label>
                  <div className="space-y-1.5">
                    {EDITING_STYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setEditingStyle(style.id)}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          editingStyle === style.id
                            ? 'bg-electric/20 border-electric text-white'
                            : 'bg-card border-border text-text-muted hover:border-border/80'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{style.label}</span>
                          <span className="text-[11px] text-text-muted block">{style.desc}</span>
                        </div>
                        {editingStyle === style.id && (
                          <Check className="w-4 h-4 text-neon shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: YOUTUBE SHORTS PUBLISHING KIT */}
            {activeTab === 'youtube' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-rose-500" />
                    <div>
                      <span className="text-xs font-bold text-white block">YouTube Shorts SEO Suite</span>
                      <span className="text-[10px] text-text-muted">1-Click Copy Ready for YouTube Studio</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerateMetadata}
                      disabled={isRegeneratingMeta}
                      className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-card border border-border text-white hover:border-electric flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-neon ${isRegeneratingMeta ? 'animate-spin' : ''}`} />
                      <span>{isRegeneratingMeta ? 'Generating...' : 'Magic Hook'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyFullKit}
                      className="py-1.5 px-3.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/60"
                    >
                      {copiedField === 'all' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied All!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Full Kit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 1. YouTube Title Section */}
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                      <span>YouTube Shorts Title</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-semibold ${isTitleOverLimit ? 'text-rose-400 font-bold' : 'text-text-muted'}`}>
                        {titleCharCount}/100 chars
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(ytTitle, 'title')}
                        className="py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-surface hover:bg-card text-white border border-border flex items-center gap-1 transition-all"
                      >
                        {copiedField === 'title' ? (
                          <>
                            <Check className="w-3 h-3 text-neon" />
                            <span className="text-neon font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-text-muted" />
                            <span>Copy Title</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    className="w-full bg-[#0A0C16] border border-border rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-rose-500"
                    placeholder="Enter clickbait YouTube Shorts title (e.g. He Bet $100K on THIS?! 😱 #shorts)"
                  />
                  {isTitleOverLimit && (
                    <span className="text-[10px] text-rose-400 block font-medium">
                      ⚠️ YouTube Shorts titles must be under 100 characters. Please shorten by {titleCharCount - 100} characters.
                    </span>
                  )}
                </div>

                {/* 2. YouTube Description Section */}
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-neon" />
                      <span>SEO Description & Hashtags</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ytDescription, 'description')}
                      className="py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-surface hover:bg-card text-white border border-border flex items-center gap-1 transition-all"
                    >
                      {copiedField === 'description' ? (
                        <>
                          <Check className="w-3 h-3 text-neon" />
                          <span className="text-neon font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-text-muted" />
                          <span>Copy Description</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={ytDescription}
                    onChange={(e) => setYtDescription(e.target.value)}
                    className="w-full bg-[#0A0C16] border border-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono leading-relaxed resize-none"
                    placeholder="SEO description including hook, chapter highlights, and viral hashtags..."
                  />
                </div>

                {/* 3. YouTube Studio Tags Section */}
                <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-neon" />
                      <span>YouTube Studio Tags</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ytTags, 'tags')}
                      className="py-1 px-2.5 rounded-lg text-[11px] font-semibold bg-surface hover:bg-card text-white border border-border flex items-center gap-1 transition-all"
                    >
                      {copiedField === 'tags' ? (
                        <>
                          <Check className="w-3 h-3 text-neon" />
                          <span className="text-neon font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-text-muted" />
                          <span>Copy Tags</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={ytTags}
                    onChange={(e) => setYtTags(e.target.value)}
                    className="w-full bg-[#0A0C16] border border-border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    placeholder="shorts, viral, trending, fyp, youtube shorts, best moments..."
                  />
                </div>

                {/* Save Metadata Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {metaSaveSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved to database!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveMetadata}
                    disabled={isSavingMeta}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-card hover:bg-surface border border-border text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-neon" />
                    <span>{isSavingMeta ? 'Saving...' : 'Save YouTube Metadata'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
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
                <span className="text-text-muted">
                  {activeTab === 'youtube'
                    ? 'Copy metadata directly into YouTube Studio when uploading your short.'
                    : 'Re-renders this clip into 9:16 vertical format.'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onDownload(clip)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-card hover:bg-surface text-white border border-border flex items-center gap-2 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP4</span>
              </button>

              <button
                type="button"
                onClick={handleApplyRerender}
                disabled={isRendering}
                className="py-2.5 px-5 rounded-xl text-xs font-black bg-electric hover:bg-electric-hover text-white flex items-center gap-2 transition-all shadow-lg shadow-electric/40 disabled:opacity-50"
              >
                {isRendering ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rendering 9:16 MP4...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-neon" />
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
