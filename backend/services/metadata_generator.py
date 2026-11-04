import re
import html
from typing import Dict, Any, List

# Category-specific hashtag and keyword mappings
CATEGORY_METADATA = {
    "Storytelling": {
        "emojis": ["📖", "🤯", "🔥", "👀"],
        "hashtags": ["#storytime", "#truestory", "#mindblowing", "#podcast", "#drama"],
        "tags": ["storytime", "true story", "insane story", "podcast story", "viral moment", "storytelling"]
    },
    "Controversial Take": {
        "emojis": ["😱", "🔥", "🤫", "🚨"],
        "hashtags": ["#controversial", "#hotfake", "#unpopularopinion", "#debate", "#truth"],
        "tags": ["hot take", "unpopular opinion", "debate", "exposed", "truth", "viral clips"]
    },
    "Educational": {
        "emojis": ["🧠", "💡", "🎯", "🚀"],
        "hashtags": ["#knowledge", "#learnontiktok", "#lifehack", "#education", "#tips"],
        "tags": ["life hack", "did you know", "educational shorts", "mindset", "productivity", "insights"]
    },
    "Comedy/Punchline": {
        "emojis": ["😂", "💀", "🤣", "😭"],
        "hashtags": ["#funny", "#comedy", "#hilarious", "#lol", "#humor"],
        "tags": ["funny shorts", "comedy", "hilarious moment", "lol", "try not to laugh", "funniest moments"]
    },
    "Mind-Blowing Fact": {
        "emojis": ["🤯", "🛸", "🧠", "✨"],
        "hashtags": ["#mindblown", "#science", "#crazyfacts", "#facts", "#unbelievable"],
        "tags": ["mind blowing facts", "crazy facts", "unbelievable", "did you know", "interesting facts"]
    },
    "High Energy": {
        "emojis": ["⚡", "🔥", "🚀", "💥"],
        "hashtags": ["#energy", "#hype", "#viral", "#intense", "#action"],
        "tags": ["high energy", "hype", "intense moment", "viral clip", "insane reaction"]
    },
    "Emotional Peak": {
        "emojis": ["🥺", "❤️", "😭", "🙏"],
        "hashtags": ["#emotional", "#wholesome", "#heartwarming", "#inspiring", "#feels"],
        "tags": ["emotional moment", "inspiring story", "wholesome", "heartwarming", "feel good"]
    },
    "Challenge/Competition": {
        "emojis": ["🏆", "🔥", "💰", "🥊"],
        "hashtags": ["#challenge", "#competition", "#winner", "#stakes", "#bet"],
        "tags": ["challenge", "impossible challenge", "bet", "high stakes", "winner", "competition"]
    }
}

DEFAULT_META = {
    "emojis": ["🔥", "🤯", "👀", "✨"],
    "hashtags": ["#shorts", "#viral", "#trending", "#fyp"],
    "tags": ["shorts", "youtube shorts", "viral video", "trending", "fyp", "podcast clips"]
}

def clean_text_snippet(raw: str) -> str:
    """Cleans up transcript text by removing XML entities, tags, and extra spaces."""
    if not raw:
        return ""
    text = html.unescape(raw)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'&[a-zA-Z0-9#]+;', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_youtube_title(base_title: str, category: str, transcript_snippet: str = "") -> str:
    """
    Generates a high-CTR, clickbait YouTube Shorts title strictly under 100 characters.
    Format: [Emoji] [High-CTR Hook] [Emoji] #shorts
    """
    cat_info = CATEGORY_METADATA.get(category, DEFAULT_META)
    emoji_lead = cat_info["emojis"][0]
    emoji_trail = cat_info["emojis"][1] if len(cat_info["emojis"]) > 1 else "🔥"

    clean_title = clean_text_snippet(base_title)
    if not clean_title:
        clean_title = "The Most Shocking Moment Ever"

    # Remove existing #shorts or hashtags if already present
    clean_title = re.sub(r'#\w+', '', clean_title).strip()
    clean_title = clean_title.rstrip(".-_!?: ")

    # If base title doesn't look clickbaity or is too plain, enhance it
    lower_title = clean_title.lower()
    needs_hook = not any(w in lower_title for w in ["why", "how", "what", "secret", "never", "this", "insane", "truth", "shocking", "wait", "ever", "?"])

    if needs_hook and len(clean_title) < 45:
        templates = [
            f"The Truth About {clean_title}",
            f"Why Nobody Talks About {clean_title}",
            f"Wait, Did He Really Just Say {clean_title}?",
            f"The Craziest Thing About {clean_title}",
        ]
        # Pick one that fits well
        clean_title = templates[len(clean_title) % len(templates)]

    # Add question mark or exclamation if not punctuated
    if not clean_title.endswith(("?", "!", "‽")):
        clean_title += "!"

    # Candidate title
    title_candidate = f"{emoji_lead} {clean_title} {emoji_trail} #shorts"

    # Strict YouTube 100 character cap
    if len(title_candidate) > 100:
        # Shorten base title so that the total length with emoji and #shorts stays <= 98 chars
        suffix = f" {emoji_trail} #shorts"
        prefix = f"{emoji_lead} "
        allowed_base_len = 100 - len(prefix) - len(suffix)
        words = clean_title.split()
        shortened = ""
        for w in words:
            if len(shortened) + len(w) + 1 <= allowed_base_len:
                shortened = f"{shortened} {w}".strip()
            else:
                break
        if not shortened.endswith(("?", "!")):
            shortened += "!"
        title_candidate = f"{prefix}{shortened}{suffix}"

    # Final safety check
    if len(title_candidate) > 100:
        title_candidate = title_candidate[:92].strip() + " #shorts"

    return title_candidate


def generate_youtube_description(
    clip_title: str,
    category: str,
    transcript_snippet: str = "",
    project_title: str = "",
    virality_score: int = 85
) -> str:
    """
    Generates a structured, SEO-optimized YouTube Shorts description:
    - First 2 lines hook viewers browsing on mobile
    - Bulleted highlights
    - Hashtags cluster
    - Call to action
    - Video attribution
    """
    cat_info = CATEGORY_METADATA.get(category, DEFAULT_META)
    clean_snippet = clean_text_snippet(transcript_snippet)
    if clean_snippet and len(clean_snippet) > 220:
        clean_snippet = clean_snippet[:220].rsplit(' ', 1)[0] + "..."

    # Top hook preview (mobile visible)
    hook_lines = [
        f"You won't believe what happens in this clip! 🤯",
        f"Wait until you see how this plays out... 👀",
        f"Is this the craziest moment ever recorded? 🔥",
        f"The secret nobody in the industry will tell you! 🤫"
    ]
    primary_hook = hook_lines[hash(clip_title) % len(hook_lines)]

    # Build curated hashtag list
    base_hashtags = ["#shorts", "#viral", "#trending", "#fyp", "#youtubeshorts"]
    custom_hashtags = [h for h in cat_info.get("hashtags", []) if h not in base_hashtags]
    all_hashtags = " ".join(base_hashtags + custom_hashtags[:4])

    lines = []
    lines.append(f"{primary_hook}")
    lines.append("")
    if clean_snippet:
        lines.append(f'"{clean_snippet}"')
        lines.append("")

    lines.append("📌 Key Highlights:")
    lines.append(f"• Clip Topic: {clip_title}")
    lines.append(f"• Vibe / Category: {category}")
    lines.append(f"• Virality Index: {virality_score}% retention hook")
    lines.append("")

    lines.append("👉 Drop a LIKE and SUBSCRIBE for daily viral clips and podcast highlights!")
    lines.append("💬 What are your thoughts on this? Drop a comment below 👇")
    lines.append("")

    if project_title:
        clean_proj = clean_text_snippet(project_title)
        lines.append(f"🎬 Full Original Episode: {clean_proj}")
        lines.append("")

    lines.append(all_hashtags)

    return "\n".join(lines)


def generate_youtube_tags(clip_title: str, category: str, project_title: str = "") -> str:
    """
    Generates high-ranking comma-separated tags ready to paste into YouTube Studio's tag box.
    """
    cat_info = CATEGORY_METADATA.get(category, DEFAULT_META)
    core_tags = [
        "shorts",
        "youtube shorts",
        "viral shorts",
        "trending shorts",
        "fyp",
        "viral video",
        "shorts feed",
        "viral podcast clips"
    ]

    niche_tags = cat_info.get("tags", [])
    
    # Extract keywords from title
    clean_words = [w.lower() for w in re.findall(r'[a-zA-Z0-9]+', clip_title) if len(w) > 3]
    meaningful_words = [w for w in clean_words if w not in {"what", "this", "that", "with", "from", "have", "been", "were"}]

    all_tags = []
    for t in core_tags + niche_tags + meaningful_words[:4]:
        if t and t not in all_tags:
            all_tags.append(t)

    if project_title:
        proj_clean = re.sub(r'[^a-zA-Z0-9\s]', '', project_title).strip().lower()
        if proj_clean and len(proj_clean) <= 30 and proj_clean not in all_tags:
            all_tags.append(proj_clean)

    return ", ".join(all_tags)


def generate_youtube_metadata(
    clip_title: str,
    category: str = "Storytelling",
    transcript_snippet: str = "",
    project_title: str = "",
    virality_score: int = 85
) -> Dict[str, Any]:
    """
    Master function returning complete YouTube Shorts metadata bundle.
    """
    yt_title = generate_youtube_title(clip_title, category, transcript_snippet)
    yt_desc = generate_youtube_description(clip_title, category, transcript_snippet, project_title, virality_score)
    yt_tags = generate_youtube_tags(clip_title, category, project_title)

    return {
        "youtube_title": yt_title,
        "youtube_description": yt_desc,
        "youtube_tags": yt_tags
    }
