'use client';

import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Sliders, 
  Trash2, 
  Sparkles, 
  Clock, 
  Flame, 
  Maximize2,
  RefreshCw,
  Tag
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

  // Virality score badge colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-emerald-500 to-teal-400 border-emerald-400/40 text-emerald-300';
    if (score >= 80) return 'from-purple-500 to-indigo-400 border-purple-400/40 text-purple-300';
    return 'from-blue-500 to-cyan-400 border-blue-400/40 text-blue-300';
  };

  // Determine which preview URL to show (newest variant or updated clip preview)
  const activeVariant = clip.variants && clip.variants.length > 0
    ? clip.variants[0]
    : null;

  const videoSrc = clip.preview_url || activeVariant?.output_url || '/static/demo/clip_demo_01_VIRAL_PODCAST.mp4';
  const editingStyle = activeVariant?.editing_style || 'VIRAL_PODCAST';

  return (
    <div 
      className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer"
      onClick={() => onOpenEditor(clip)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 9:16 Vertical Preview Container */}
      <div className="relative aspect-[9/16] w-full bg-slate-950 overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
          {/* Virality Score Badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r ${getScoreColor(clip.virality_score)} bg-black/60 backdrop-blur-md border flex items-center gap-1 shadow-lg`}>
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{clip.virality_score}</span>
            <span className="text-[10px] opacity-75 font-normal">/100</span>
          </div>

          {/* Duration Badge */}
          <div className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-accent-cyan" />
            <span>{clip.duration.toFixed(1)}s</span>
          </div>
        </div>

        {/* Play / Pause Toggle Button Overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110 active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Bottom Video Info Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end justify-between z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-purple px-1.5 py-0.5 rounded bg-accent-purple/20 border border-accent-purple/30">
              {editingStyle.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-300">
            {clip.start_time.toFixed(1)}s - {clip.end_time.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-surfaceElevated/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Tag className="w-3 h-3 text-primary-400" />
            <span className="font-semibold text-slate-300">{clip.category}</span>
          </div>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-primary-300 transition-colors">
            {clip.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5">
            {clip.reason}
          </p>
        </div>

        {/* Card Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5">
          {/* Quick Edit Workspace Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditor(clip);
            }}
            className="flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold bg-surfaceElevated hover:bg-slate-700/80 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-accent-purple" />
            <span>Customize</span>
          </button>

          {/* Direct Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(clip);
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-primary-600 hover:bg-primary-500 text-white flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-900/30"
            title="Download ready MP4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>MP4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
