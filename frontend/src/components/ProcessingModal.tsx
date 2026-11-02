'use client';

import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Music, 
  FileText, 
  BrainCircuit, 
  Sparkles, 
  Palette, 
  Subtitles, 
  Video, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Clock,
  Loader2
} from 'lucide-react';
import { JobProgress } from '../types';

interface ProcessingModalProps {
  jobId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const PIPELINE_STEPS = [
  { id: 'fetching_video', label: 'Fetching video', icon: Download },
  { id: 'extracting_audio', label: 'Extracting audio', icon: Music },
  { id: 'transcribing_speech', label: 'Transcribing speech', icon: FileText },
  { id: 'analyzing_content', label: 'Analyzing content', icon: BrainCircuit },
  { id: 'finding_viral_moments', label: 'Finding viral moments', icon: Sparkles },
  { id: 'creating_editing_variations', label: 'Creating editing variations', icon: Palette },
  { id: 'generating_subtitles', label: 'Generating subtitles', icon: Subtitles },
  { id: 'rendering_videos', label: 'Rendering videos', icon: Video },
  { id: 'finalizing_downloads', label: 'Finalizing downloads', icon: CheckCircle2 },
];

export default function ProcessingModal({ jobId, onComplete, onCancel }: ProcessingModalProps) {
  const [job, setJob] = useState<JobProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch job progress');
        }
        const data: JobProgress = await res.json();
        setJob(data);

        if (data.status === 'completed') {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 1200);
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Pipeline processing encountered an error.');
          clearInterval(interval);
        } else if (data.status === 'cancelled') {
          setError('Job was cancelled.');
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error('Job polling error:', err);
      }
    };

    pollJob();
    interval = setInterval(pollJob, 1000);

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
      onCancel();
    } catch (e) {
      console.error('Cancel request error:', e);
    }
  };

  const currentStepIndex = job 
    ? PIPELINE_STEPS.findIndex(s => s.id === job.current_step)
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl glass-panel p-6 rounded-2xl border border-primary-500/30 shadow-2xl shadow-primary-950/60 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600/20 border border-primary-500/40 flex items-center justify-center text-primary-400">
              <BrainCircuit className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Production Pipeline</h3>
              <p className="text-xs text-slate-400">Converting long video to 9:16 vertical shorts</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-surfaceElevated transition-all"
            title="Cancel job"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="my-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-300">
              {job?.step_description || 'Initializing video pipeline...'}
            </span>
            <span className="font-mono text-accent-cyan text-sm">
              {job ? `${job.progress}%` : '0%'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-primary-500 via-accent-purple to-accent-cyan transition-all duration-500"
              style={{ width: `${job?.progress || 5}%` }}
            />
          </div>
        </div>

        {/* Error notification if failed */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Processing Alert</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 9 Actual Pipeline Stages */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex || (job?.progress === 100);
            const isCurrent = idx === currentStepIndex && (job?.progress !== 100);
            const isPending = idx > currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-primary-950/40 border-primary-500/50 text-white font-semibold shadow-inner'
                    : isCompleted
                    ? 'bg-surfaceElevated/40 border-emerald-900/30 text-emerald-400'
                    : 'bg-surfaceElevated/20 border-slate-900 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-primary-500/20 text-primary-400'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{step.label}</span>
                </div>

                <div className="shrink-0">
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-[11px] text-accent-cyan font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> In Progress
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-600 font-mono">
                      Step {idx + 1}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer cancel / status */}
        <div className="mt-6 pt-4 border-t border-borderSubtle flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Backend background worker active
          </span>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all border border-slate-800 hover:border-rose-900/50"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Task'}
          </button>
        </div>

      </div>
    </div>
  );
}
