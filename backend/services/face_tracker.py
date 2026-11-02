import os
import cv2
import numpy as np
from typing import Dict, Any, List, Tuple

def compute_smart_crop_centers(video_path: str, start_time: float, end_time: float, sample_fps: float = 1.0) -> Dict[str, Any]:
    """Analyzes face positions and subject movement using fast downsampled OpenCV face tracking.
    Returns smoothed horizontal center offset percentage (0.0 to 1.0) and optimal 9:16 crop box.
    """
    default_res = {"avg_center_x": 0.5, "smoothed_path": [(0.0, 0.5)], "width": 1920, "height": 1080}
    
    if not os.path.exists(video_path):
        return default_res

    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return default_res

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1920
        height = cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1080

        start_frame = int(start_time * fps)
        end_frame = int(end_time * fps)
        frame_step = max(1, int(fps / sample_fps))

        # Safely attempt to initialize face detector
        face_cascade = None
        try:
            if hasattr(cv2, 'CascadeClassifier') and hasattr(cv2, 'data') and hasattr(cv2.data, 'haarcascades'):
                cascade_path = os.path.join(cv2.data.haarcascades, 'haarcascade_frontalface_default.xml')
                if os.path.exists(cascade_path):
                    detector = cv2.CascadeClassifier(cascade_path)
                    if not detector.empty():
                        face_cascade = detector
        except Exception as e:
            print(f"[FaceTracker] Warning: CascadeClassifier initialization bypassed: {e}")
            face_cascade = None

        raw_centers: List[Tuple[float, float]] = [] # (time, center_x_ratio)
        duration = max(1.0, end_time - start_time)
        num_samples = max(4, min(10, int(duration / 3.0)))
        sample_times = [start_time + (k * (duration / num_samples)) for k in range(num_samples)]
        
        for st_time in sample_times:
            frame_idx = int(st_time * fps)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                continue
                
            center_x = 0.5
            if face_cascade is not None:
                try:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    small_gray = cv2.resize(gray, (480, 270))
                    faces = face_cascade.detectMultiScale(
                        small_gray,
                        scaleFactor=1.2,
                        minNeighbors=3,
                        minSize=(25, 25)
                    )
                    if len(faces) > 0:
                        # Largest face = primary speaker
                        largest_face = max(faces, key=lambda f: f[2] * f[3])
                        fx, fy, fw, fh = largest_face
                        center_x = (fx + fw / 2.0) / 480.0
                except Exception:
                    center_x = 0.5
            
            raw_centers.append((st_time - start_time, center_x))

        cap.release()

        if not raw_centers:
            return default_res

        # Apply Exponential Moving Average (EMA) smoothing to eliminate camera shake/jitter
        alpha = 0.25
        smoothed_centers = []
        current_smooth = raw_centers[0][1]
        
        for t, raw_x in raw_centers:
            current_smooth = (alpha * raw_x) + ((1.0 - alpha) * current_smooth)
            # Clamp crop center so 9:16 frame stays within video bounds
            crop_w = int(height * 9 / 16)
            min_center = (crop_w / 2.0) / width
            max_center = 1.0 - min_center
            clamped = max(min_center, min(max_center, current_smooth))
            smoothed_centers.append((round(t, 2), round(clamped, 3)))

        avg_center_x = float(np.mean([x for _, x in smoothed_centers]))
        
        return {
            "avg_center_x": round(avg_center_x, 3),
            "smoothed_path": smoothed_centers,
            "width": int(width),
            "height": int(height)
        }
    except Exception as e:
        print(f"[FaceTracker] Unexpected error: {e}. Falling back to center crop.")
        return default_res

    avg_center_x = float(np.mean([x for _, x in smoothed_centers]))
    
    return {
        "avg_center_x": round(avg_center_x, 3),
        "smoothed_path": smoothed_centers,
        "width": width,
        "height": height
    }
