import os
import json
import subprocess
from sqlalchemy.orm import Session
from database import init_db, SessionLocal, User, Project, Clip, ClipVariant, Transcription, Job
from services.subtitle_engine import generate_ass_subtitles, PRESET_STYLES
from services.video_processor import render_clip_mp4, FFMPEG_PATH
from services.face_tracker import compute_smart_crop_centers

STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

DEMO_TRANSCRIPT = {
    "segments": [
        {
            "id": 0, "start": 0.0, "end": 7.5,
            "text": "In our town your shadow does not copy what you are doing. It copies what you will do three seconds into the future.",
            "words": [
                {"word": "IN", "start": 0.0, "end": 0.3},
                {"word": "OUR", "start": 0.3, "end": 0.6},
                {"word": "TOWN", "start": 0.6, "end": 1.1},
                {"word": "YOUR", "start": 1.1, "end": 1.4},
                {"word": "SHADOW", "start": 1.4, "end": 1.9},
                {"word": "COPIES", "start": 1.9, "end": 2.4},
                {"word": "WHAT", "start": 2.4, "end": 2.7},
                {"word": "YOU", "start": 2.7, "end": 2.9},
                {"word": "WILL", "start": 2.9, "end": 3.2},
                {"word": "DO", "start": 3.2, "end": 3.6},
                {"word": "THREE", "start": 3.6, "end": 4.1},
                {"word": "SECONDS", "start": 4.1, "end": 4.8},
                {"word": "INTO", "start": 4.8, "end": 5.2},
                {"word": "THE", "start": 5.2, "end": 5.4},
                {"word": "FUTURE", "start": 5.4, "end": 6.2}
            ]
        },
        {
            "id": 1, "start": 7.5, "end": 16.5,
            "text": "At first it was a blessing. People used it to dodge speeding cars, catch falling glasses, and survive fatal accidents.",
            "words": [
                {"word": "AT", "start": 7.5, "end": 7.8},
                {"word": "FIRST", "start": 7.8, "end": 8.3},
                {"word": "IT", "start": 8.3, "end": 8.5},
                {"word": "WAS", "start": 8.5, "end": 8.8},
                {"word": "A", "start": 8.8, "end": 9.0},
                {"word": "BLESSING", "start": 9.0, "end": 9.7},
                {"word": "PEOPLE", "start": 9.8, "end": 10.3},
                {"word": "USED", "start": 10.3, "end": 10.7},
                {"word": "IT", "start": 10.7, "end": 10.9},
                {"word": "TO", "start": 10.9, "end": 11.1},
                {"word": "DODGE", "start": 11.1, "end": 11.6},
                {"word": "SPEEDING", "start": 11.6, "end": 12.2},
                {"word": "CARS", "start": 12.2, "end": 12.9},
                {"word": "AND", "start": 13.0, "end": 13.3},
                {"word": "SURVIVE", "start": 13.3, "end": 14.1},
                {"word": "ACCIDENTS", "start": 14.1, "end": 15.2}
            ]
        },
        {
            "id": 2, "start": 16.5, "end": 26.5,
            "text": "There was only one absolute rule: whatever your shadow does, your body will be forced to do three seconds later. You can not fight it.",
            "words": [
                {"word": "THERE", "start": 16.5, "end": 16.8},
                {"word": "WAS", "start": 16.8, "end": 17.1},
                {"word": "ONLY", "start": 17.1, "end": 17.5},
                {"word": "ONE", "start": 17.5, "end": 17.8},
                {"word": "RULE", "start": 17.8, "end": 18.5},
                {"word": "WHATEVER", "start": 18.6, "end": 19.2},
                {"word": "YOUR", "start": 19.2, "end": 19.4},
                {"word": "SHADOW", "start": 19.4, "end": 20.0},
                {"word": "DOES", "start": 20.0, "end": 20.5},
                {"word": "YOUR", "start": 20.6, "end": 20.8},
                {"word": "BODY", "start": 20.8, "end": 21.3},
                {"word": "WILL", "start": 21.3, "end": 21.6},
                {"word": "FOLLOW", "start": 21.6, "end": 22.2},
                {"word": "YOU", "start": 22.5, "end": 22.8},
                {"word": "CANNOT", "start": 22.8, "end": 23.4},
                {"word": "FIGHT", "start": 23.4, "end": 24.1},
                {"word": "IT", "start": 24.1, "end": 24.5}
            ]
        },
        {
            "id": 3, "start": 26.5, "end": 38.0,
            "text": "Until yesterday, when I looked at my wall at midnight. My shadow was screaming, clawing at its throat, trying to tear its own skin off.",
            "words": [
                {"word": "UNTIL", "start": 26.5, "end": 27.1},
                {"word": "YESTERDAY", "start": 27.1, "end": 28.0},
                {"word": "AT", "start": 28.1, "end": 28.3},
                {"word": "MIDNIGHT", "start": 28.3, "end": 29.2},
                {"word": "MY", "start": 29.4, "end": 29.7},
                {"word": "SHADOW", "start": 29.7, "end": 30.3},
                {"word": "WAS", "start": 30.3, "end": 30.6},
                {"word": "SCREAMING", "start": 30.6, "end": 31.8},
                {"word": "CLAWING", "start": 32.0, "end": 32.8},
                {"word": "AT", "start": 32.8, "end": 33.1},
                {"word": "ITS", "start": 33.1, "end": 33.3},
                {"word": "THROAT", "start": 33.3, "end": 34.2}
            ]
        }
    ],
    "raw_text": "In our town your shadow does not copy what you are doing. It copies what you will do three seconds into the future. At first it was a blessing. People used it to dodge speeding cars, catch falling glasses, and survive fatal accidents. There was only one absolute rule: whatever your shadow does, your body will be forced to do three seconds later. You can not fight it. Until yesterday, when I looked at my wall at midnight. My shadow was screaming, clawing at its throat, trying to tear its own skin off."
}

def seed_demo_project_data(force_rebuild: bool = True):
    """Initializes the Demo Project with verified real playable vertical MP4 clips and rich metadata."""
    init_db()
    db: Session = SessionLocal()
    try:
        demo_dir = os.path.join(STATIC_DIR, "demo")
        os.makedirs(demo_dir, exist_ok=True)
        demo_source = os.path.join(demo_dir, "demo_source.mp4")

        # Verify demo source video exists and has real content (> 1MB)
        if not os.path.exists(demo_source) or os.path.getsize(demo_source) < 1000000:
            print("[DemoService] Source video missing or too small. Generating demo video...")
            local_movie = "A:\\MOVIES\\Catch Me If You Can-1080P.mp4"
            local_audio = "A:\\ROBLOX animation\\voice_gneef_brian.mp3"
            if os.path.exists(local_movie) and os.path.exists(local_audio):
                cmd_mux = [
                    FFMPEG_PATH, "-y",
                    "-ss", "900", "-t", "50",
                    "-i", local_movie,
                    "-i", local_audio,
                    "-map", "0:v:0", "-map", "1:a:0",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
                    "-c:a", "aac", "-b:a", "192k",
                    "-shortest",
                    demo_source
                ]
                subprocess.run(cmd_mux, check=True)
            else:
                # Generate clean synthetic 1080p demo pattern with audio
                cmd_synth = [
                    FFMPEG_PATH, "-y",
                    "-f", "lavfi", "-i", "testsrc=size=1920x1080:rate=30",
                    "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=44100",
                    "-t", "50",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
                    "-c:a", "aac", "-b:a", "128k",
                    "-shortest",
                    demo_source
                ]
                subprocess.run(cmd_synth, check=True)

        demo_proj = db.query(Project).filter_by(id="demo_project_001").first()
        if not demo_proj:
            demo_proj = Project(
                id="demo_project_001",
                user_id="default_user",
                source_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                title="Your Shadow Moves 3 Seconds Early: The Psychological Paradox",
                channel_name="Cinema & Story Science",
                thumbnail_url="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
                duration=50.0,
                status="completed",
                video_path=demo_source,
                audio_path=demo_source
            )
            db.add(demo_proj)
            db.flush()
        else:
            demo_proj.title = "Your Shadow Moves 3 Seconds Early: The Psychological Paradox"
            demo_proj.video_path = demo_source
            demo_proj.audio_path = demo_source
            demo_proj.status = "completed"

        # Update or add transcription
        tx = db.query(Transcription).filter_by(project_id="demo_project_001").first()
        if not tx:
            tx = Transcription(
                project_id=demo_proj.id,
                transcript_json=json.dumps(DEMO_TRANSCRIPT),
                raw_text=DEMO_TRANSCRIPT["raw_text"]
            )
            db.add(tx)
        else:
            tx.transcript_json = json.dumps(DEMO_TRANSCRIPT)
            tx.raw_text = DEMO_TRANSCRIPT["raw_text"]

        # 4 High Virality Candidate Shorts
        clips_spec = [
            {
                "id": "clip_demo_01",
                "title": "Your Shadow Moves 3 Seconds Early",
                "start": 0.0,
                "end": 7.5,
                "score": 96,
                "category": "Educational Hook",
                "reason": "Immediate high-concept curiosity hook in the first 1.5 seconds, rapid cognitive engagement.",
                "style": "VIRAL_PODCAST",
                "crop": "smart_fullscreen",
                "preset": "bold_viral"
            },
            {
                "id": "clip_demo_02",
                "title": "Surviving Accidents Before They Happen",
                "start": 7.5,
                "end": 16.5,
                "score": 93,
                "category": "High Energy",
                "reason": "Fast-paced tension, tangible stakes, concrete high-adrenaline narrative examples.",
                "style": "HIGH_ENERGY",
                "crop": "smart_fullscreen",
                "preset": "neon_highlight"
            },
            {
                "id": "clip_demo_03",
                "title": "The One Absolute Rule You Can't Break",
                "start": 16.5,
                "end": 26.5,
                "score": 91,
                "category": "Storytelling",
                "reason": "Dramatic rule revelation with suspenseful pacing, sets up unexpected twist.",
                "style": "CINEMATIC",
                "crop": "blurred_bg",
                "preset": "minimal_pro"
            },
            {
                "id": "clip_demo_04",
                "title": "Midnight In Front Of The Wall",
                "start": 26.5,
                "end": 38.0,
                "score": 95,
                "category": "Punchline",
                "reason": "Terrifying horror twist climax that forces viewers to rewatch and leave comments.",
                "style": "CAPTION_FOCUSED",
                "crop": "smart_fullscreen",
                "preset": "bold_viral"
            }
        ]

        for item in clips_spec:
            clip = db.query(Clip).filter_by(id=item["id"]).first()
            if not clip:
                clip = Clip(
                    id=item["id"],
                    project_id=demo_proj.id,
                    title=item["title"],
                    start_time=item["start"],
                    end_time=item["end"],
                    virality_score=item["score"],
                    category=item["category"],
                    reason=item["reason"]
                )
                db.add(clip)
                db.flush()
            else:
                clip.title = item["title"]
                clip.start_time = item["start"]
                clip.end_time = item["end"]
                clip.virality_score = item["score"]
                clip.category = item["category"]
                clip.reason = item["reason"]

            # Generate ASS Subtitles file
            ass_path = os.path.join(demo_dir, f"{item['id']}.ass")
            generate_ass_subtitles(
                segments=DEMO_TRANSCRIPT["segments"],
                clip_start=item["start"],
                clip_end=item["end"],
                output_ass_path=ass_path,
                preset=item["preset"]
            )

            # Render Real Vertical MP4 if not already cached
            out_mp4 = os.path.join(demo_dir, f"{item['id']}_{item['style']}.mp4")
            if not os.path.exists(out_mp4) or os.path.getsize(out_mp4) < 1000:
                tracker_info = compute_smart_crop_centers(demo_source, item["start"], item["end"])
                center_x = tracker_info.get("avg_center_x", 0.5)
                crop_expr = tracker_info.get("ffmpeg_crop_expr")
                render_clip_mp4(
                    source_video_path=demo_source,
                    start_time=item["start"],
                    end_time=item["end"],
                    output_mp4_path=out_mp4,
                    crop_mode=item["crop"],
                    center_x=center_x,
                    crop_expr=crop_expr,
                    editing_style=item["style"],
                    ass_path=ass_path
                )

            rel_url = f"/static/demo/{item['id']}_{item['style']}.mp4"
            clip.preview_url = rel_url

            variant = db.query(ClipVariant).filter_by(clip_id=clip.id).first()
            if not variant:
                variant = ClipVariant(
                    clip_id=clip.id,
                    editing_style=item["style"],
                    crop_mode=item["crop"],
                    subtitle_preset=item["preset"],
                    output_url=rel_url,
                    file_path=out_mp4,
                    render_status="completed",
                    file_size_bytes=os.path.getsize(out_mp4) if os.path.exists(out_mp4) else 0
                )
                db.add(variant)
            else:
                variant.output_url = rel_url
                variant.file_path = out_mp4
                variant.render_status = "completed"
                variant.file_size_bytes = os.path.getsize(out_mp4) if os.path.exists(out_mp4) else 0

        db.commit()
        print("[DemoService] Rich demo project clips generated successfully!")
        return demo_proj.id
    except Exception as e:
        print(f"[DemoService] Error initializing demo: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_project_data(force_rebuild=True)
