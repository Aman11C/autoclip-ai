import os
import re
from typing import List, Dict, Any, Optional

EMOJI_KEYWORDS = {
    "MONEY": "💰",
    "DOLLAR": "💵",
    "DOLLARS": "💵",
    "CASH": "💸",
    "WIN": "🏆",
    "WINNER": "🏆",
    "WON": "🏆",
    "THOUSAND": "💰",
    "MILLION": "🚀",
    "FIRE": "🔥",
    "CRAZY": "🔥",
    "INSANE": "🤯",
    "SHOCKING": "😱",
    "SECRET": "🧠",
    "BRAIN": "🧠",
    "STOP": "🛑",
    "WAIT": "⚠️",
    "LOOK": "👀",
    "WATCH": "👀",
    "BASKETBALL": "🏀",
    "BALL": "🏀",
    "CHALLENGE": "⚔️",
    "LOVE": "❤️",
    "POWER": "⚡",
    "DANGER": "⚠️",
    "HURRY": "⚡",
    "TRUTH": "🔍",
    "FAST": "💨"
}

PRESET_STYLES = {
    "bold_viral": {
        "Fontname": "Arial Black",
        "Fontsize": "72",
        "PrimaryColour": "&H00FFFFFF",    # White
        "SecondaryColour": "&H0000FFFF",  # Yellow highlight
        "OutlineColour": "&H00000000",    # Black
        "BackColour": "&H80000000",
        "Bold": "1",
        "Italic": "0",
        "Outline": "4",
        "Shadow": "2",
        "Alignment": "2", # Bottom Center
        "MarginV": "260", # Mobile-safe (above bottom controls)
        "ActiveWordColor": "\\c&H00D7FF&", # Rich Yellow
    },
    "neon_highlight": {
        "Fontname": "Impact",
        "Fontsize": "76",
        "PrimaryColour": "&H00FFFFFF",    # White
        "SecondaryColour": "&H0000FF00",  # Neon Green
        "OutlineColour": "&H001A0B2E",    # Dark Purple
        "BackColour": "&H80000000",
        "Bold": "1",
        "Italic": "0",
        "Outline": "5",
        "Shadow": "3",
        "Alignment": "2",
        "MarginV": "280",
        "ActiveWordColor": "\\c&H39FF14&", # Neon Lime
    },
    "minimal_pro": {
        "Fontname": "Segoe UI",
        "Fontsize": "56",
        "PrimaryColour": "&H00F0F0F0",
        "SecondaryColour": "&H0038BDF8",  # Electric Blue
        "OutlineColour": "&H00111827",
        "BackColour": "&H99000000",
        "Bold": "1",
        "Italic": "0",
        "Outline": "2",
        "Shadow": "1",
        "Alignment": "2",
        "MarginV": "240",
        "ActiveWordColor": "\\c&H38BDF8&", # Clean Blue
    },
    "gaming_captions": {
        "Fontname": "Arial Black",
        "Fontsize": "78",
        "PrimaryColour": "&H00FFFFFF",
        "SecondaryColour": "&H00FF0055",  # Neon Magenta
        "OutlineColour": "&H002E004B",    # Deep violet
        "BackColour": "&HAA000000",
        "Bold": "1",
        "Italic": "1",
        "Outline": "5",
        "Shadow": "4",
        "Alignment": "2",
        "MarginV": "270",
        "ActiveWordColor": "&H00FF00E5",  # Electric Pink
    }
}

def format_ass_time(seconds: float) -> str:
    """Formats float seconds into ASS timestamp H:MM:SS.cs"""
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    cs = int(round((seconds - int(seconds)) * 100))
    if cs >= 100:
        cs = 99
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def generate_ass_subtitles(
    segments: List[Dict[str, Any]],
    clip_start: float,
    clip_end: float,
    output_ass_path: str,
    preset: str = "bold_viral",
    words_per_group: int = 2,
    hook_title: Optional[str] = None,
    auto_emojis: bool = True
) -> str:
    """Generates an Advanced SubStation Alpha (.ass) subtitle file with word-level highlight animation, Viblo-style hook card, and smart emojis."""
    os.makedirs(os.path.dirname(os.path.abspath(output_ass_path)), exist_ok=True)
    style = PRESET_STYLES.get(preset, PRESET_STYLES["bold_viral"])

    ass_header = f"""[Script Info]
Title: AutoClip AI Dynamic Captions
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style['Fontname']},{style['Fontsize']},{style['PrimaryColour']},{style['SecondaryColour']},{style['OutlineColour']},{style['BackColour']},{style['Bold']},{style['Italic']},0,0,100,100,0,0,1,{style['Outline']},{style['Shadow']},{style['Alignment']},60,60,{style['MarginV']},1
Style: TopHook,Impact,52,&H00FFFFFF,&H0000FFFF,&H000B0314,&H90000000,1,0,0,0,100,100,0,0,1,5,3,8,50,50,170,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    dialogue_lines: List[str] = []

    # 1. Viblo-Style Top Hook Header Pill (appears during first 4.5s)
    if hook_title:
        clean_hook = re.sub(r'^[>\s\-:]+', '', hook_title).strip().upper()
        if len(clean_hook) > 40:
            clean_hook = clean_hook[:37] + "..."
        if clean_hook:
            hook_end_time = min(4.5, max(2.5, clip_end - clip_start))
            hook_end_str = format_ass_time(hook_end_time)
            dialogue_lines.append(f"Dialogue: 1,0:00:00.00,{hook_end_str},TopHook,,0,0,0,,{{\\an8\\bord5\\shad3\\c&H00FFFF&}}⚡ {clean_hook} ⚡")

    # 2. Flatten and filter words that fall inside [clip_start, clip_end]
    clip_words = []
    for seg in segments:
        words = seg.get("words", [])
        if not words:
            # Create synthetic word timestamps if segment has no word breakdown
            seg_text = seg.get("text", "").strip()
            tokens = seg_text.split()
            seg_start = seg.get("start", 0.0)
            seg_end = seg.get("end", 0.0)
            dur = max(0.2, (seg_end - seg_start) / max(1, len(tokens)))
            for k, token in enumerate(tokens):
                w_s = seg_start + (k * dur)
                w_e = w_s + dur
                words.append({"word": token, "start": w_s, "end": w_e})

        for w in words:
            w_start = float(w.get("start", 0))
            w_end = float(w.get("end", 0))
            if w_end > clip_start and w_start < clip_end:
                # Relative time inside the clip
                rel_start = max(0.0, w_start - clip_start)
                rel_end = min(clip_end - clip_start, w_end - clip_start)
                raw_token = w.get("word", "").upper()
                clean_word = re.sub(r'[^\w\s\$\%\'\-]', '', raw_token)
                
                # Viblo smart emoji injection
                emoji_tag = ""
                if auto_emojis and clean_word in EMOJI_KEYWORDS:
                    emoji_tag = f" {EMOJI_KEYWORDS[clean_word]}"

                if clean_word:
                    clip_words.append({
                        "word": clean_word + emoji_tag,
                        "rel_start": rel_start,
                        "rel_end": max(rel_start + 0.1, rel_end)
                    })

    if not clip_words:
        # Default safety text
        ass_content = ass_header + "Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,WATCH THIS\n"
        with open(output_ass_path, "w", encoding="utf-8") as f:
            f.write(ass_content)
        return output_ass_path

    # Group words into 1-3 words chunks with active-word highlight
    chunk_size = words_per_group
    for i in range(0, len(clip_words), chunk_size):
        chunk = clip_words[i:i + chunk_size]
        group_start = chunk[0]["rel_start"]
        group_end = chunk[-1]["rel_end"]
        # Ensure minimum duration
        if group_end <= group_start:
            group_end = group_start + 0.4

        # For this chunk, create sub-frames where each word is highlighted in sequence
        for active_idx, target_word in enumerate(chunk):
            w_start = target_word["rel_start"]
            w_end = target_word["rel_end"] if active_idx == len(chunk) - 1 else chunk[active_idx + 1]["rel_start"]
            
            # Build text where active word has styling override tag
            word_elements = []
            for j, w in enumerate(chunk):
                if j == active_idx:
                    # Highlighted active word with pop effect
                    active_tag = f"{{\\fscx108\\fscy108{style['ActiveWordColor']}}}{w['word']}{{\\r}}"
                    word_elements.append(active_tag)
                else:
                    word_elements.append(f"{{\\fscx100\\fscy100}}{w['word']}")

            chunk_text = " ".join(word_elements)
            start_str = format_ass_time(w_start)
            end_str = format_ass_time(w_end)
            dialogue_lines.append(f"Dialogue: 0,{start_str},{end_str},Default,,0,0,0,,{chunk_text}")

    full_ass = ass_header + "\n".join(dialogue_lines) + "\n"
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(full_ass)

    return output_ass_path
