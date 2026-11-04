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
  { id: 'fetching_video', label: 'Fetching video stream', icon: Download },
  { id: 'extracting_audio', label: 'Extracting audio & waveforms', icon: Music },
  { id: 'transcribing_speech', label: 'Transcribing speech', icon: FileText },
  { id: 'analyzing_content', label: 'AI multi-modal analysis', icon: BrainCircuit },
  { id: 'finding_viral_moments', label: 'Detecting retention peaks', icon: Sparkles },
  { id: 'creating_editing_variations', label: 'Creating 9:16 layout variations', icon: Palette },
  { id: 'generating_subtitles', label: 'Synthesizing word-pop captions', icon: Subtitles },
  { id: 'rendering_videos', label: 'Face tracking & MP4 rendering', icon: Video },
  { id: 'finalizing_downloads', label: 'Finalizing clips & YouTube kit', icon: CheckCircle2 },
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#111321] p-6 sm:p-8 rounded-3xl border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-electric/20 border border-electric/40 flex items-center justify-center text-electric">
              <Sparkles className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">AI Video Processing Engine</h3>
              <span className="text-xs text-text-muted">Job ID: {jobId.slice(0, 8)}...</span>
            </div>
          </div>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-card transition-all"
            title="Cancel processing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-6">
          {error ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">Pipeline Notification</h4>
                <p className="text-xs text-rose-300/80 mt-1">{error}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={onCancel}
                    className="px-3 py-1.5 bg-rose-600/30 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-semibold hover:bg-rose-600/40"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar Container */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neon" />
                    {job?.step_description || 'Synthesizing viral video moments...'}
                  </span>
                  <span className="font-mono font-black text-neon text-sm">
                    {job ? Math.round(job.progress) : 0}%
                  </span>
                </div>
                
                <div className="w-full bg-[#0A0C16] h-3 rounded-full overflow-hidden border border-border p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-electric to-neon rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(52,59,255,0.5)]"
                    style={{ width: `${job ? job.progress : 0}%` }}
                  />
                </div>
              </div>

              {/* Step Checklist */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {PIPELINE_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIndex > idx || job?.status === 'completed';
                  const isCurrent = currentStepIndex === idx && job?.status !== 'completed';
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs ${
                        isCurrent
                          ? 'bg-electric/15 border-electric text-white font-bold'
                          : isCompleted
                          ? 'bg-card/40 border-border/50 text-text-muted'
                          : 'bg-card/20 border-transparent text-text-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-neon' : isCompleted ? 'text-electric-light' : 'text-text-muted/40'}`} />
                        <span>{step.label}</span>
                      </div>

                      <div>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-neon" />
                        ) : isCurrent ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-neon animate-ping mr-1" />
                        ) : (
                          <span className="text-[10px] font-mono text-text-muted/40 font-bold">WAITING</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-neon" />
            Estimated time: ~30-50 seconds
          </span>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="text-text-muted hover:text-white transition-colors"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Task'}
          </button>
        </div>

      </div>
    </div>
  );
}
