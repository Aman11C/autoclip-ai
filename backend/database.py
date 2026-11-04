import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
from sqlalchemy import create_engine, Column, String, Integer, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Session

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "autoclip.db")
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, default="demo@autoclip.ai")
    name = Column(String(255), nullable=False, default="AutoClip Creator")
    created_at = Column(DateTime, default=get_utc_now)
    
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    source_url = Column(String(1024), nullable=False)
    title = Column(String(512), default="Untitled Video")
    channel_name = Column(String(256), default="YouTube Creator")
    thumbnail_url = Column(String(1024), default="")
    duration = Column(Float, default=0.0) # in seconds
    status = Column(String(64), default="created") # created, processing, completed, failed
    video_path = Column(String(1024), nullable=True) # local file path
    audio_path = Column(String(1024), nullable=True) # extracted audio
    created_at = Column(DateTime, default=get_utc_now)
    
    user = relationship("User", back_populates="projects")
    clips = relationship("Clip", back_populates="project", cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="project", cascade="all, delete-orphan")
    transcription = relationship("Transcription", back_populates="project", uselist=False, cascade="all, delete-orphan")

class Clip(Base):
    __tablename__ = "clips"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False)
    title = Column(String(512), nullable=False)
    start_time = Column(Float, nullable=False) # seconds
    end_time = Column(Float, nullable=False) # seconds
    virality_score = Column(Integer, nullable=False, default=80)
    reason = Column(Text, default="")
    category = Column(String(128), default="General") # Storytelling, Emotional Hook, Punchline, etc.
    preview_url = Column(String(1024), nullable=True)
    youtube_title = Column(String(512), nullable=True)
    youtube_description = Column(Text, nullable=True)
    youtube_tags = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    project = relationship("Project", back_populates="clips")
    variants = relationship("ClipVariant", back_populates="clip", cascade="all, delete-orphan")

class ClipVariant(Base):
    __tablename__ = "clip_variants"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    clip_id = Column(String(64), ForeignKey("clips.id"), nullable=False)
    editing_style = Column(String(64), nullable=False, default="VIRAL_PODCAST") # VIRAL_PODCAST, HIGH_ENERGY, CINEMATIC, CAPTION_FOCUSED, GAMING_STORYTELLING
    crop_mode = Column(String(64), default="smart_fullscreen") # smart_fullscreen, blurred_bg
    subtitle_preset = Column(String(64), default="bold_viral") # bold_viral, neon_highlight, minimal_pro, gaming_captions
    output_url = Column(String(1024), nullable=True)
    file_path = Column(String(1024), nullable=True)
    render_status = Column(String(64), default="pending") # pending, rendering, completed, failed
    file_size_bytes = Column(Integer, default=0)
    created_at = Column(DateTime, default=get_utc_now)
    
    clip = relationship("Clip", back_populates="variants")

class Transcription(Base):
    __tablename__ = "transcriptions"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False, unique=True)
    transcript_json = Column(Text, nullable=False) # JSON list of words/segments with timestamps
    raw_text = Column(Text, default="")
    created_at = Column(DateTime, default=get_utc_now)
    
    project = relationship("Project", back_populates="transcription")

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False)
    status = Column(String(64), default="queued") # queued, running, completed, failed, cancelled
    progress = Column(Integer, default=0) # 0 - 100
    current_step = Column(String(64), default="queued") # 1-9 stages
    step_description = Column(String(256), default="Waiting in queue")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    project = relationship("Project", back_populates="jobs")

def init_db():
    Base.metadata.create_all(bind=engine)
    # Check for missing columns in existing SQLite db
    with engine.connect() as conn:
        try:
            from sqlalchemy import text
            result = conn.execute(text("PRAGMA table_info(clips)")).fetchall()
            existing_cols = {row[1] for row in result}
            if "youtube_title" not in existing_cols:
                conn.execute(text("ALTER TABLE clips ADD COLUMN youtube_title VARCHAR(512)"))
            if "youtube_description" not in existing_cols:
                conn.execute(text("ALTER TABLE clips ADD COLUMN youtube_description TEXT"))
            if "youtube_tags" not in existing_cols:
                conn.execute(text("ALTER TABLE clips ADD COLUMN youtube_tags TEXT"))
            conn.commit()
        except Exception as e:
            print(f"[DB] Migration check notice: {e}")

    # Ensure default user
    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email="demo@autoclip.ai").first()
        if not user:
            user = User(
                id="default_user",
                email="demo@autoclip.ai",
                name="AutoClip Creator"
            )
            db.add(user)
            db.commit()
    finally:
        db.close()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
