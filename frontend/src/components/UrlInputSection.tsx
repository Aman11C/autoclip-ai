'use client';

import React, { useState, useEffect } from 'react';
import { Youtube, Sparkles, Clipboard, ArrowRight, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UrlInputSectionProps {
  onGenerate: (url: string) => void;
  isSubmitting: boolean;
}

export default function UrlInputSection({ onGenerate, isSubmitting }: UrlInputSectionProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [detectedVideoId, setDetectedVideoId] = useState<string | null>(null);

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
      setError('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please paste a YouTube URL.');
      return;
    }
    if (error) return;
    onGenerate(url.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero Title & Subtitle */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
          <span>Autonomous Short-Form Video Studio</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
          Turn Long Videos Into{' '}
          <span className="bg-gradient-to-r from-primary-400 via-accent-purple to-accent-cyan bg-clip-text text-transparent">
            Viral Shorts
          </span>{' '}
          With AI
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          One link. Multiple viral-ready shorts. Zero manual editing.
        </p>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel p-2.5 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl shadow-primary-950/40 glow-border">
          <div className="relative flex-1 w-full flex items-center">
            <div className="pl-4 pr-3 text-red-500">
              <Youtube className="w-6 h-6" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube video link (e.g., https://www.youtube.com/watch?v=...)"
              className="w-full bg-transparent text-sm md:text-base text-white placeholder-slate-500 focus:outline-none py-3 pr-24"
              disabled={isSubmitting}
            />
            {/* Quick Paste Button inside input */}
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 px-3 py-1.5 rounded-lg bg-surfaceElevated hover:bg-slate-700/60 text-xs text-slate-300 font-medium border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Clipboard className="w-3 h-3 text-slate-400" />
              <span>Paste</span>
            </button>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isSubmitting || !url.trim()}
            className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary-600 via-accent-purple to-primary-600 bg-[length:200%_auto] hover:bg-right text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Clips</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Instant Preview Card when detected */}
        {detectedVideoId && !error && (
          <div className="mt-4 p-4 rounded-xl bg-surfaceElevated/70 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative w-full sm:w-44 h-24 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
              <img
                src={`https://img.youtube.com/vi/${detectedVideoId}/hqdefault.jpg`}
                alt="Detected video thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[10px] font-mono font-semibold bg-black/60 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-accent-cyan" /> Ready
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 text-xs text-accent-emerald font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Source Verified & Ready for Conversion</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                YouTube Video ({detectedVideoId})
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Auto-detected
                </span>
                <span>• 9:16 Vertical Cropping Enabled</span>
                <span>• ASS Dynamic Subtitles</span>
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
