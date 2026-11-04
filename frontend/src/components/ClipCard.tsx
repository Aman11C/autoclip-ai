'use client';

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Sliders, 
  Clock, 
  Flame, 
  Check, 
  Copy, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Clip } from '../types';

interface ClipCardProps {
  clip: Clip;
  onOpenEditor: (clip: Clip) => void;
  onDownload: (clip: Clip) => void;
  onDelete?: (clipId: string) => void;
}

export default function ClipCard({ clip, onOpenEditor, onDownload, onDelete }: ClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedYt, setCopiedYt] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCopyYouTube = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = clip.youtube_title || `🔥 ${clip.title} 🤯 #shorts`;
    const desc = clip.youtube_description || `${clip.title}\n\n👉 Subscribe for daily viral moments!\n\n#shorts #viral #trending #fyp`;
    const text = `TITLE:\n${title}\n\nDESCRIPTION:\n${desc}\n\nTAGS:\n${clip.youtube_tags || 'shorts, viral, trending'}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedYt(true);
      setTimeout(() => setCopiedYt(false), 2200);
    }
  };

  // Determine preview URL
  const activeVariant = clip.variants && clip.variants.length > 0
    ? clip.variants[0]
    : null;

  const videoSrc = clip.preview_url || activeVariant?.output_url || '/static/demo/clip_demo_01_VIRAL_PODCAST.mp4';
  const editingStyle = activeVariant?.editing_style || 'VIRAL_PODCAST';

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      className="group relative rounded-3xl bg-card border border-border hover:border-electric overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-electric/20 cursor-pointer"
      onClick={() => onOpenEditor(clip)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 9:16 Vertical Preview Container */}
      <div className="relative aspect-[9/16] w-full bg-[#0A0C16] overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Video Overlaid Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C16] via-transparent to-black/40 pointer-events-none" />

        {/* Top Badges: Virality Score & Duration */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Neon Yellow Virality Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-neon text-black font-display font-black text-xs shadow-lg">
            <Flame className="w-3.5 h-3.5 fill-black" />
            <span>{clip.virality_score}% VIRAL</span>
          </div>

          {/* Duration Badge */}
          <div className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-border text-[11px] font-mono font-bold text-white flex items-center gap-1">
            <Clock className="w-3 h-3 text-neon" />
            <span>{Math.round(clip.duration)}s</span>
          </div>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={togglePlay}
            className={`w-12 h-12 rounded-full bg-electric/90 text-white flex items-center justify-center shadow-xl transition-all duration-300 pointer-events-auto ${
              isPlaying ? 'opacity-0 group-hover:opacity-100 scale-90' : 'opacity-100 scale-100'
            }`}
            aria-label="Play Clip"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Preview Overlay (Category + Editing Style) */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface/90 text-text-muted border border-border">
            {clip.category || 'Viral Hook'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-electric/80 text-white">
            {editingStyle.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Card Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-display font-extrabold text-sm text-white line-clamp-2 leading-snug group-hover:text-neon transition-colors">
            {clip.title}
          </h3>
          <p className="text-[11px] text-text-muted line-clamp-1 mt-1 font-normal">
            {clip.reason || 'High emotional hook with abrupt retention turn'}
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {/* Open in Editor Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditor(clip);
            }}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-surface hover:bg-[#1F233A] text-white border border-border hover:border-electric flex items-center justify-center gap-1.5 transition-all"
            title="Edit timing, hook pill, and subtitles"
          >
            <Sliders className="w-3.5 h-3.5 text-electric-light" />
            <span>Edit</span>
          </button>

          {/* Copy YouTube Metadata Button */}
          <button
            onClick={handleCopyYouTube}
            className="p-2 rounded-xl text-text-muted hover:text-white bg-surface hover:bg-[#1F233A] border border-border hover:border-neon transition-all"
            title="Copy Title, Description & Tags for YouTube Shorts"
          >
            {copiedYt ? (
              <Check className="w-4 h-4 text-neon" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Download Button in Electric Blue */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(clip);
            }}
            className="py-2 px-3 rounded-xl text-xs font-extrabold bg-electric hover:bg-electric-hover text-white shadow-md shadow-electric/30 flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            title="Download 1080x1920 MP4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
