import json, os
from services.viral_detector import detect_viral_moments, compute_audio_energy_curve, find_energy_peaks
from database import SessionLocal, Transcription, Project

db = SessionLocal()

# Get the 687-segment MrBeast transcript
tx = db.query(Transcription).filter_by(project_id="97ab814e-db73-4fcf-870e-d213a9e0f73a").first()
if not tx:
    print("Transcript not found")
    exit()

data = json.loads(tx.transcript_json)
segs = data.get("segments", [])
proj = db.query(Project).filter_by(id=tx.project_id).first()

print(f"Project: {proj.title}")
print(f"Segments: {len(segs)}")
print(f"Duration: {proj.duration}s")
print(f"Audio: {proj.audio_path}")
print(f"Audio exists: {os.path.exists(proj.audio_path)}")

# Show some sample segments to see what the transcript looks like
print("\n--- SAMPLE SEGMENTS ---")
for s in segs[:5]:
    print(f"  [{s['start']:.1f}s - {s['end']:.1f}s]: {s['text']}")
print("  ...")
for s in segs[100:103]:
    print(f"  [{s['start']:.1f}s - {s['end']:.1f}s]: {s['text']}")
print("  ...")
for s in segs[-3:]:
    print(f"  [{s['start']:.1f}s - {s['end']:.1f}s]: {s['text']}")

# Test audio energy
if proj.audio_path and os.path.exists(proj.audio_path):
    curve = compute_audio_energy_curve(proj.audio_path)
    peaks = find_energy_peaks(curve)
    print(f"\nAudio: {len(curve)}s analyzed, {len(peaks)} energy peaks")
    if peaks:
        top10 = sorted(peaks, key=lambda x: x[1], reverse=True)[:10]
        for sec, intensity in top10:
            print(f"  Peak at {sec}s (intensity {intensity:.2f}x above local avg)")

# Run detection
print("\n--- RUNNING MULTI-MODAL VIRAL DETECTION ---")
clips = detect_viral_moments(data, proj.duration or 1347.0, audio_path=proj.audio_path)

print(f"\n=== DETECTED {len(clips)} VIRAL MOMENTS ===")
for c in clips:
    cdur = round(c["end_time"] - c["start_time"], 1)
    print(f'\n  [{c["clip_id"]}] "{c["title"]}"')
    print(f'    Duration: {cdur}s | Score: {c["virality_score"]} | Category: {c["category"]}')
    print(f'    Time: {c["start_time"]}s -> {c["end_time"]}s')
    print(f'    Reason: {c["reason"]}')

db.close()
