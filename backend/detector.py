import cv2
import numpy as np
import time
from ultralytics import YOLO
import config

class CctvSafetyDetector:
    def __init__(self, model_name="yolov8n.pt"):
        print(f"[AI ENGINE] Loading YOLO model: {model_name}...")
        self.model = YOLO(model_name)
        # Track history for stalking / trailing detection: {track_id: [(x, y, timestamp)]}
        self.track_history = {}

    def calculate_ambient_lux(self, frame):
        """Calculates ambient illumination (Lux approximation) from frame histogram."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        # Maps 0-255 grayscale average into an approximate 0-300 Lux metric
        return int((brightness / 255.0) * 300)

    def analyze_frame(self, frame):
        """
        Runs YOLO person detection, applies Pink/Blue demographic dots,
        checks for stalking/isolation, and returns processed frame + telemetry.
        """
        h, w, _ = frame.shape
        ambient_lux = self.calculate_ambient_lux(frame)

        # Run YOLO with ByteTrack object tracking
        results = self.model.track(frame, persist=True, verbose=False, classes=[0])  # class 0 = person
        
        female_count = 0
        male_count = 0
        detected_persons = []
        stalking_detected = False

        if results and len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                track_id = int(box.id[0]) if box.id is not None else 0

                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2

                # Demographic classification (Heuristic / secondary model classifier)
                # In production, a secondary lightweight MobileNet/FairFace model classifies gender.
                is_female = (track_id % 2 == 1)  # Alternating track heuristic for demo testing
                gender = "female" if is_female else "male"

                if is_female:
                    female_count += 1
                    dot_color = (203, 90, 236)  # Pink Dot (BGR)
                    label = f"ID:{track_id} FEMALE"
                else:
                    male_count += 1
                    dot_color = (255, 178, 50)  # Sky Blue Dot (BGR)
                    label = f"ID:{track_id} MALE"

                # 1. Draw Demographic Dot on Head
                cv2.circle(frame, (center_x, y1 + 15), 9, dot_color, -1)
                cv2.circle(frame, (center_x, y1 + 15), 12, (255, 255, 255), 2)
                
                # 2. Draw Bounding Box
                cv2.rectangle(frame, (x1, y1), (x2, y2), dot_color, 2)
                cv2.putText(frame, label, (x1, max(20, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, dot_color, 2)

                detected_persons.append({
                    "track_id": track_id,
                    "gender": gender,
                    "box": [x1, y1, x2, y2],
                    "center": (center_x, center_y),
                    "conf": round(conf, 2)
                })

        # Multi-Factor Danger Scoring Logic
        threat_score = 10
        threat_level = "SAFE"

        # Condition 1: Lone female in low-light / night zone
        if female_count == 1 and ambient_lux < config.DARK_LUX_THRESHOLD:
            threat_score = 65
            threat_level = "THREAT_ELEVATED"

        # Condition 2: 1 Female surrounded or trailed by unverified male in dark corridor
        if female_count == 1 and male_count >= 1 and ambient_lux < config.DARK_LUX_THRESHOLD:
            threat_score = 92
            threat_level = "CRITICAL_DANGER"
            stalking_detected = True

        # Telemetry payload matching the React Dashboard schema
        telemetry = {
            "timestamp": time.strftime("%H:%M:%S"),
            "ambientLux": ambient_lux,
            "femaleCount": female_count,
            "maleCount": male_count,
            "threatScore": threat_score,
            "threatLevel": threat_level,
            "stalkingDetected": stalking_detected,
            "totalSubjects": len(detected_persons),
            "persons": detected_persons
        }

        return frame, telemetry
