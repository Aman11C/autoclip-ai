'use client';

import React from 'react';
import { X, Download, Archive, Youtube, Instagram, Music2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Project, Clip } from '../types';

interface ExportModalProps {
  project: Project | null;
  clips: Clip[];
  onClose: () => void;
  onDownloadSingle: (clip: Clip) => void;
}

export default function ExportModal({ project, clips, onClose, onDownloadSingle }: ExportModalProps) {
  const readyClips = clips.filter(c => c.variants && c.variants.some(v => v.render_status === 'completed'));

  const handleBulkZipDownload = () => {
    if (!project) return;
    window.location.href = `/api/projects/${project.id}/export-all`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl glass-panel p-6 md:p-8 rounded-3xl border border-primary-500/30 shadow-2xl shadow-primary-950/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderSubtle mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">Multi-Platform Export Center</h3>
            <p className="text-xs text-slate-400">1080x1920 (9:16) H.264 MP4 with AAC 192kbps audio</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-surfaceElevated transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Compliance Checklist */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-surfaceElevated/60 border border-slate-800 text-center">
            <Youtube className="w-5 h-5 text-red-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">YouTube Shorts</span>
            <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% Compliant
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surfaceElevated/60 border border-slate-800 text-center">
            <Instagram className="w-5 h-5 text-pink-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">Instagram Reels</span>
            <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% Compliant
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surfaceElevated/60 border border-slate-800 text-center">
            <Music2 className="w-5 h-5 text-accent-cyan mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">TikTok Ready</span>
            <span className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> 100% Compliant
            </span>
          </div>
        </div>

        {/* Bulk Export Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-950/60 to-accent-purple/20 border border-primary-500/40 flex items-center justify-between mb-6">
          <div>
            <span className="text-sm font-bold text-white block">Download All Clips as ZIP</span>
            <span className="text-xs text-slate-400">
              Includes {readyClips.length} rendered 9:16 short videos with descriptive filenames.
            </span>
          </div>
          <button
            onClick={handleBulkZipDownload}
            disabled={readyClips.length === 0}
            className="py-2.5 px-4 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-2 shadow-lg shadow-primary-900/40 disabled:opacity-50"
          >
            <Archive className="w-4 h-4" />
            <span>Download ZIP</span>
          </button>
        </div>

        {/* Individual Clips List */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
            Individual MP4 Downloads ({readyClips.length})
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {clips.map((clip) => {
              const isReady = clip.variants && clip.variants.some(v => v.render_status === 'completed');
              return (
                <div
                  key={clip.id}
                  className="p-3 rounded-xl bg-surfaceElevated/50 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-xs font-bold text-white block truncate">{clip.title}</span>
                    <span className="text-[11px] text-slate-400">
                      Duration: {clip.duration.toFixed(1)}s • Score: {clip.virality_score} • {clip.category}
                    </span>
                  </div>
                  <button
                    onClick={() => onDownloadSingle(clip)}
                    disabled={!isReady}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-surfaceElevated hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-40 transition-all shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Download</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-borderSubtle flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
            Standard H.264 / AAC High Profile
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
