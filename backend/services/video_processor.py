import os
import subprocess
from typing import Dict, Any, Optional

FFMPEG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "ffmpeg.exe"))
FFPROBE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "ffprobe.exe"))

if not os.path.exists(FFMPEG_PATH):
    FFMPEG_PATH = "ffmpeg"
if not os.path.exists(FFPROBE_PATH):
    FFPROBE_PATH = "ffprobe"

def get_media_dimensions(file_path: str) -> tuple[int, int]:
    """Gets video width and height using ffprobe."""
    try:
        cmd = [
            FFPROBE_PATH, "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=s=x:p=0",
            file_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        dims = res.stdout.strip().split("x")
        return int(dims[0]), int(dims[1])
    except Exception:
        return 1920, 1080

def build_video_filter(
    crop_mode: str,
    center_x: float,
    editing_style: str,
    ass_filename: Optional[str],
    in_w: int,
    in_h: int,
    duration: float = 30.0
) -> str:
    """Constructs the complete FFmpeg video filtergraph pipeline with transitions and visual effects."""
    # 1. Base Framing / Smart 9:16 Cropping centered on face / subject
    filters = []

    if crop_mode == "blurred_bg":
        base_filter = (
            "split=2[bg_in][fg_in];"
            "[bg_in]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5[bg];"
            "[fg_in]scale=1080:-2[fg];"
            "[bg][fg]overlay=(W-w)/2:(H-h)/2"
        )
        filters.append(base_filter)
    else:
        # Smart Full-Screen Cropping centered on face / speaker
        crop_w = int(in_h * 9 / 16)
        if crop_w % 2 != 0:
            crop_w += 1
            
        ideal_x = int((center_x * in_w) - (crop_w / 2))
        max_x = max(0, in_w - crop_w)
        crop_x = max(0, min(ideal_x, max_x))
        
        filters.append(f"crop={crop_w}:{in_h}:{crop_x}:0,scale=1080:1920")

    # 2. Style-Specific Visual Effects & Cinematic Color Grading
    if editing_style == "HIGH_ENERGY":
        filters.append("eq=saturation=1.28:contrast=1.16:brightness=0.02")
        filters.append("vignette=angle=PI/6")
    elif editing_style == "CINEMATIC":
        filters.append("eq=contrast=1.18:saturation=0.92:gamma=0.94")
        filters.append("vignette=angle=PI/5")
    elif editing_style == "GAMING_STORYTELLING":
        filters.append("vignette=angle=PI/4.8")
        filters.append("eq=saturation=1.22:contrast=1.12")
    elif editing_style == "CAPTION_FOCUSED":
        filters.append("vignette=angle=PI/5.5")
        filters.append("eq=contrast=1.10:saturation=1.08")
    else: # VIRAL_PODCAST
        filters.append("eq=contrast=1.08:saturation=1.10:brightness=0.01")
        filters.append("vignette=angle=PI/6.5")

    # 3. Visual Transitions (Smooth intro & outro fade transitions)
    if duration > 2.0:
        fade_out_st = max(1.0, duration - 0.35)
        filters.append(f"fade=t=in:st=0:d=0.35,fade=t=out:st={fade_out_st:.2f}:d=0.35")

    # 4. Burn Subtitles via relative filename
    if ass_filename:
        filters.append(f"subtitles={ass_filename}")

    return ",".join(filters)

def render_clip_mp4(
    source_video_path: str,
    start_time: float,
    end_time: float,
    output_mp4_path: str,
    crop_mode: str = "smart_fullscreen",
    center_x: float = 0.5,
    editing_style: str = "VIRAL_PODCAST",
    ass_path: Optional[str] = None
) -> str:
    """Cuts, vertical-crops, normalizes dialogue loudness, burns captions, and exports optimized MP4."""
    os.makedirs(os.path.dirname(os.path.abspath(output_mp4_path)), exist_ok=True)
    in_w, in_h = get_media_dimensions(source_video_path)
    duration = max(1.0, end_time - start_time)

    ass_filename = None
    working_dir = os.path.dirname(os.path.abspath(output_mp4_path))
    if ass_path and os.path.exists(ass_path):
        ass_filename = os.path.basename(ass_path)
        working_dir = os.path.dirname(os.path.abspath(ass_path))

    vf = build_video_filter(crop_mode, center_x, editing_style, ass_filename, in_w, in_h, duration=duration)
    
    # Audio loudnorm for dialogue clarity + smooth fade transitions
    fade_out_st = max(1.0, duration - 0.35)
    af = f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.25,afade=t=out:st={fade_out_st:.2f}:d=0.35"

    cmd = [
        FFMPEG_PATH, "-y",
        "-ss", f"{start_time:.2f}",
        "-t", f"{duration:.2f}",
        "-i", os.path.abspath(source_video_path),
        "-vf", vf,
        "-af", af,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-ar", "44100",
        "-movflags", "+faststart",
        os.path.abspath(output_mp4_path)
    ]

    print(f"[VideoProcessor] Rendering clip: {output_mp4_path}")
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, cwd=working_dir)
    if res.returncode != 0:
        print(f"[VideoProcessor] Render error: {res.stderr[:300]}")
        # Subtitle fallback if fontconfig missing
        vf_fallback = build_video_filter(crop_mode, center_x, editing_style, None, in_w, in_h, duration=duration)
        cmd_fallback = [
            FFMPEG_PATH, "-y",
            "-ss", f"{start_time:.2f}",
            "-t", f"{duration:.2f}",
            "-i", os.path.abspath(source_video_path),
            "-vf", vf_fallback,
            "-af", af,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "22",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            os.path.abspath(output_mp4_path)
        ]
        subprocess.run(cmd_fallback, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=working_dir)

    # Generate a vertical thumbnail for this clip
    thumb_path = output_mp4_path.replace(".mp4", "_thumb.jpg")
    cmd_thumb = [
        FFMPEG_PATH, "-y",
        "-ss", "0.5",
        "-i", os.path.abspath(output_mp4_path),
        "-vframes", "1",
        "-q:v", "2",
        os.path.abspath(thumb_path)
    ]
    subprocess.run(cmd_thumb, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=working_dir)

    return output_mp4_path
