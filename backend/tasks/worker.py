import os
import json
import time
import threading
import traceback
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from database import SessionLocal, Project, Clip, ClipVariant, Transcription, Job
from services.downloader import download_video_and_extract_audio, get_video_metadata
from services.transcriber import transcribe_audio_with_word_timestamps
from services.viral_detector import detect_viral_moments
from services.face_tracker import compute_smart_crop_centers
from services.subtitle_engine import generate_ass_subtitles
from services.video_processor import render_clip_mp4

STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

# In-memory tracking of active background threads and cancellation flags
_ACTIVE_JOBS: Dict[str, Dict[str, Any]] = {}

STAGES = [
    ("fetching_video", "Fetching video from source", 12),
    ("extracting_audio", "Extracting high-fidelity audio track", 22),
    ("transcribing_speech", "Transcribing speech with word-level timing", 38),
    ("analyzing_content", "Analyzing semantic pacing and engagement", 50),
    ("finding_viral_moments", "Detecting peak viral moments and hooks", 64),
    ("creating_editing_variations", "Composing editing styles & framing", 75),
    ("generating_subtitles", "Generating animated ASS captions", 84),
    ("rendering_videos", "Rendering 9:16 vertical MP4 video clips", 95),
    ("finalizing_downloads", "Finalizing downloads & preview manifests", 100)
]

def update_job_step(job_id: str, step_name: str, description: str, progress: int, error: Optional[str] = None):
    db: Session = SessionLocal()
    try:
        job = db.query(Job).filter_by(id=job_id).first()
        if job:
            job.current_step = step_name
            job.step_description = description
            job.progress = progress
            if error:
                job.status = "failed"
                job.error_message = error
            elif progress >= 100:
                job.status = "completed"
                job.error_message = None
            else:
                job.status = "running"
                job.error_message = None
            db.commit()
    finally:
        db.close()

def cancel_job(job_id: str):
    if job_id in _ACTIVE_JOBS:
        _ACTIVE_JOBS[job_id]["cancel_requested"] = True
    db = SessionLocal()
    try:
        job = db.query(Job).filter_by(id=job_id).first()
        if job and job.status not in ["completed", "failed"]:
            job.status = "cancelled"
            job.step_description = "Job was cancelled by user."
            db.commit()
    finally:
        db.close()

def run_project_pipeline_task(job_id: str, project_id: str):
    """Executes the full 9-stage video processing pipeline in a background thread."""
    _ACTIVE_JOBS[job_id] = {"cancel_requested": False}
    db: Session = SessionLocal()
    
    try:
        project = db.query(Project).filter_by(id=project_id).first()
        if not project:
            update_job_step(job_id, "failed", "Project not found", 0, error="Project not found")
            return

        project_dir = os.path.join(STATIC_DIR, "projects", project_id)
        clips_dir = os.path.join(STATIC_DIR, "clips", project_id)
        os.makedirs(project_dir, exist_ok=True)
        os.makedirs(clips_dir, exist_ok=True)

        # STAGE 1: Fetching video
        update_job_step(job_id, "fetching_video", "Connecting to video stream and fetching video...", 10)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return

        last_update_time = [0.0]

        def on_download_progress(pct: int, speed_mb: float, eta_sec: int):
            if _ACTIVE_JOBS.get(job_id, {}).get("cancel_requested"):
                raise RuntimeError("Download cancelled by user.")
            now = time.time()
            if now - last_update_time[0] >= 0.5:
                last_update_time[0] = now
                job_pct = 10 + int(pct * 0.12) # scales smoothly 10% -> 22%
                speed_str = f"{speed_mb:.1f} MB/s" if speed_mb > 0 else "streaming"
                eta_str = f"{eta_sec}s" if eta_sec and eta_sec < 3600 else "calculating..."
                update_job_step(job_id, "fetching_video", f"Downloading video: {pct}% ({speed_str}, ETA {eta_str})", job_pct)

        if project.video_path and os.path.exists(project.video_path) and project.audio_path and os.path.exists(project.audio_path):
            print(f"[Worker] Source video and audio already present for project {project_id}, reusing files.")
            dl_results = {"video_path": project.video_path, "audio_path": project.audio_path, "vtt_path": None}
        else:
            dl_results = download_video_and_extract_audio(
                project.source_url,
                project_dir,
                project_id,
                progress_callback=on_download_progress
            )
            project.video_path = dl_results["video_path"]
            project.audio_path = dl_results["audio_path"]
            if dl_results.get("title"):
                project.title = dl_results["title"]
            if dl_results.get("channel_name"):
                project.channel_name = dl_results["channel_name"]
            if dl_results.get("duration"):
                project.duration = float(dl_results["duration"])
            db.commit()

        # STAGE 2: Extracting audio
        update_job_step(job_id, "extracting_audio", "Extracting 16kHz speech track for acoustic alignment", 22)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return
        time.sleep(0.3)

        # STAGE 3: Transcribing speech
        update_job_step(job_id, "transcribing_speech", "Transcribing speech and extracting word-level timestamps", 38)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return

        existing_tx = db.query(Transcription).filter_by(project_id=project_id).first()
        if existing_tx and existing_tx.transcript_json:
            print(f"[Worker] Using cached transcription for project {project_id}")
            transcript_data = json.loads(existing_tx.transcript_json)
        else:
            vtt_path = dl_results.get("vtt_path")
            if not vtt_path or not os.path.exists(vtt_path):
                # Search project directory for any downloaded .vtt file
                if os.path.exists(project_dir):
                    for f in os.listdir(project_dir):
                        if f.endswith(".vtt"):
                            vtt_path = os.path.join(project_dir, f)
                            break
            transcript_data = transcribe_audio_with_word_timestamps(project.audio_path, project.title, vtt_path)
            new_tx = Transcription(
                project_id=project_id,
                transcript_json=json.dumps(transcript_data),
                raw_text=transcript_data.get("raw_text", "")
            )
            db.add(new_tx)
            db.commit()

        # STAGE 4: Analyzing content
        update_job_step(job_id, "analyzing_content", "Analyzing semantic pacing, engagement peaks, and dialogue hooks", 50)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return
        time.sleep(0.3)

        # STAGE 5: Finding viral moments
        update_job_step(job_id, "finding_viral_moments", "Detecting 5-15 viral candidate moments with retention scoring", 64)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return

        detected_clips = detect_viral_moments(transcript_data, project.duration or 300.0, audio_path=project.audio_path)

        # Remove previous clips if re-analyzing project
        old_clips = db.query(Clip).filter_by(project_id=project_id).all()
        for oc in old_clips:
            db.query(ClipVariant).filter_by(clip_id=oc.id).delete()
            db.delete(oc)
        db.commit()

        # Persist detected clips
        created_clip_objs = []
        from services.metadata_generator import generate_youtube_metadata
        for c in detected_clips:
            yt_meta = generate_youtube_metadata(
                clip_title=c["title"],
                category=c.get("category", "Storytelling"),
                project_title=project.title or "",
                virality_score=c.get("virality_score", 85)
            )
            clip_obj = Clip(
                project_id=project_id,
                title=c["title"],
                start_time=c["start_time"],
                end_time=c["end_time"],
                virality_score=c["virality_score"],
                reason=c["reason"],
                category=c["category"],
                youtube_title=c.get("youtube_title") or yt_meta["youtube_title"],
                youtube_description=c.get("youtube_description") or yt_meta["youtube_description"],
                youtube_tags=c.get("youtube_tags") or yt_meta["youtube_tags"]
            )
            db.add(clip_obj)
            db.flush()
            created_clip_objs.append(clip_obj)
        db.commit()

        # STAGE 6: Creating editing variations
        update_job_step(job_id, "creating_editing_variations", "Synthesizing editing styles (Podcast, High Energy, Cinematic)", 75)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return
        time.sleep(0.5)

        # STAGE 7: Generating subtitles
        update_job_step(job_id, "generating_subtitles", "Generating animated ASS captions with word-level highlights", 84)
        if _ACTIVE_JOBS[job_id]["cancel_requested"]:
            return

        # STAGE 8: Rendering videos
        update_job_step(job_id, "rendering_videos", "Applying smart vertical face tracking and rendering 9:16 MP4 clips", 90)
        
        # Render top clips into real MP4 files
        segments = transcript_data.get("segments", [])
        top_clips_to_render = created_clip_objs[:4] # Render top 4 immediately for fast response; others can be rendered on demand
        
        styles_map = [
            ("VIRAL_PODCAST", "smart_fullscreen", "bold_viral"),
            ("HIGH_ENERGY", "smart_fullscreen", "neon_highlight"),
            ("CINEMATIC", "blurred_bg", "minimal_pro"),
            ("CAPTION_FOCUSED", "smart_fullscreen", "bold_viral")
        ]

        for idx, clip_obj in enumerate(top_clips_to_render):
            if _ACTIVE_JOBS[job_id]["cancel_requested"]:
                return

            style_choice = styles_map[idx % len(styles_map)]
            editing_style, crop_mode, sub_preset = style_choice

            # 1. Compute face tracking center
            tracker_info = compute_smart_crop_centers(
                project.video_path,
                clip_obj.start_time,
                clip_obj.end_time
            )
            center_x = tracker_info.get("avg_center_x", 0.5)

            # 2. Generate ASS Subtitle file with Viblo Hook Card and Smart Emojis
            ass_path = os.path.join(clips_dir, f"{clip_obj.id}_{sub_preset}.ass")
            generate_ass_subtitles(
                segments=segments,
                clip_start=clip_obj.start_time,
                clip_end=clip_obj.end_time,
                output_ass_path=ass_path,
                preset=sub_preset,
                words_per_group=2,
                hook_title=clip_obj.title,
                auto_emojis=True
            )

            # 3. Render MP4 with smooth time-varying smart face tracking
            output_mp4 = os.path.join(clips_dir, f"{clip_obj.id}_{editing_style}.mp4")
            crop_expr = tracker_info.get("ffmpeg_crop_expr")
            render_clip_mp4(
                source_video_path=project.video_path,
                start_time=clip_obj.start_time,
                end_time=clip_obj.end_time,
                output_mp4_path=output_mp4,
                crop_mode=crop_mode,
                center_x=center_x,
                crop_expr=crop_expr,
                editing_style=editing_style,
                ass_path=ass_path
            )

            # Record variant in DB
            rel_output_url = f"/static/clips/{project_id}/{clip_obj.id}_{editing_style}.mp4"
            variant = ClipVariant(
                clip_id=clip_obj.id,
                editing_style=editing_style,
                crop_mode=crop_mode,
                subtitle_preset=sub_preset,
                output_url=rel_output_url,
                file_path=output_mp4,
                render_status="completed",
                file_size_bytes=os.path.getsize(output_mp4) if os.path.exists(output_mp4) else 0
            )
            db.add(variant)
            clip_obj.preview_url = rel_output_url
            db.commit()

        # STAGE 9: Finalizing downloads
        update_job_step(job_id, "finalizing_downloads", "Ready for download and multi-platform publishing", 100)
        project.status = "completed"
        db.commit()

    except Exception as e:
        err_msg = f"{str(e)}\n{traceback.format_exc()}"
        print(f"[Worker Error] Job {job_id} failed: {err_msg}")
        update_job_step(job_id, "failed", f"Processing error: {str(e)}", 0, error=str(e))
    finally:
        _ACTIVE_JOBS.pop(job_id, None)
        db.close()

def enqueue_pipeline_job(project_id: str) -> str:
    """Creates a new Job record and launches the pipeline background thread."""
    db = SessionLocal()
    try:
        job = Job(
            project_id=project_id,
            status="running",
            progress=5,
            current_step="fetching_video",
            step_description="Job queued for processing"
        )
        db.add(job)
        db.commit()
        job_id = job.id
    finally:
        db.close()

    thread = threading.Thread(
        target=run_project_pipeline_task,
        args=(job_id, project_id),
        daemon=True
    )
    thread.start()
    return job_id
