# AutoClip AI — One Link. Multiple Viral-Ready Shorts.

AutoClip AI is a full-stack, autonomous video transformation web application that converts long-form YouTube videos into high-retention, professionally edited, vertical 9:16 shorts for YouTube Shorts, Instagram Reels, and TikTok.

---

## 🌟 Key Features

1. **One-Click Ingestion & Metadata Analysis**
   - Validates YouTube URLs and retrieves video metadata (title, creator, duration, thumbnail).
   - Downloads permitted video streams and extracts 16kHz audio for acoustic alignment.

2. **Accurate Speech Transcription & Alignment**
   - Extracts word-level timestamps using Whisper / OpenAI Whisper / Gemini audio with a local acoustic fallback engine.

3. **AI Viral Moment Detection**
   - Evaluates dialogue hooks, emotional shifts, punchlines, and storytelling arcs.
   - Discovers 5–15 candidate clips (15–60s) with virality scores (0–100) and categorized hooks (e.g. *Educational Hook*, *Mind-Blowing Fact*, *Storytelling*, *Controversial*).
   - Validates natural sentence boundaries to eliminate awkward mid-sentence cuts.

4. **Smart 9:16 Vertical Cropping**
   - **Mode A: Smart Full-Screen Crop** — OpenCV face detection and active speaker tracking with exponential moving average (EMA) smoothing for natural framing.
   - **Mode B: Blurred Background** — Original aspect ratio centered over an enlarged, 25px Gaussian blurred backdrop.

5. **Dynamic Subtitle Engine**
   - Generates Advanced SubStation Alpha (`.ass`) subtitles with word-level highlight animation.
   - 4 Styled Presets: *Bold Viral*, *Neon Highlight*, *Minimal Professional*, *Gaming Captions*.
   - Mobile-safe vertical margins to avoid platform interface overlay occlusion.

6. **5 Production Editing Variations**
   - **Style A — Viral Podcast**: Speaker-focused crop, bold animated subtitles, smooth zoom-ins, dialogue normalization.
   - **Style B — High Energy**: Fast-paced cutting rhythm, punch-in zoom beats, high-contrast neon captions.
   - **Style C — Cinematic**: Smooth camera framing, elegant minimal subtitles, warm contrast color grading.
   - **Style D — Caption Focused**: Large bold typography, glowing active-word pops, high contrast for instant retention.
   - **Style E — Gaming / Storytelling**: Dramatic vignette, reaction framing, dynamic subtitles, suspenseful pacing.

7. **In-Browser Video Editor**
   - Interactive 9:16 vertical video player preview.
   - Timeline start/end slider adjustments.
   - Instant switching between Cropping Modes and Subtitle Presets.
   - Single-clip re-rendering without reprocessing the entire original video.

8. **Multi-Platform Export Center**
   - 1080×1920 9:16 H.264 MP4 with AAC 192kbps audio.
   - Individual MP4 downloads and Bulk ZIP downloads with descriptive filenames.

9. **Demo Mode**
   - Pre-loaded with verified, playable 9:16 vertical MP4 video clips, complete transcript segments, and virality scores.

---

## 🏗️ Architecture

```
autoclip-ai/
├── backend/
│   ├── main.py                  # FastAPI server with all REST endpoints
│   ├── database.py              # SQLite + SQLAlchemy models (Project, Clip, Job, User)
│   ├── .env.example             # Backend environment variable template
│   ├── requirements.txt         # Python dependencies
│   ├── tasks/
│   │   └── worker.py            # Async background task runner for the 9-stage pipeline
│   ├── services/
│   │   ├── downloader.py        # yt-dlp video downloader & audio extractor
│   │   ├── transcriber.py       # Speech transcription & word-level timestamping
│   │   ├── viral_detector.py    # AI / LLM viral moment detector & scorer
│   │   ├── face_tracker.py      # OpenCV Haar cascade face tracker & EMA reframer
│   │   ├── subtitle_engine.py   # Dynamic ASS animated subtitle generator
│   │   ├── video_processor.py   # FFmpeg video cutter, cropper, loudnorm & renderer
│   │   └── demo_service.py      # Demo project seeder with verified vertical MP4s
│   └── static/                  # Rendered MP4 clips, thumbnails, and demo media
├── frontend/
│   ├── package.json             # Next.js 15, React 19, Tailwind CSS, Lucide React
│   ├── next.config.js           # Next.js App Router config with API proxy rewrites
│   ├── tailwind.config.js       # Modern SaaS dark theme with violet/cyan accents
│   └── src/
│       ├── app/
│       │   ├── globals.css      # Custom scrollbar, glassmorphic panels & glow effects
│       │   ├── layout.tsx       # Root layout
│       │   └── page.tsx         # Main interactive dashboard with tab navigation
│       ├── components/
│       │   ├── Sidebar.tsx      # SaaS navigation & credit meter
│       │   ├── Header.tsx       # Workspace header & demo mode button
│       │   ├── UrlInputSection.tsx # YouTube URL input, paste button & thumbnail preview
│       │   ├── ProcessingModal.tsx # Real-time 9-stage pipeline progress stepper
│       │   ├── ClipCard.tsx     # 9:16 vertical video card with hover preview & scores
│       │   ├── ClipEditorModal.tsx # In-browser editor with timeline & style switcher
│       │   ├── ExportModal.tsx  # Multi-platform MP4 & ZIP bulk export
│       │   └── StatsSection.tsx # Key metrics & production hours saved
└── bin/
    ├── ffmpeg.exe               # Bundled static FFmpeg binary
    └── ffprobe.exe              # Bundled static FFprobe binary
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ (tested with Node.js 24)
- Python 3.11+ (tested with Python 3.13 / 3.14)
- Static FFmpeg (bundled in `bin/` or system `ffmpeg`)

### 1. Backend Setup
```bash
cd backend

# Create virtualenv or use system Python
python -m pip install -r requirements.txt

# (Optional) Configure API keys
cp .env.example .env
# Edit .env to add OPENAI_API_KEY or GEMINI_API_KEY if desired

# Start FastAPI server (runs on port 8000)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend

# Install packages
npm install

# Start Next.js development server (runs on port 3000)
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🎯 9 True Processing Stages
1. **Fetching video** — Validates link and ingests permitted video streams.
2. **Extracting audio** — Extracts 16kHz speech track for acoustic alignment.
3. **Transcribing speech** — Generates word-level timestamps with speech models.
4. **Analyzing content** — Evaluates dialogue hooks, retention triggers, and pacing.
5. **Finding viral moments** — Extracts 5–15 candidate clips (15–60s) with 0–100 virality scores.
6. **Creating editing variations** — Selects visual treatments (Podcast, High Energy, Cinematic).
7. **Generating subtitles** — Renders animated `.ass` subtitles with active-word highlighting.
8. **Rendering videos** — Runs smart face-tracking vertical crop and burns subtitles with FFmpeg.
9. **Finalizing downloads** — Generates thumbnails, manifests, and direct MP4 export URLs.
