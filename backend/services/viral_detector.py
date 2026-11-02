import os
import json
import re
import html
import math
import subprocess
import struct
import wave
from typing import List, Dict, Any, Optional, Tuple

# ─────────────────────────────────────────────────────────────────────
# VIBLO-STYLE MULTI-MODAL VIRAL MOMENT DETECTOR
# ─────────────────────────────────────────────────────────────────────
# Instead of randomly sliding a window through segments, this detector
# uses 3 analysis layers (like Viblo.ai):
#
#   1) AUDIO ENERGY ANALYSIS  – RMS loudness curve from the WAV file
#      to find volume spikes, laughter, reactions, crowd noise, and
#      passionate delivery.
#
#   2) SEMANTIC / NARRATIVE ARC ANALYSIS – NLP scoring of the transcript
#      to find self-contained story arcs with a HOOK → BUILDUP → PAYOFF
#      structure, curiosity gaps, questions, contrasts, revelations.
#
#   3) PACING & SPEECH DYNAMICS – Speaking rate changes, dramatic pauses,
#      sudden silence-to-speech transitions that signal emotional peaks.
#
# The three scores are fused into a single "virality heat curve" and
# clips are extracted from the peaks of that curve, with boundaries
# snapped to clean sentence edges.
# ─────────────────────────────────────────────────────────────────────

FFPROBE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "ffprobe.exe"))
FFMPEG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "bin", "ffmpeg.exe"))
if not os.path.exists(FFPROBE_PATH):
    FFPROBE_PATH = "ffprobe"
if not os.path.exists(FFMPEG_PATH):
    FFMPEG_PATH = "ffmpeg"

# ── AI System Prompt ────────────────────────────────────────────────

SYSTEM_VIRAL_PROMPT = """You are a world-class viral content strategist who has edited clips for channels with 100M+ subscribers.
Your task: analyze the full transcript and find the BEST 5–10 standalone moments that would go viral as YouTube Shorts / TikTok / Reels.

WHAT MAKES A MOMENT VIRAL (in priority order):
1. STRONG HOOK (first 2-3 seconds): An unexpected statement, bold claim, question, or visual surprise that stops the scroll.
2. COMPLETE NARRATIVE ARC: Setup → Tension/Buildup → Payoff/Punchline/Resolution. The viewer must feel satisfied at the end.
3. EMOTIONAL PEAK: Laughter, shock, anger, awe, fear, joy — clips that trigger strong emotion get shared.
4. CURIOSITY GAP: Creates a question in the viewer's mind that MUST be answered before they swipe away.
5. QUOTABLE / SHAREABLE: Contains a memorable line, hot take, or mind-blowing fact people would screenshot or quote.
6. STANDALONE CONTEXT: A new viewer who has NEVER seen the full video can understand and enjoy this clip on its own.

WHAT TO AVOID:
- Random middle-of-conversation fragments with no beginning or end.
- Clips that start mid-sentence or end before the thought is finished.
- Boring introductions, greetings, "hey guys", channel plugs, sponsor reads.
- Moments that require prior context from the video to make sense.
- Repetitive moments — each clip must cover a DIFFERENT topic or scene.

CLIP STRUCTURE:
- Duration: 30–60 seconds ideal, never under 20s or over 90s.
- Start 0.5s BEFORE the hook line begins (breathing room).
- End 0.5s AFTER the final punchline/conclusion lands.
- Title: A clickbait-worthy 3-6 word title that would make someone click.

Return ONLY valid JSON array:
[
  {
    "clip_id": "clip_001",
    "title": "Clickbait Title Here",
    "start_time": 45.5,
    "end_time": 88.2,
    "virality_score": 94,
    "reason": "Why this specific moment would go viral — be specific about the hook, buildup, and payoff",
    "category": "Storytelling"
  }
]

Categories: "Storytelling", "Controversial Take", "Educational", "Comedy/Punchline", "Mind-Blowing Fact", "High Energy", "Emotional Peak", "Challenge/Competition".
Order clips by virality_score descending. Scores should range 75-98 with genuine differentiation."""


# ── 1. AUDIO ENERGY ANALYSIS ────────────────────────────────────────

def compute_audio_energy_curve(audio_path: str, window_sec: float = 1.0) -> List[float]:
    """
    Computes per-second RMS loudness from a WAV file.
    Returns a list where index i = RMS energy of second i.
    High values = loud moments (reactions, laughter, emphasis, crowd noise).
    """
    if not audio_path or not os.path.exists(audio_path):
        return []

    try:
        with wave.open(audio_path, 'rb') as wf:
            n_channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            frame_rate = wf.getframerate()
            n_frames = wf.getnframes()

            samples_per_window = int(frame_rate * window_sec)
            energy_curve = []

            while True:
                frames = wf.readframes(samples_per_window)
                if not frames:
                    break

                if sample_width == 2:
                    fmt = f"<{len(frames) // 2}h"
                    try:
                        samples = struct.unpack(fmt, frames)
                    except struct.error:
                        break
                else:
                    # 1-byte unsigned or other — skip
                    energy_curve.append(0.0)
                    continue

                # If stereo, average channels
                if n_channels == 2:
                    mono = [(samples[i] + samples[i + 1]) / 2.0
                            for i in range(0, len(samples) - 1, 2)]
                else:
                    mono = list(samples)

                if not mono:
                    energy_curve.append(0.0)
                    continue

                rms = math.sqrt(sum(s * s for s in mono) / len(mono))
                energy_curve.append(rms)

        return energy_curve
    except Exception as e:
        print(f"[ViralDetector] Audio energy analysis failed: {e}")
        return []


def find_energy_peaks(energy_curve: List[float], min_peak_ratio: float = 1.4) -> List[Tuple[int, float]]:
    """
    Finds seconds where audio energy is significantly above the local average.
    Returns list of (second, peak_intensity) tuples.
    """
    if len(energy_curve) < 5:
        return []

    # Compute running average (±5s window)
    peaks = []
    for i in range(len(energy_curve)):
        window_start = max(0, i - 5)
        window_end = min(len(energy_curve), i + 6)
        local_avg = sum(energy_curve[window_start:window_end]) / (window_end - window_start)

        if local_avg > 0 and energy_curve[i] > local_avg * min_peak_ratio:
            peak_intensity = energy_curve[i] / local_avg
            peaks.append((i, peak_intensity))

    return peaks


# ── 2. SEMANTIC / NARRATIVE ARC SCORING ──────────────────────────────

# Hook triggers: words/phrases that create an immediate attention grab
HOOK_PATTERNS = [
    # Questions & curiosity gaps
    (r'\b(what if|did you know|have you ever|can you|why do|how does|imagine|guess what)\b', 20),
    (r'\?', 12),  # Any question
    # Contrarian / controversial
    (r'\b(nobody|no one|everyone thinks|most people|they don\'t want|the truth is|actually|here\'s the thing)\b', 18),
    (r'\b(wrong|lie|myth|fake|scam|controversial|unpopular opinion)\b', 16),
    # Superlatives & extremes
    (r'\b(biggest|craziest|insane|most|best|worst|never|ever|first time|only)\b', 14),
    (r'\b(secret|hidden|trick|hack|formula|cheat code|shortcut)\b', 15),
    # Numbers & specifics (create credibility hooks)
    (r'\b\d+[,.]?\d*\s*(million|billion|thousand|percent|dollars|years)\b', 16),
    (r'\$[\d,]+', 14),
    # Emotional triggers
    (r'\b(died|killed|destroyed|exploded|broke|crying|screaming|shocked|terrified)\b', 18),
    (r'\b(won|lost|beat|crushed|dominated|failed|gave up)\b', 12),
    # Story markers
    (r'\b(suddenly|then|but then|out of nowhere|plot twist|wait|hold on|listen)\b', 14),
    (r'\b(so basically|long story short|here\'s what happened)\b', 12),
    # Challenge / competition
    (r'\b(challenge|bet|dare|competition|race|versus|vs|fight|battle)\b', 14),
    (r'\b(money|cash|prize|reward|win|winner|loser)\b', 12),
]

# Payoff markers: words/phrases that signal a conclusion or punchline
PAYOFF_PATTERNS = [
    (r'\b(and that\'s|so that\'s|that\'s why|that\'s how|turns out|the point is|bottom line)\b', 15),
    (r'\b(finally|in the end|at the end|after all|it worked|it didn\'t work)\b', 12),
    (r'[!]{1,3}$', 10),  # Exclamation = emphasis/conclusion
    (r'\b(won|lost|made it|didn\'t make it|survived|didn\'t survive)\b', 14),
    (r'\b(mind blown|unbelievable|incredible|impossible|game changer)\b', 12),
]

# Filler / dead content to penalize
FILLER_PATTERNS = [
    (r'\b(subscribe|like and subscribe|hit the bell|notification|link in description|use code)\b', -25),
    (r'\b(hey guys|what\'s up|welcome back|today we\'re going to|before we start)\b', -20),
    (r'\b(sponsored by|thanks to|brought to you by|check out)\b', -20),
    (r'\b(um+|uh+|like like|you know what i mean)\b', -8),
]


def score_text_virality(text: str) -> Dict[str, float]:
    """
    Scores a text passage for viral potential using NLP pattern matching.
    Returns dict with sub-scores: hook_score, payoff_score, filler_penalty, total.
    """
    text_lower = text.lower().strip()

    hook_score = 0.0
    for pattern, weight in HOOK_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        hook_score += len(matches) * weight

    payoff_score = 0.0
    for pattern, weight in PAYOFF_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        payoff_score += len(matches) * weight

    filler_penalty = 0.0
    for pattern, weight in FILLER_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        filler_penalty += len(matches) * weight  # weight is negative

    # Unique word density (more diverse vocabulary = more interesting)
    words = text_lower.split()
    if len(words) > 5:
        vocab_richness = len(set(words)) / len(words)
    else:
        vocab_richness = 0.5

    total = hook_score + payoff_score + filler_penalty + (vocab_richness * 10)

    return {
        "hook_score": hook_score,
        "payoff_score": payoff_score,
        "filler_penalty": filler_penalty,
        "vocab_richness": vocab_richness,
        "total": total
    }


# ── 3. SPEECH PACING & DYNAMICS ──────────────────────────────────────

def compute_speech_dynamics(segments: List[Dict[str, Any]]) -> List[Dict[str, float]]:
    """
    For each segment, compute:
      - words_per_second (speaking rate)
      - pause_before (silence gap before this segment)
      - pace_change (absolute change in speaking rate vs previous)

    Dramatic moments often have:
      - Sudden pause → rapid speech (building tension then exploding)
      - Very fast speech → sudden pause (delivery then dramatic beat)
    """
    dynamics = []
    for i, seg in enumerate(segments):
        duration = max(0.1, float(seg["end"]) - float(seg["start"]))
        word_count = len(seg.get("text", "").split())
        wps = word_count / duration

        pause_before = 0.0
        if i > 0:
            pause_before = max(0.0, float(seg["start"]) - float(segments[i - 1]["end"]))

        pace_change = 0.0
        if i > 0 and dynamics:
            pace_change = abs(wps - dynamics[-1]["wps"])

        dynamics.append({
            "index": i,
            "start": float(seg["start"]),
            "end": float(seg["end"]),
            "wps": wps,
            "pause_before": pause_before,
            "pace_change": pace_change,
            "word_count": word_count
        })

    return dynamics


# ── MAIN DETECTION PIPELINE ─────────────────────────────────────────

def detect_viral_moments(
    transcript_data: Dict[str, Any],
    video_duration: float = 300.0,
    audio_path: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Viblo-style multi-modal viral moment detection.
    Analyzes transcript + audio energy + speech dynamics to find
    genuinely interesting, self-contained moments.
    """
    segments = transcript_data.get("segments", [])
    if not segments:
        return []

    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    # ── Try AI-powered detection first (OpenAI / Gemini) ──
    if openai_key:
        try:
            result = _detect_with_openai(segments, video_duration, openai_key)
            if result:
                return result
        except Exception as e:
            print(f"[ViralDetector] OpenAI analysis failed: {e}. Trying Gemini...")

    if gemini_key:
        try:
            result = _detect_with_gemini(segments, video_duration, gemini_key)
            if result:
                return result
        except Exception as e:
            print(f"[ViralDetector] Gemini analysis failed: {e}. Falling back to multi-modal algorithmic analysis...")

    # ── Multi-Modal Algorithmic Analysis (Viblo-style) ──
    print("[ViralDetector] Running multi-modal viral moment analyzer (audio energy + NLP semantics + pacing).")
    return _analyze_multimodal(segments, video_duration, audio_path)


def _detect_with_openai(segments, video_duration, api_key):
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    formatted = "\n".join([
        f"[{seg['start']:.1f}s - {seg['end']:.1f}s]: {seg['text']}"
        for seg in segments
    ])
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_VIRAL_PROMPT},
            {"role": "user", "content": f"Video duration: {video_duration}s.\nFull transcript:\n{formatted}"}
        ],
        temperature=0.7
    )
    clips = parse_json_clips(response.choices[0].message.content)
    if clips:
        return sanitize_and_deduplicate_clips(clips, segments, video_duration)
    return None


def _detect_with_gemini(segments, video_duration, api_key):
    from google import genai
    client = genai.Client(api_key=api_key)
    formatted = "\n".join([
        f"[{seg['start']:.1f}s - {seg['end']:.1f}s]: {seg['text']}"
        for seg in segments
    ])
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[SYSTEM_VIRAL_PROMPT, f"Video Duration: {video_duration}s\nTranscript:\n{formatted}"],
        config={"response_mime_type": "application/json"}
    )
    clips = parse_json_clips(response.text)
    if clips:
        return sanitize_and_deduplicate_clips(clips, segments, video_duration)
    return None


# ── MULTI-MODAL ALGORITHMIC ANALYZER ─────────────────────────────────

def _analyze_multimodal(
    segments: List[Dict[str, Any]],
    video_duration: float,
    audio_path: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Three-layer analysis:
    1. Build per-second "virality heat" from audio energy peaks
    2. Score every possible segment window for narrative arc quality
    3. Extract clips from the peaks of the combined heat curve
    """
    num_segs = len(segments)
    if num_segs < 3:
        return []

    # ── Layer 1: Audio Energy ──
    energy_curve = []
    energy_peak_set = set()
    if audio_path and os.path.exists(audio_path):
        energy_curve = compute_audio_energy_curve(audio_path)
        peaks = find_energy_peaks(energy_curve, min_peak_ratio=1.3)
        energy_peak_set = {sec for sec, _ in peaks}
        print(f"[ViralDetector] Audio energy: {len(energy_curve)}s analyzed, {len(peaks)} energy peaks found.")

    # ── Layer 2: Speech Dynamics ──
    dynamics = compute_speech_dynamics(segments)

    # ── Layer 3: Build candidate windows with multi-signal scoring ──
    # Target clip durations
    min_clip = 25.0 if video_duration < 120 else 30.0
    max_clip = min(75.0, max(40.0, video_duration * 0.35))

    candidates = []

    for i in range(num_segs):
        seg_i = segments[i]
        start_time = float(seg_i["start"])
        start_text = seg_i["text"]

        # ── Score the OPENING (hook strength) ──
        # Combine first 2-3 segments to capture the full hook
        # (YouTube auto-captions split sentences across multiple segments)
        hook_window = [seg_i["text"]]
        for k in range(i + 1, min(i + 3, num_segs)):
            if float(segments[k]["start"]) - float(seg_i["end"]) < 2.0:
                hook_window.append(segments[k]["text"])
        combined_hook = " ".join(hook_window)

        opening_nlp = score_text_virality(combined_hook)
        hook_strength = opening_nlp["hook_score"]

        # Skip segments that are clearly filler / sponsor
        if opening_nlp["filler_penalty"] < -15:
            continue

        # Bonus for dramatic pause before this segment (silence → speech = attention grab)
        if i < len(dynamics) and dynamics[i]["pause_before"] > 0.8:
            hook_strength += 12

        # Bonus for audio energy spike at the start
        start_sec = int(start_time)
        if start_sec in energy_peak_set:
            hook_strength += 10

        # Lower threshold: YouTube VTT captions rarely have punctuation,
        # so even moderate keyword hits should be considered
        if hook_strength < 4:
            continue

        # ── Search for the best ENDING (payoff) ──
        best_end = None
        best_score = -1

        for j in range(i + 3, min(i + 100, num_segs)):
            seg_j = segments[j]
            end_time = float(seg_j["end"])
            duration = end_time - start_time

            if duration < min_clip:
                continue
            if duration > max_clip:
                break

            # ── Check for clean sentence boundary ──
            end_text = seg_j["text"].strip()
            tokens = end_text.split()
            if not tokens:
                continue
            last_word = re.sub(r'[^\w\']', '', tokens[-1].lower())

            # Dangling words that indicate an incomplete thought
            dangling = {"and", "or", "but", "so", "because", "then", "like", "if",
                        "to", "with", "that", "which", "when", "as", "the", "a", "an",
                        "is", "are", "was", "were", "of", "in", "on", "for", "he",
                        "she", "they", "we", "i", "my", "this", "these", "it", "its"}

            if last_word in dangling:
                continue  # Don't cut mid-thought

            ends_punct = end_text.endswith((".", "!", "?", '"', "'"))
            has_pause_after = (j < num_segs - 1 and
                               float(segments[j + 1]["start"]) - end_time >= 0.3)

            if not ends_punct and not has_pause_after and duration < 50:
                continue  # Need a clean ending

            # ── Score the FULL WINDOW ──
            window_texts = [segments[k]["text"] for k in range(i, j + 1)]
            full_text = " ".join(window_texts)
            full_nlp = score_text_virality(full_text)

            # Too much filler in this window
            if full_nlp["filler_penalty"] < -30:
                continue

            # ── Score the ENDING (payoff quality) ──
            # Look at last 2-3 segments for payoff signals
            ending_text = " ".join(window_texts[-3:]) if len(window_texts) >= 3 else full_text
            ending_nlp = score_text_virality(ending_text)

            # ── Combined multi-signal score ──
            score = 0.0

            # Hook (30% weight)
            score += min(40, hook_strength) * 0.6

            # Semantic richness of full content (25% weight)
            score += min(30, full_nlp["total"] * 0.3)

            # Payoff/conclusion quality (20% weight)
            score += min(25, ending_nlp["payoff_score"] * 0.8)

            # Clean ending bonus (10% weight)
            if ends_punct:
                score += 12
            if has_pause_after:
                score += 8

            # Duration sweet spot bonus (5% weight)
            if 35 <= duration <= 55:
                score += 8  # Golden zone
            elif 28 <= duration <= 65:
                score += 4

            # Audio energy within clip window (10% weight)
            if energy_curve:
                clip_energy_secs = range(int(start_time), min(int(end_time), len(energy_curve)))
                energy_hits = sum(1 for s in clip_energy_secs if s in energy_peak_set)
                score += min(15, energy_hits * 3)

            # Speech dynamics: pace changes within clip (excitement indicator)
            clip_dynamics = [d for d in dynamics if d["start"] >= start_time and d["end"] <= end_time]
            if clip_dynamics:
                max_pace_change = max(d["pace_change"] for d in clip_dynamics)
                max_pause = max(d["pause_before"] for d in clip_dynamics)
                score += min(8, max_pace_change * 3)  # Sudden pace shifts = excitement
                if max_pause > 1.0:
                    score += 5  # Dramatic pause within clip

            # Vocabulary richness bonus
            score += full_nlp["vocab_richness"] * 6

            if score > best_score:
                best_score = score
                best_end = {
                    "end_seg_idx": j,
                    "end_time": end_time,
                    "duration": duration,
                    "score": score,
                    "full_text": full_text,
                    "ends_punct": ends_punct,
                    "has_pause": has_pause_after
                }

        if best_end and best_end["score"] > 15:
            # ── Generate descriptive title ──
            title = _generate_clip_title(start_text, best_end["full_text"])

            # ── Determine category ──
            category = _classify_category(best_end["full_text"])

            # ── Determine reason ──
            reason = _generate_reason(start_text, best_end, hook_strength)

            # ── Normalize score to 75-98 range ──
            raw = best_end["score"]
            normalized = int(min(98, max(75, 75 + (raw - 15) * 0.35)))

            # Padding
            padded_start = max(0.0, round(start_time - 0.3, 2))
            padded_end = min(video_duration, round(best_end["end_time"] + 0.5, 2))

            candidates.append({
                "start_time": padded_start,
                "end_time": padded_end,
                "virality_score": normalized,
                "title": title,
                "reason": reason,
                "category": category,
                "raw_score": raw,
                "duration": round(padded_end - padded_start, 1)
            })

    # ── Sort by score and deduplicate (max 8s overlap) ──
    candidates.sort(key=lambda x: x["raw_score"], reverse=True)

    selected: List[Dict[str, Any]] = []
    for c in candidates:
        overlap = False
        for s in selected:
            latest_start = max(c["start_time"], s["start_time"])
            earliest_end = min(c["end_time"], s["end_time"])
            overlap_dur = max(0.0, earliest_end - latest_start)
            min_dur = min(c["duration"], s["duration"])
            # Reject if overlap is > 10% of the shorter clip or > 4 seconds
            if overlap_dur > 4.0 or (min_dur > 0 and overlap_dur / min_dur > 0.10):
                overlap = True
                break
        if not overlap:
            selected.append(c)
        if len(selected) >= 8:
            break

    # Re-sort selected by timeline order for a natural presentation
    selected.sort(key=lambda x: x["start_time"])

    # Re-rank virality scores using raw_score spread across 78-97
    if selected:
        raw_scores = [c["raw_score"] for c in selected]
        min_raw = min(raw_scores)
        max_raw = max(raw_scores)
        score_range = max(1.0, max_raw - min_raw)
        for c in selected:
            normalized = 78 + int(((c["raw_score"] - min_raw) / score_range) * 19)
            c["virality_score"] = max(78, min(97, normalized))

    # Format with clip IDs
    formatted = []
    for idx, item in enumerate(selected):
        formatted.append({
            "clip_id": f"clip_{idx + 1:03d}",
            "title": item["title"],
            "start_time": item["start_time"],
            "end_time": item["end_time"],
            "virality_score": int(item["virality_score"]),
            "reason": item["reason"],
            "category": item["category"]
        })

    print(f"[ViralDetector] Selected {len(formatted)} viral moments from {len(candidates)} candidates.")
    return formatted


# ── HELPER FUNCTIONS ─────────────────────────────────────────────────

def _generate_clip_title(hook_text: str, full_text: str) -> str:
    """Generate a clickbait-style short title from the clip's content matching Viblo.ai standards."""
    clean_full = html.unescape(full_text)
    clean_full = re.sub(r'&gt;\s*', '', clean_full)
    clean_full = re.sub(r'>>\s*', '', clean_full)
    clean_full = re.sub(r'\[.*?\]', '', clean_full)
    clean_full = re.sub(r'\s+', ' ', clean_full).strip()

    # 1. Search for any compelling question in the clip window
    question_match = re.search(r'([A-Za-z0-9\s,\'\$]{6,50}\?)', clean_full)
    if question_match:
        q = question_match.group(1).strip()
        # Clean leading fillers from question
        q = re.sub(r'^(wait|oh|yeah|hey|question|like|so|and|but|then|now|tell me)[,\s]+', '', q, flags=re.IGNORECASE)
        words = q.split()
        if len(words) >= 3:
            return " ".join(words[:7]).capitalize()

    # 2. Search for high-impact exclamation or climax phrase
    exclaim_match = re.search(r'([A-Za-z0-9\s,\'\$]{8,50}!)', clean_full)
    if exclaim_match:
        ex = exclaim_match.group(1).strip()
        ex = re.sub(r'^(wait|oh|yeah|hey|like|so|and|but|then)[,\s]+', '', ex, flags=re.IGNORECASE)
        words = ex.split()
        if len(words) >= 3:
            return " ".join(words[:6]).title()

    # 3. Look for high-value viral keywords in the full clip
    viral_triggers = [
        r'(\$\d+[\d,]*\s*(?:dollar|challenge|cash|shot)?)',
        r'(\b(?:beat|challenge|versus|against)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',
        r'(\b(?:the secret|the truth|never|insane|crazy|impossible|terrified|freaking|winner|win)\b[^\.\,\!\?]{5,35})',
    ]
    for pattern in viral_triggers:
        match = re.search(pattern, clean_full, re.IGNORECASE)
        if match:
            found = match.group(1).strip()
            words = found.split()
            if 3 <= len(words) <= 7:
                return " ".join(words).title()

    # 4. Fallback to the hook opener, cleaned of leading stutter/fillers
    hook = html.unescape(hook_text).strip()
    hook = re.sub(r'&gt;\s*', '', hook)
    hook = re.sub(r'>>\s*', '', hook)
    hook = re.sub(r'\[.*?\]', '', hook)
    hook = re.sub(r'^(wait|oh|yeah|hey|question|like|so|and|but|then|well|okay|yes)[,\.\s]+', '', hook, flags=re.IGNORECASE)
    hook = re.sub(r'^(wait|oh|yeah|hey)[,\.\s]+', '', hook, flags=re.IGNORECASE) # double stutters
    hook = hook.strip()

    words = hook.split()
    if len(words) >= 3:
        return " ".join(words[:6]).rstrip(".,!?").title()

    # 5. Extract first 5 solid words from clean_full
    full_words = [w for w in clean_full.split() if w.lower() not in {"oh", "yeah", "hey", "like", "so", "and"}]
    if len(full_words) >= 3:
        return " ".join(full_words[:5]).rstrip(".,!?").title()

    return "Viral Moment"


def _classify_category(text: str) -> str:
    """Classify clip into a content category based on text analysis."""
    t = text.lower()

    if any(w in t for w in ["challenge", "bet", "dare", "competition", "race", "versus", "vs", "fight"]):
        return "Challenge/Competition"
    if any(w in t for w in ["funny", "hilarious", "lmao", "haha", "joke", "laugh"]):
        return "Comedy/Punchline"
    if any(w in t for w in ["shocked", "crying", "tears", "emotional", "heartbreak", "devastated"]):
        return "Emotional Peak"
    if any(w in t for w in ["controversial", "unpopular", "disagree", "wrong", "lie", "truth is"]):
        return "Controversial Take"
    if any(w in t for w in ["secret", "nobody knows", "hidden", "mind blown", "insane", "crazy"]):
        return "Mind-Blowing Fact"
    if any(w in t for w in ["learn", "study", "research", "science", "data", "percent", "formula", "strategy"]):
        return "Educational"
    if any(w in t for w in ["money", "million", "thousand", "dollar", "win", "won", "prize", "reward"]):
        return "High Energy"
    if any(w in t for w in ["story", "happened", "then", "suddenly", "one day", "remember when"]):
        return "Storytelling"

    return "Storytelling"


def _generate_reason(hook_text: str, end_info: Dict, hook_strength: float) -> str:
    """Generate a human-readable explanation of why this clip is viral."""
    parts = []

    if hook_strength >= 20:
        parts.append("Powerful attention-grabbing hook")
    elif hook_strength >= 12:
        parts.append("Strong curiosity-driven opening")
    else:
        parts.append("Engaging opening statement")

    dur = end_info["duration"]
    if 30 <= dur <= 50:
        parts.append(f"perfect {int(dur)}s duration for Shorts")
    else:
        parts.append(f"{int(dur)}s complete scene")

    if end_info["ends_punct"]:
        parts.append("clean sentence conclusion")
    if end_info["has_pause"]:
        parts.append("natural dramatic pause at ending")

    # Analyze content themes
    text_lower = end_info["full_text"].lower()
    if "?" in end_info["full_text"]:
        parts.append("curiosity gap that hooks viewers")
    if any(w in text_lower for w in ["money", "million", "thousand", "dollar"]):
        parts.append("financial stakes create urgency")
    if any(w in text_lower for w in ["challenge", "bet", "win", "lose"]):
        parts.append("competition/challenge tension")

    return ". ".join(parts[:4]) + "."


def parse_json_clips(text: str) -> List[Dict[str, Any]]:
    """Parse JSON clips from AI response text."""
    try:
        clean = text.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        clean = clean.strip()

        parsed = json.loads(clean)
        if isinstance(parsed, list):
            return parsed
        elif isinstance(parsed, dict):
            for k in ["clips", "moments", "data", "results"]:
                if k in parsed and isinstance(parsed[k], list):
                    return parsed[k]
        return []
    except Exception as e:
        print(f"[ViralDetector] JSON parse error: {e}")
        return []


def sanitize_and_deduplicate_clips(
    clips: List[Dict[str, Any]],
    segments: List[Dict[str, Any]],
    video_duration: float
) -> List[Dict[str, Any]]:
    """Validates timestamps, clamps to duration, and deduplicates AI-detected clips."""
    cleaned = []
    for i, c in enumerate(clips):
        start = max(0.0, float(c.get("start_time", 0)))
        end = min(video_duration, float(c.get("end_time", start + 30.0)))
        if end <= start + 5.0:
            end = min(video_duration, start + 30.0)

        score = int(c.get("virality_score", 85))
        score = max(50, min(99, score))

        cleaned.append({
            "clip_id": f"clip_{i + 1:03d}",
            "title": c.get("title", f"Viral Moment {i + 1}"),
            "start_time": round(start, 2),
            "end_time": round(end, 2),
            "virality_score": score,
            "reason": c.get("reason", "Strong viral potential detected by AI analysis"),
            "category": c.get("category", "Storytelling")
        })
    return cleaned
