'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import FeaturesSection from '../components/FeaturesSection';
import TemplatesSection from '../components/TemplatesSection';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';

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
  FolderKanban, 
  CheckCircle2, 
  Settings, 
  Key, 
  Save, 
  ArrowUpRight, 
  AlertTriangle, 
  X, 
  Play,
  Flame,
  ArrowRight,
  Globe
} from 'lucide-react';

export default function Home() {
  // Mode: 'landing' or 'studio'
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');

  // Studio tab states: 'dashboard' | 'projects' | 'clips' | 'templates' | 'settings'
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
    avg_virality_score: 94
  });

  // Modal states
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedClipForEditor, setSelectedClipForEditor] = useState<Clip | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showBackendHelp, setShowBackendHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Load initial projects & stats from backend
  useEffect(() => {
    fetchProjects();
    fetchStats();

    // Keyboard shortcut (Ctrl+B or Cmd+B) to toggle sidebar in studio mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
  const handleGenerateClips = async (
    url: string,
    options?: { clipLength?: string; topicPrompt?: string; aspectRatio?: string }
  ) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          auto_analyze: true,
          clip_length: options?.clipLength || 'auto',
          topic_prompt: options?.topicPrompt || '',
          aspect_ratio: options?.aspectRatio || '9:16'
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchProjects();
        setActiveProject(data.project);
        if (data.job_id) {
          setActiveJobId(data.job_id);
        }
        // Switch to studio mode to watch generation
        setViewMode('studio');
        setActiveTab('dashboard');
      } else {
        const errData = await res.json().catch(() => ({}));
        const message = errData.detail || (typeof errData === 'string' ? errData : `Submission Error (${res.status}): Make sure backend is running on port 8000.`);
        alert(message);
      }
    } catch (err: any) {
      console.error('Generate clips error:', err);
      setShowBackendHelp(true);
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
        setViewMode('studio');
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

  const scrollToSection = (id: string) => {
    if (viewMode !== 'landing') {
      setViewMode('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-electric selection:text-white">
      
      {/* ========================================================
          MODE 1: PREMIUM LANDING PAGE
          ======================================================== */}
      {viewMode === 'landing' ? (
        <div className="relative flex flex-col min-h-screen">
          
          {/* Floating Dark Navigation Bar */}
          <Navbar
            onOpenStudio={() => {
              setViewMode('studio');
              setActiveTab('dashboard');
            }}
            isStudioActive={false}
            onNavigateLandingSection={scrollToSection}
          />

          {/* Hero Section */}
          <main className="flex-1">
            <HeroSection
              onGenerateClips={() => {
                const workspaceEl = document.getElementById('workspace-quick');
                if (workspaceEl) {
                  workspaceEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setViewMode('studio');
                }
              }}
              onSeeHowItWorks={() => scrollToSection('how-it-works')}
            />

            {/* How It Works Section */}
            <HowItWorksSection />

            {/* Features Section */}
            <FeaturesSection />

            {/* Embedded Live Video Generation Workspace Section */}
            <section id="workspace-quick" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-neon" />
                    <span>Live Interactive Studio</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                    TRY IT LIVE: <span className="text-electric-light">GENERATE VIRAL SHORTS</span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLoadDemo}
                    disabled={isDemoLoading}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-surface hover:bg-card text-white border border-border hover:border-electric transition-all flex items-center gap-2"
                  >
                    <Play className="w-3 h-3 text-neon fill-neon" />
                    <span>{isDemoLoading ? 'Loading Demo...' : 'Load Sample Demo'}</span>
                  </button>

                  <button
                    onClick={() => setViewMode('studio')}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white flex items-center gap-2 shadow-lg shadow-electric/30 transition-all"
                  >
                    <span>Full Studio View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* URL Input Box */}
              <div className="mb-8">
                <UrlInputSection
                  onGenerate={handleGenerateClips}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Stats Counters */}
              <div className="mb-10">
                <StatsSection stats={stats} />
              </div>

              {/* Active Clips Showcase */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-neon" />
                      <span>Generated Viral Shorts</span>
                      {activeProject && (
                        <span className="text-xs font-normal text-text-muted truncate max-w-xs block sm:inline font-mono">
                          ({activeProject.title})
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 font-normal">
                      9:16 vertical MP4 videos with active face-tracking & animated word-highlight captions
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-electric hover:bg-electric-hover text-white flex items-center gap-2 shadow-lg shadow-electric/30 transition-all"
                    >
                      <Archive className="w-4 h-4 text-neon" />
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
                  <div className="rounded-3xl bg-card border border-dashed border-border p-12 text-center">
                    <Video className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-white mb-1">No Clips Generated Yet</h3>
                    <p className="text-xs text-text-muted max-w-sm mx-auto mb-4 font-normal">
                      Paste a YouTube link above or click "Load Sample Demo" to preview real AI-edited clips.
                    </p>
                    <button
                      onClick={handleLoadDemo}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-electric/20 text-electric-light border border-electric/40 hover:bg-electric/30 transition-all"
                    >
                      Load Sample Demo Project
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Templates Section */}
            <TemplatesSection
              onSelectTemplate={() => {
                setViewMode('studio');
                setActiveTab('templates');
              }}
            />

            {/* Pricing Section */}
            <PricingSection
              onSelectPlan={() => {
                setViewMode('studio');
                setActiveTab('dashboard');
              }}
            />
          </main>

          {/* Footer */}
          <Footer
            onOpenStudio={() => {
              setViewMode('studio');
              setActiveTab('dashboard');
            }}
            onNavigateSection={scrollToSection}
          />

        </div>
      ) : (
        /* ========================================================
            MODE 2: DEDICATED APPLICATION STUDIO WORKSPACE
            ======================================================== */
        <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary">
          {/* Studio Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            credits={stats.available_credits}
            totalCredits={stats.total_credits}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            onBackToWebsite={() => setViewMode('landing')}
          />

          {/* Main Dashboard Workspace Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header
              onLoadDemo={handleLoadDemo}
              isDemoLoading={isDemoLoading}
              activeProjectTitle={activeProject?.title}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              onBackToWebsite={() => setViewMode('landing')}
            />

            <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 max-w-7xl mx-auto">
                  {/* YouTube URL Ingestion Section */}
                  <UrlInputSection
                    onGenerate={handleGenerateClips}
                    isSubmitting={isSubmitting}
                  />

                  {/* Realtime Stats Counters */}
                  <StatsSection stats={stats} />

                  {/* Active Clips Showcase */}
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-neon" />
                          <span>Generated Viral Shorts</span>
                          {activeProject && (
                            <span className="text-xs font-normal text-text-muted truncate max-w-xs block sm:inline font-mono">
                              ({activeProject.title})
                            </span>
                          )}
                        </h2>
                        <p className="text-xs text-text-muted mt-0.5">
                          9:16 vertical MP4 videos with active face-tracking & animated word-highlight captions
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsExportModalOpen(true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-electric hover:bg-electric-hover text-white flex items-center gap-2 shadow-lg shadow-electric/30 transition-all"
                        >
                          <Archive className="w-4 h-4 text-neon" />
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
                      <div className="rounded-3xl bg-card border border-dashed border-border p-12 text-center">
                        <Video className="w-12 h-12 text-text-muted mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-white mb-1">No Clips Generated Yet</h3>
                        <p className="text-xs text-text-muted max-w-sm mx-auto mb-4">
                          Paste a video link above or click "Load Sample Demo" to view verified AI viral moments.
                        </p>
                        <button
                          onClick={handleLoadDemo}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-electric/20 text-electric-light border border-electric/40 hover:bg-electric/30 transition-all"
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
                      <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-neon" />
                        <span>Project Library</span>
                      </h2>
                      <p className="text-xs text-text-muted">Manage all ingested YouTube videos and rendering jobs</p>
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
                        className={`rounded-3xl bg-card p-4 cursor-pointer border transition-all hover:border-electric hover:shadow-xl hover:shadow-electric/15 ${
                          activeProject?.id === proj.id ? 'border-electric shadow-lg shadow-electric/20' : 'border-border'
                        }`}
                      >
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-3 relative border border-border">
                          <img
                            src={proj.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 text-neon font-bold border border-border">
                            {proj.duration ? `${Math.round(proj.duration)}s` : 'Video'}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-sm text-white line-clamp-1 mb-1">{proj.title}</h3>
                        <p className="text-xs text-text-muted mb-3 font-mono">{proj.channel_name}</p>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                          <span className="text-neon font-bold flex items-center gap-1 hover:underline text-[11px]">
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
                      <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-neon" />
                        <span>Viral Moments & Short Clips</span>
                      </h2>
                      <p className="text-xs text-text-muted">
                        Showing {filteredClips.length} candidate shorts for {activeProject?.title || 'active project'}
                      </p>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                      {['All', 'Storytelling', 'Educational Hook', 'Controversial Take', 'Mind-Blowing Fact', 'High Energy'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            categoryFilter === cat
                              ? 'bg-electric text-white font-black shadow-md shadow-electric/30'
                              : 'bg-card text-text-muted hover:text-white border border-border'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clips Grid */}
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

              {/* TAB 4: TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="max-w-6xl mx-auto space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-neon" />
                      <h2 className="font-display font-black text-xl text-white uppercase tracking-tight">Creator Preset Templates</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-neon/15 text-neon border border-neon/30">
                        High Retention
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Mobile layouts engineered for 9:16 vertical retention with active face tracking and animated captions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[
                      {
                        title: 'ClipHi Dynamic Hook',
                        category: 'Top TikTok / Reels Format',
                        tag: '🔥 88% Retention',
                        desc: 'Clean 9:16 vertical video with active face tracking, top hook header pill banner, neon active-word highlights, and dynamic emojis.',
                        features: ['Smart 9:16 face tracking', 'Smart auto-emojis (🔥, 🤯, 💰)', 'Top hook pill banner (0-4.5s)', 'Loudness normalization'],
                        badgeColor: 'border-neon/40 bg-neon/10 text-neon',
                      },
                      {
                        title: 'Hormozi / Bold Gold Pop',
                        category: 'Shorts & Reels Standard',
                        tag: '⚡ 1-2 Words/Beat',
                        desc: 'Rapid-fire bold typography with animated yellow pops, thick dark borders, and instant audio punch. Proven to maximize average watch time.',
                        features: ['1-2 word rapid transitions', 'Rich yellow glow pop', 'Subtle camera punch-in', 'Dialogue normalization'],
                        badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-200',
                      },
                      {
                        title: 'Executive Speaker Pro',
                        category: 'Interviews & Podcasts',
                        tag: '🎙️ Speaker Focus',
                        desc: 'Full-screen 9:16 vertical speaker tracking with smooth reframing and clean minimalist subtitles for an authoritative appearance.',
                        features: ['Centered speaker framing', 'Minimalist clean captions', 'Smooth audio crossfades', 'Professional color profile'],
                        badgeColor: 'border-electric/40 bg-electric/15 text-electric-light',
                      },
                      {
                        title: 'Kinetic Text Retention',
                        category: 'Retention Maximizer',
                        tag: '✨ Kinetic Glow',
                        desc: 'Full-screen subject tracking paired with large high-contrast typography and subtle dark vignette to keep viewer eyes glued to text.',
                        features: ['Smart face framing', 'Glow word highlight', 'Atmospheric subtle vignette', 'Seamless loopable transition'],
                        badgeColor: 'border-neon/40 bg-neon/10 text-neon',
                      },
                      {
                        title: 'Gaming & Stream Reactions',
                        category: 'Twitch / Kick VODs',
                        tag: '🎮 Dynamic Action',
                        desc: 'Full-screen motion reframing with electric neon subtitles, punchy color balance, and suspenseful vignette shading.',
                        features: ['Active subject reframing', 'Electric magenta/pink text', 'High impact sound profile', 'Dynamic camera pacing'],
                        badgeColor: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
                      },
                      {
                        title: 'Documentary Film Blur',
                        category: 'Storytelling & Essays',
                        tag: '🎬 Filmic Grade',
                        desc: 'Rich warm contrast grade, blurred backdrop with centered 16:9 foreground, elegant minimal subtitles, and cinematic smooth crossfades.',
                        features: ['Warm filmic color curve', 'Gentle fade-in/fade-out', 'Minimal Pro subtitles', 'Deep dark tones'],
                        badgeColor: 'border-border bg-card text-text-muted',
                      }
                    ].map((tmpl, idx) => (
                      <div key={idx} className="rounded-3xl bg-card p-5 border border-border flex flex-col justify-between hover:border-electric transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono">
                              {tmpl.category}
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tmpl.badgeColor}`}>
                              {tmpl.tag}
                            </span>
                          </div>
                          
                          <h3 className="font-display font-extrabold text-base text-white mb-2">{tmpl.title}</h3>
                          <p className="text-xs text-text-muted leading-relaxed mb-4">{tmpl.desc}</p>
                          
                          <div className="space-y-1.5 pt-3 border-t border-border mb-5">
                            {tmpl.features.map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-2 text-[11px] text-text-primary">
                                <CheckCircle2 className="w-3 h-3 text-neon shrink-0" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTab('clips')}
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-surface hover:bg-electric text-white border border-border hover:border-electric flex items-center justify-center gap-1.5 transition-all"
                        >
                          <span>Use In Clip Editor</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neon" />
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
                    <h2 className="font-display font-black text-xl text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-neon" />
                      <span>AI Engine & Workspace Settings</span>
                    </h2>
                    <p className="text-xs text-text-muted mt-1">Configure AI API providers, FFmpeg renderer, and export defaults</p>
                  </div>

                  <div className="rounded-3xl bg-card p-6 space-y-6 border border-border">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Key className="w-4 h-4 text-neon" />
                        <span>AI Provider API Keys</span>
                      </h3>
                      <p className="text-xs text-text-muted">
                        AutoClip AI includes offline heuristic NLP fallback so it functions without API keys. Provide keys below for OpenAI Whisper and GPT-4o-mini / Gemini models.
                      </p>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-text-primary font-semibold block mb-1">OpenAI API Key</label>
                          <input
                            type="password"
                            placeholder="sk-..."
                            className="w-full bg-[#0A0C16] border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-text-primary font-semibold block mb-1">Google Gemini API Key</label>
                          <input
                            type="password"
                            placeholder="AIzaSy..."
                            className="w-full bg-[#0A0C16] border border-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-electric font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        onClick={() => alert('Settings saved successfully.')}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-electric hover:bg-electric-hover text-white flex items-center gap-2 shadow-lg shadow-electric/30"
                      >
                        <Save className="w-3.5 h-3.5 text-neon" />
                        <span>Save Preferences</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* Progress & Processing Modal */}
      {activeJobId && (
        <ProcessingModal
          jobId={activeJobId}
          onComplete={async () => {
            setActiveJobId(null);
            await fetchProjects();
            if (activeProject) {
              await selectProject(activeProject);
            }
            setViewMode('studio');
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

      {/* Backend Connection Assistance Modal */}
      {showBackendHelp && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#111321] p-6 md:p-8 rounded-3xl border border-rose-500/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-border mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-base text-white">Python Backend Unreachable</h3>
                  <span className="text-xs text-rose-300">FastAPI & FFmpeg video pipeline required</span>
                </div>
              </div>
              <button
                onClick={() => setShowBackendHelp(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-card transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Vercel only hosts the web frontend. The video processing pipeline (FastAPI, FFmpeg, Whisper AI, and yt-dlp) runs on a Python server.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-neon/20 text-neon text-xs flex items-center justify-center font-bold">1</span>
                  Run Locally (Instant & Free)
                </span>
                <p className="text-[11px] text-text-muted pl-7">
                  Open <a href="http://localhost:3000" target="_blank" rel="noreferrer" className="text-neon underline font-mono font-bold">http://localhost:3000</a> on this machine where the local Python server is already running on port 8000.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-electric/20 text-electric-light text-xs flex items-center justify-center font-bold">2</span>
                  Or Connect Vercel via Free Tunnel
                </span>
                <p className="text-[11px] text-text-muted pl-7">
                  Expose your local backend using <code className="text-neon font-mono bg-[#0A0C16] px-1 py-0.5 rounded">npx localtunnel --port 8000</code> or ngrok, then set <code className="text-neon font-mono bg-[#0A0C16] px-1 py-0.5 rounded">BACKEND_URL</code> in Vercel Project Settings &rarr; Environment Variables.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <a
                href="http://localhost:3000"
                className="py-2.5 px-4 rounded-xl text-xs font-extrabold bg-electric hover:bg-electric-hover text-white flex items-center gap-1.5 transition-all shadow-md shadow-electric/40"
              >
                <span>Open Localhost:3000</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setShowBackendHelp(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-card hover:bg-surface text-text-muted hover:text-white border border-border transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
