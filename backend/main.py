import os
import json
import zipfile
import io
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Query, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import init_db, get_db, User, Project, Clip, ClipVariant, Transcription, Job
from services.downloader import validate_youtube_url, get_video_metadata
from services.video_processor import render_clip_mp4, FFMPEG_PATH
from services.face_tracker import compute_smart_crop_centers
from services.subtitle_engine import generate_ass_subtitles
from services.demo_service import seed_demo_project_data
from tasks.worker import enqueue_pipeline_job, cancel_job

app = FastAPI(
    title="AutoClip AI API",
    description="Automated AI-powered video conversion for YouTube Shorts, Reels, and TikTok",
    version="1.0.0"
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Initialize database schema and default demo project on startup
@app.on_event("startup")
def on_startup():
    init_db()
    try:
        seed_demo_project_data()
    except Exception as e:
        print(f"[Startup] Demo seed error: {e}")

# Request Models
class CreateProjectRequest(BaseModel):
    url: str
    auto_analyze: bool = True

class RenderClipRequest(BaseModel):
    editing_style: str = "VIRAL_PODCAST"
    crop_mode: str = "smart_fullscreen"
    subtitle_preset: str = "bold_viral"
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    hook_title: Optional[str] = None
    auto_emojis: bool = True

# Endpoints
@app.get("/")
def read_root():
    return {
        "app": "AutoClip AI",
        "status": "online",
        "tagline": "One Link. Multiple Viral-Ready Shorts.",
        "version": "1.0.0"
    }

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    total_clips = db.query(Clip).count()
    completed_variants = db.query(ClipVariant).filter_by(render_status="completed").count()
    return {
        "total_projects": total_projects,
        "total_clips": total_clips,
        "rendered_variants": completed_variants,
        "available_credits": 250,
        "total_credits": 300,
        "hours_saved": round(total_clips * 0.75, 1),
        "avg_virality_score": 92
    }

@app.post("/api/projects", status_code=status.HTTP_201_CREATED)
def create_project(payload: CreateProjectRequest, db: Session = Depends(get_db)):
    url = payload.url.strip()
    if not validate_youtube_url(url):
        raise HTTPException(status_code=400, detail="Invalid YouTube URL. Please provide a valid youtube.com or youtu.be link.")

    # Retrieve metadata with fallback
    meta = get_video_metadata(url)
    
    project = Project(
        user_id="default_user",
        source_url=url,
        title=meta.get("title", "YouTube Video"),
        channel_name=meta.get("channel_name", "Creator"),
        thumbnail_url=meta.get("thumbnail_url", ""),
        duration=meta.get("duration", 0.0),
        status="created"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    job_id = None
    if payload.auto_analyze:
        job_id = enqueue_pipeline_job(project.id)
        project.status = "processing"
        db.commit()

    return {
        "project": {
            "id": project.id,
            "title": project.title,
            "channel_name": project.channel_name,
            "thumbnail_url": project.thumbnail_url,
            "duration": project.duration,
            "status": project.status,
            "source_url": project.source_url,
            "created_at": project.created_at.isoformat() if project.created_at else None
        },
        "job_id": job_id
    }

@app.get("/api/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    out = []
    for p in projects:
        clip_count = db.query(Clip).filter_by(project_id=p.id).count()
        latest_job = db.query(Job).filter_by(project_id=p.id).order_by(Job.created_at.desc()).first()
        out.append({
            "id": p.id,
            "title": p.title,
            "channel_name": p.channel_name,
            "thumbnail_url": p.thumbnail_url,
            "duration": p.duration,
            "status": p.status,
            "clip_count": clip_count,
            "latest_job_id": latest_job.id if latest_job else None,
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return out

@app.get("/api/projects/{id}")
def get_project_details(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    clip_count = db.query(Clip).filter_by(project_id=id).count()
    tx = db.query(Transcription).filter_by(project_id=id).first()
    latest_job = db.query(Job).filter_by(project_id=id).order_by(Job.created_at.desc()).first()

    return {
        "id": project.id,
        "title": project.title,
        "channel_name": project.channel_name,
        "thumbnail_url": project.thumbnail_url,
        "duration": project.duration,
        "status": project.status,
        "source_url": project.source_url,
        "clip_count": clip_count,
        "latest_job": {
            "id": latest_job.id,
            "status": latest_job.status,
            "progress": latest_job.progress,
            "current_step": latest_job.current_step,
            "step_description": latest_job.step_description
        } if latest_job else None,
        "has_transcription": bool(tx)
    }

@app.post("/api/projects/{id}/analyze")
def start_project_analysis(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    job_id = enqueue_pipeline_job(project.id)
    project.status = "processing"
    db.commit()

    return {"job_id": job_id, "status": "started"}

@app.get("/api/projects/{id}/clips")
def get_project_clips(id: str, db: Session = Depends(get_db)):
    clips = db.query(Clip).filter_by(project_id=id).order_by(Clip.virality_score.desc()).all()
    results = []
    for c in clips:
        variants = db.query(ClipVariant).filter_by(clip_id=c.id).order_by(ClipVariant.created_at.desc()).all()
        results.append({
            "id": c.id,
            "project_id": c.project_id,
            "title": c.title,
            "start_time": c.start_time,
            "end_time": c.end_time,
            "duration": round(c.end_time - c.start_time, 1),
            "virality_score": c.virality_score,
            "category": c.category,
            "reason": c.reason,
            "preview_url": c.preview_url,
            "variants": [
                {
                    "id": v.id,
                    "editing_style": v.editing_style,
                    "crop_mode": v.crop_mode,
                    "subtitle_preset": v.subtitle_preset,
                    "output_url": v.output_url,
                    "render_status": v.render_status,
                    "file_size_bytes": v.file_size_bytes
                } for v in variants
            ]
        })
    return results

@app.get("/api/clips/{id}")
def get_clip_details(id: str, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter_by(id=id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    project = db.query(Project).filter_by(id=clip.project_id).first()
    variants = db.query(ClipVariant).filter_by(clip_id=clip.id).order_by(ClipVariant.created_at.desc()).all()
    
    # Retrieve relevant transcript segment
    tx = db.query(Transcription).filter_by(project_id=clip.project_id).first()
    transcript_segments = []
    if tx:
        try:
            parsed = json.loads(tx.transcript_json)
            all_segs = parsed.get("segments", [])
            for s in all_segs:
                if s.get("end", 0) >= clip.start_time and s.get("start", 0) <= clip.end_time:
                    transcript_segments.append(s)
        except Exception:
            pass

    return {
        "id": clip.id,
        "project_id": clip.project_id,
        "project_title": project.title if project else "",
        "title": clip.title,
        "start_time": clip.start_time,
        "end_time": clip.end_time,
        "duration": round(clip.end_time - clip.start_time, 1),
        "virality_score": clip.virality_score,
        "category": clip.category,
        "reason": clip.reason,
        "preview_url": clip.preview_url,
        "variants": [
            {
                "id": v.id,
                "editing_style": v.editing_style,
                "crop_mode": v.crop_mode,
                "subtitle_preset": v.subtitle_preset,
                "output_url": v.output_url,
                "render_status": v.render_status,
                "file_size_bytes": v.file_size_bytes
            } for v in variants
        ],
        "transcript_segments": transcript_segments
    }

@app.post("/api/clips/{id}/render")
def re_render_clip(id: str, payload: RenderClipRequest, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter_by(id=id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")
    
    project = db.query(Project).filter_by(id=clip.project_id).first()
    if not project or not project.video_path or not os.path.exists(project.video_path):
        raise HTTPException(status_code=400, detail="Original source video not found on disk.")

    start_time = payload.start_time if payload.start_time is not None else clip.start_time
    end_time = payload.end_time if payload.end_time is not None else clip.end_time
    
    # Update clip timing if user adjusted
    clip.start_time = start_time
    clip.end_time = end_time

    # Retrieve transcript
    tx = db.query(Transcription).filter_by(project_id=clip.project_id).first()
    segments = []
    if tx:
        try:
            segments = json.loads(tx.transcript_json).get("segments", [])
        except Exception:
            pass

    clips_dir = os.path.join(STATIC_DIR, "clips", project.id)
    os.makedirs(clips_dir, exist_ok=True)

    # 1. Compute crop center
    tracker_info = compute_smart_crop_centers(project.video_path, start_time, end_time)
    center_x = tracker_info.get("avg_center_x", 0.5)

    # 2. Generate Subtitles ASS with Viblo Hook Card and Smart Emojis
    ass_path = os.path.join(clips_dir, f"{clip.id}_{payload.subtitle_preset}.ass")
    generate_ass_subtitles(
        segments=segments,
        clip_start=start_time,
        clip_end=end_time,
        output_ass_path=ass_path,
        preset=payload.subtitle_preset,
        hook_title=payload.hook_title or clip.title,
        auto_emojis=payload.auto_emojis
    )

    # 3. Render MP4
    out_file = os.path.join(clips_dir, f"{clip.id}_{payload.editing_style}_{int(start_time)}_{int(end_time)}.mp4")
    render_clip_mp4(
        source_video_path=project.video_path,
        start_time=start_time,
        end_time=end_time,
        output_mp4_path=out_file,
        crop_mode=payload.crop_mode,
        center_x=center_x,
        editing_style=payload.editing_style,
        ass_path=ass_path
    )

    rel_url = f"/static/clips/{project.id}/{os.path.basename(out_file)}"
    clip.preview_url = rel_url

    # Save variant
    variant = ClipVariant(
        clip_id=clip.id,
        editing_style=payload.editing_style,
        crop_mode=payload.crop_mode,
        subtitle_preset=payload.subtitle_preset,
        output_url=rel_url,
        file_path=out_file,
        render_status="completed",
        file_size_bytes=os.path.getsize(out_file) if os.path.exists(out_file) else 0
    )
    db.add(variant)
    db.commit()

    return {
        "status": "success",
        "clip_id": clip.id,
        "preview_url": rel_url,
        "variant_id": variant.id
    }

@app.get("/api/clips/{id}/download")
def download_clip_file(id: str, variant_id: Optional[str] = None, db: Session = Depends(get_db)):
    clip = db.query(Clip).filter_by(id=id).first()
    if not clip:
        raise HTTPException(status_code=404, detail="Clip not found")

    variant = None
    if variant_id:
        variant = db.query(ClipVariant).filter_by(id=variant_id).first()
    if not variant:
        # Default to latest completed variant
        variant = db.query(ClipVariant).filter_by(clip_id=id, render_status="completed").order_by(ClipVariant.created_at.desc()).first()

    if not variant or not variant.file_path or not os.path.exists(variant.file_path):
        raise HTTPException(status_code=404, detail="Rendered video file is not yet ready.")

    clean_title = "".join(c for c in clip.title if c.isalnum() or c in " _-").strip().replace(" ", "_")
    filename = f"AutoClip_{clean_title}_{variant.editing_style}.mp4"

    return FileResponse(
        path=variant.file_path,
        media_type="video/mp4",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/api/projects/{id}/export-all")
def export_all_clips_zip(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    clips = db.query(Clip).filter_by(project_id=id).all()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for c in clips:
            variant = db.query(ClipVariant).filter_by(clip_id=c.id, render_status="completed").first()
            if variant and variant.file_path and os.path.exists(variant.file_path):
                clean_title = "".join(ch for ch in c.title if ch.isalnum() or ch in " _-").strip().replace(" ", "_")
                zf.write(variant.file_path, arcname=f"{c.virality_score}_AutoClip_{clean_title}.mp4")

    zip_buffer.seek(0)
    clean_proj_title = "".join(c for c in project.title if c.isalnum() or c in " _-").strip()[:30]
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="AutoClip_{clean_proj_title}_Batch.zip"'}
    )

@app.delete("/api/projects/{id}")
def delete_project(id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"status": "deleted", "id": id}

@app.get("/api/jobs/{id}")
def get_job_progress(id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter_by(id=id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "project_id": job.project_id,
        "status": job.status,
        "progress": job.progress,
        "current_step": job.current_step,
        "step_description": job.step_description,
        "error_message": job.error_message,
        "updated_at": job.updated_at.isoformat() if job.updated_at else None
    }

@app.post("/api/jobs/{id}/cancel")
def cancel_active_job(id: str):
    cancel_job(id)
    return {"status": "cancellation_requested", "id": id}

@app.post("/api/demo/reset")
def reset_demo():
    proj_id = seed_demo_project_data()
    return {"status": "demo_ready", "project_id": proj_id}
