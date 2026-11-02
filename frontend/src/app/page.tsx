'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import UrlInputSection from '../components/UrlInputSection';
import StatsSection from '../components/StatsSection';
import ClipCard from '../components/ClipCard';
import ClipEditorModal from '../components/ClipEditorModal';
import ProcessingModal from '../components/ProcessingModal';
import ExportModal from '../components/ExportModal';
import { Project, Clip, DashboardStats } from '../types';
import { 
  Sparkles, 
  Video, 
  Archive, 
  Filter, 
  Flame, 
  FolderKanban, 
  Play, 
  Clock, 
  CheckCircle2, 
  Palette, 
  Settings, 
  Key, 
  Save, 
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_projects: 1,
    total_clips: 4,
    rendered_variants: 4,
    available_credits: 250,
    total_credits: 300,
    hours_saved: 3.0,
    avg_virality_score: 92
  });

  // Modal states
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedClipForEditor, setSelectedClipForEditor] = useState<Clip | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Load initial data
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (data.length > 0 && !activeProject) {
          selectProject(data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const selectProject = async (proj: Project) => {
    setActiveProject(proj);
    try {
      const res = await fetch(`/api/projects/${proj.id}/clips`);
      if (res.ok) {
        const data = await res.json();
        setClips(data);
      }
    } catch (err) {
      console.error('Fetch clips error:', err);
    }
  };

  // Submit YouTube URL
  const handleGenerateClips = async (url: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, auto_analyze: true })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchProjects();
        setActiveProject(data.project);
        if (data.job_id) {
          setActiveJobId(data.job_id);
        }
      } else {
        const errData = await res.json();
        alert(errData.detail || 'Failed to submit video URL');
      }
    } catch (err) {
      console.error('Generate clips error:', err);
      alert('Error connecting to backend service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Demo Project
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await fetchProjects();
        const demoProj = projects.find(p => p.id === data.project_id) || {
          id: data.project_id,
          title: 'The 3-Second Retention Secret: How Top Creators Hook Millions',
          channel_name: 'Creator Science',
          thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          duration: 120.0,
          status: 'completed',
          source_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        };
        await selectProject(demoProj as Project);
        setActiveTab('clips');
      }
    } catch (err) {
      console.error('Demo load error:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Re-render single clip
  const handleSaveAndRerender = async (payload: {
    clipId: string;
    startTime: number;
    endTime: number;
    editingStyle: string;
    cropMode: string;
    subtitlePreset: string;
    hookTitle?: string;
    autoEmojis?: boolean;
  }) => {
    const res = await fetch(`/api/clips/${payload.clipId}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start_time: payload.startTime,
        end_time: payload.endTime,
        editing_style: payload.editingStyle,
        crop_mode: payload.cropMode,
        subtitle_preset: payload.subtitlePreset,
        hook_title: payload.hookTitle,
        auto_emojis: payload.autoEmojis ?? true
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (activeProject) {
        await selectProject(activeProject);
      }
      // Update selected clip preview in editor
      const updatedRes = await fetch(`/api/clips/${payload.clipId}`);
      if (updatedRes.ok) {
        const updatedClip = await updatedRes.json();
        setSelectedClipForEditor(updatedClip);
      }
      return data;
    } else {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Re-render request failed');
    }
  };

  // Direct download
  const handleDownloadClip = (clip: Clip) => {
    window.location.href = `/api/clips/${clip.id}/download`;
  };

  // Filter clips
  const filteredClips = clips.filter((c) => {
    if (categoryFilter === 'All') return true;
    return c.category === categoryFilter;
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={stats.available_credits}
        totalCredits={stats.total_credits}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header
          onLoadDemo={handleLoadDemo}
          isDemoLoading={isDemoLoading}
          activeProjectTitle={activeProject?.title}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* URL Ingestion Hero */}
              <UrlInputSection
                onGenerate={handleGenerateClips}
                isSubmitting={isSubmitting}
              />

              {/* Stats Counters */}
              <StatsSection stats={stats} />

              {/* Active Clips Showcase */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent-purple" />
                      <span>Generated Viral Shorts</span>
                      {activeProject && (
                        <span className="text-xs font-normal text-slate-400">
                          ({activeProject.title})
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      9:16 vertical MP4 videos with face-tracking & animated captions
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-2 shadow-lg shadow-primary-900/30 transition-all"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Export All Clips</span>
                    </button>
                  </div>
                </div>

                {/* Clips Grid */}
                {clips.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clips.map((clip) => (
                      <ClipCard
                        key={clip.id}
                        clip={clip}
                        onOpenEditor={(c) => setSelectedClipForEditor(c)}
                        onDownload={handleDownloadClip}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel p-12 rounded-2xl text-center border-dashed border-slate-800">
                    <Video className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Clips Generated Yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                      Paste a YouTube link above or click "Load Demo Project" to view verified AI viral moments.
                    </p>
                    <button
                      onClick={handleLoadDemo}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent-purple/20 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/30 transition-all"
                    >
                      Load Sample Demo Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY PROJECTS */}
          {activeTab === 'projects' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-primary-400" />
                    <span>Project Library</span>
                  </h2>
                  <p className="text-xs text-slate-400">Manage all ingested YouTube videos and rendering jobs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      selectProject(proj);
                      setActiveTab('clips');
                    }}
                    className={`glass-card p-4 rounded-2xl cursor-pointer border ${
                      activeProject?.id === proj.id ? 'border-primary-500' : 'border-slate-800'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 mb-3 relative">
                      <img
                        src={proj.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white font-semibold">
                        {proj.duration ? `${Math.round(proj.duration)}s` : 'Video'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{proj.title}</h3>
                    <p className="text-xs text-slate-400 mb-3">{proj.channel_name}</p>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
                      <span className="text-accent-emerald font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                      </span>
                      <span className="text-primary-400 font-bold flex items-center gap-1 hover:underline">
                        <span>View Clips</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GENERATED CLIPS */}
          {activeTab === 'clips' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-accent-purple" />
                    <span>Viral Moments & Short Clips</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Showing {filteredClips.length} candidate shorts for {activeProject?.title || 'active project'}
                  </p>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {['All', 'Storytelling', 'Educational Hook', 'Controversial', 'Mind-Blowing Fact', 'High Energy'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        categoryFilter === cat
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40'
                          : 'bg-surfaceElevated text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClips.map((clip) => (
                  <ClipCard
                    key={clip.id}
                    clip={clip}
                    onOpenEditor={(c) => setSelectedClipForEditor(c)}
                    onDownload={handleDownloadClip}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VIBLO AI CREATOR TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-accent-cyan" />
                    <h2 className="text-xl font-bold text-white">Viblo AI Creator Templates</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-accent-purple/20 text-accent-purple border border-accent-purple/40">
                      New Formats
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    High-retention mobile layouts inspired by Viblo.ai, TikTok, and MrBeast. Pick a template to apply to your clips.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    title: 'Viblo Hook Master',
                    category: 'Top TikTok / Reels Format',
                    tag: '🔥 85% Retention',
                    desc: 'Clean 9:16 vertical video with smart face tracking, top hook header pill banner, neon green active-word highlights, and dynamic emojis.',
                    features: ['Smart 9:16 face tracking', 'Smart auto-emojis (💰, 🔥, 🤯)', 'Top hook pill banner (0-4.5s)', 'Dialogue loudness boost'],
                    badgeColor: 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple',
                    layout: 'smart_fullscreen',
                    style: 'HIGH_ENERGY',
                    preset: 'neon_highlight'
                  },
                  {
                    title: 'Hormozi / MrBeast Pop',
                    category: 'Shorts & Reels Standard',
                    tag: '⚡ 1-2 Words/Beat',
                    desc: 'Rapid-fire bold typography with animated yellow pops, thick dark borders, and instant audio punch. Proven to maximize average watch time.',
                    features: ['1-2 word rapid transitions', 'Rich yellow glow pop', 'Subtle camera punch-in', 'Dialogue normalization'],
                    badgeColor: 'border-accent-amber/40 bg-accent-amber/10 text-accent-amber',
                    layout: 'smart_fullscreen',
                    style: 'VIRAL_PODCAST',
                    preset: 'bold_viral'
                  },
                  {
                    title: 'Executive Podcast Pro',
                    category: 'Interviews & Shows',
                    tag: '🎙️ Speaker Focus',
                    desc: 'Full-screen 9:16 vertical speaker tracking with smooth reframing and clean minimalist subtitles for an authoritative appearance.',
                    features: ['Centered speaker framing', 'Minimalist clean captions', 'Smooth audio crossfades', 'Professional color profile'],
                    badgeColor: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
                    layout: 'smart_fullscreen',
                    style: 'VIRAL_PODCAST',
                    preset: 'minimal_pro'
                  },
                  {
                    title: 'Caption Focused Virality',
                    category: 'Retention Maximizer',
                    tag: '✨ Kinetic Text',
                    desc: 'Full-screen subject tracking paired with large high-contrast typography and subtle dark vignette to keep viewer eyes glued to text.',
                    features: ['Smart face framing', 'Glow word highlight', 'Atmospheric subtle vignette', 'Seamless loopable transition'],
                    badgeColor: 'border-accent-purple/40 bg-accent-purple/10 text-accent-purple',
                    layout: 'smart_fullscreen',
                    style: 'CAPTION_FOCUSED',
                    preset: 'bold_viral'
                  },
                  {
                    title: 'Cinematic Documentary',
                    category: 'Storytelling & Essays',
                    tag: '🎬 Filmic Grade',
                    desc: 'Rich warm contrast grade, blurred backdrop with 16:9 foreground, elegant minimal subtitles, and cinematic smooth crossfades.',
                    features: ['Warm filmic color curve', 'Gentle fade-in/fade-out', 'Minimal Pro subtitles', 'Deep dark tones'],
                    badgeColor: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
                    layout: 'blurred_bg',
                    style: 'CINEMATIC',
                    preset: 'minimal_pro'
                  },
                  {
                    title: 'Gaming & Stream Reactions',
                    category: 'Gaming & High Energy',
                    tag: '🎮 Dynamic Action',
                    desc: 'Full-screen motion reframing with electric neon subtitles, punchy color balance, and suspenseful vignette shading.',
                    features: ['Active subject reframing', 'Electric magenta/pink text', 'High impact sound profile', 'Dynamic camera pacing'],
                    badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                    layout: 'smart_fullscreen',
                    style: 'GAMING_STORYTELLING',
                    preset: 'gaming_captions'
                  }
                ].map((tmpl, idx) => (
                  <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tmpl.category}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${tmpl.badgeColor}`}>
                          {tmpl.tag}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-white mb-2">{tmpl.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{tmpl.desc}</p>
                      
                      <div className="space-y-1.5 pt-3 border-t border-slate-800/80 mb-5">
                        {tmpl.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                            <CheckCircle2 className="w-3 h-3 text-accent-emerald shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('clips');
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-surfaceElevated hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center gap-1.5 transition-all hover:border-primary-500"
                    >
                      <span>Use In Clip Editor</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-400" />
                  <span>AI Engine & Workspace Settings</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Configure AI API providers, FFmpeg renderer, and export defaults</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-800">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-accent-amber" />
                    <span>AI Provider API Keys</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    AutoClip AI includes offline heuristic NLP fallback so it functions without API keys. Provide keys below for OpenAI Whisper and GPT-4o-mini / Gemini models.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">OpenAI API Key</label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 font-semibold block mb-1">Google Gemini API Key</label>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => alert('Settings saved successfully.')}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-2 shadow-lg shadow-primary-900/30"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Real-time 9-stage Processing Pipeline Modal */}
      {activeJobId && (
        <ProcessingModal
          jobId={activeJobId}
          onComplete={async () => {
            setActiveJobId(null);
            await fetchProjects();
            if (activeProject) {
              await selectProject(activeProject);
            }
            setActiveTab('clips');
          }}
          onCancel={() => {
            setActiveJobId(null);
          }}
        />
      )}

      {/* Dedicated In-Browser Video Editor Modal */}
      {selectedClipForEditor && (
        <ClipEditorModal
          clip={selectedClipForEditor}
          onClose={() => setSelectedClipForEditor(null)}
          onSaveAndRerender={handleSaveAndRerender}
          onDownload={handleDownloadClip}
        />
      )}

      {/* Multi-Platform Export Center Modal */}
      {isExportModalOpen && (
        <ExportModal
          project={activeProject}
          clips={clips}
          onClose={() => setIsExportModalOpen(false)}
          onDownloadSingle={handleDownloadClip}
        />
      )}

    </div>
  );
}
