export interface Project {
  id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string;
  duration: number;
  status: 'created' | 'processing' | 'completed' | 'failed';
  source_url: string;
  clip_count?: number;
  latest_job_id?: string;
  created_at?: string;
}

export interface ClipVariant {
  id: string;
  editing_style: 'VIRAL_PODCAST' | 'HIGH_ENERGY' | 'CINEMATIC' | 'CAPTION_FOCUSED' | 'GAMING_STORYTELLING';
  crop_mode: 'smart_fullscreen' | 'blurred_bg';
  subtitle_preset: 'bold_viral' | 'neon_highlight' | 'minimal_pro' | 'gaming_captions';
  output_url: string;
  render_status: 'pending' | 'rendering' | 'completed' | 'failed';
  file_size_bytes: number;
}

export interface Clip {
  id: string;
  project_id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  virality_score: number;
  category: string;
  reason: string;
  preview_url?: string;
  hook_title?: string;
  auto_emojis?: boolean;
  youtube_title?: string;
  youtube_description?: string;
  youtube_tags?: string;
  variants: ClipVariant[];
}

export interface JobProgress {
  id: string;
  project_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_step: string;
  step_description: string;
  error_message?: string;
}

export interface DashboardStats {
  total_projects: number;
  total_clips: number;
  rendered_variants: number;
  available_credits: number;
  total_credits: number;
  hours_saved: number;
  avg_virality_score: number;
}
