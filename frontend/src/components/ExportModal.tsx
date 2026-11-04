'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Archive, 
  Youtube, 
  Instagram, 
  Music2, 
  CheckCircle2, 
  ShieldCheck,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { Project, Clip } from '../types';

interface ExportModalProps {
  project: Project | null;
  clips: Clip[];
  onClose: () => void;
  onDownloadSingle: (clip: Clip) => void;
}

export default function ExportModal({ project, clips, onClose, onDownloadSingle }: ExportModalProps) {
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  const readyClips = clips.filter(c => c.variants && c.variants.some(v => v.render_status === 'completed'));

  const handleBulkZipDownload = () => {
    if (!project) return;
    window.location.href = `/api/projects/${project.id}/export-all`;
  };

  const handleCopyYouTubeMeta = (clip: Clip) => {
    const title = clip.youtube_title || `🔥 ${clip.title} 🤯 #shorts`;
    const desc = clip.youtube_description || `${clip.title}\n\n👉 Subscribe for daily viral moments!\n\n#shorts #viral #trending #fyp`;
    const tags = clip.youtube_tags || 'shorts, viral, trending, fyp';
    const text = `TITLE:\n${title}\n\nDESCRIPTION:\n${desc}\n\nTAGS:\n${tags}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedClipId(clip.id);
      setTimeout(() => setCopiedClipId(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#111321] p-6 md:p-8 rounded-3xl border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
          <div>
            <h3 className="font-display font-extrabold text-lg text-white">Multi-Platform Export Center</h3>
            <p className="text-xs text-text-muted">1080x1920 (9:16) H.264 MP4 with AAC 192kbps audio & instant publishing kit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-card transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Compliance Checklist */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
            <Youtube className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">YouTube Shorts</span>
            <span className="text-[10px] text-neon flex items-center justify-center gap-1 mt-0.5 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Ready & Tagged
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
            <Instagram className="w-5 h-5 text-pink-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">Instagram Reels</span>
            <span className="text-[10px] text-neon flex items-center justify-center gap-1 mt-0.5 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> 100% Compliant
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border text-center">
            <Music2 className="w-5 h-5 text-electric-light mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-white">TikTok Ready</span>
            <span className="text-[10px] text-neon flex items-center justify-center gap-1 mt-0.5 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> 100% Compliant
            </span>
          </div>
        </div>

        {/* Bulk Export Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-electric/25 via-[#171A2B] to-[#111321] border border-electric/50 flex items-center justify-between mb-6 shadow-md">
          <div>
            <span className="text-sm font-bold text-white block">Download All Clips as ZIP Package</span>
            <span className="text-xs text-text-muted">
              Includes {readyClips.length} rendered 9:16 short videos with descriptive filenames.
            </span>
          </div>

          <button
            onClick={handleBulkZipDownload}
            disabled={readyClips.length === 0}
            className="py-2.5 px-4 rounded-xl text-xs font-extrabold bg-electric hover:bg-electric-hover text-white flex items-center gap-2 shadow-lg shadow-electric/40 disabled:opacity-50 transition-all shrink-0 ml-4"
          >
            <Archive className="w-4 h-4 text-neon" />
            <span>Download ZIP</span>
          </button>
        </div>

        {/* Individual Clips List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-wider text-text-muted font-mono">
              Individual MP4 Downloads & YouTube Kits ({readyClips.length})
            </label>
            <span className="text-[11px] text-neon flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3" />
              1-Click Copy Title & Description
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {clips.map((clip) => {
              const isReady = clip.variants && clip.variants.some(v => v.render_status === 'completed');
              const isCopied = copiedClipId === clip.id;
              return (
                <div
                  key={clip.id}
                  className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white block truncate">{clip.title}</span>
                    <span className="text-[11px] text-text-muted font-mono">
                      Duration: {clip.duration.toFixed(1)}s • Score: {clip.virality_score}% • {clip.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Copy YouTube Metadata */}
                    <button
                      type="button"
                      onClick={() => handleCopyYouTubeMeta(clip)}
                      className="py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-surface hover:bg-[#1F233A] text-rose-300 border border-border hover:border-rose-500/50 flex items-center gap-1.5 transition-all"
                      title="Copy YouTube Shorts Title, Description, and Tags"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-neon" />
                          <span className="text-neon font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Youtube className="w-3.5 h-3.5 text-rose-400" />
                          <span>Copy YT Info</span>
                        </>
                      )}
                    </button>

                    {/* Download MP4 */}
                    <button
                      onClick={() => onDownloadSingle(clip)}
                      disabled={!isReady}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold bg-electric hover:bg-electric-hover text-white flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md shadow-electric/25"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-neon" />
            Standard H.264 / AAC High Profile • YouTube & TikTok Ready
          </span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-text-muted hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
