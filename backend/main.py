import cv2
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import config
from detector import CctvSafetyDetector

app = FastAPI(title="NirbhayaVision AI CCTV Gateway")

# Enable Cross-Origin Resource Sharing for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = CctvSafetyDetector()

def generate_video_frames(camera_id="CAM_01"):
    """Reads frames from RTSP camera, applies AI overlay, and streams MJPEG."""
    cam_info = config.CAMERAS.get(camera_id, config.CAMERAS["CAM_01"])
    cap = cv2.VideoCapture(cam_info["source"])

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        processed_frame, _ = detector.analyze_frame(frame)
        _, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()

        # MJPEG multipart stream chunk
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    
    cap.release()

@app.get("/api/video_feed/{camera_id}")
def video_feed(camera_id: str):
    """Direct video stream endpoint viewable in any browser or React app."""
    return StreamingResponse(
        generate_video_frames(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.websocket("/ws/telemetry/{camera_id}")
async def websocket_telemetry_endpoint(websocket: WebSocket, camera_id: str):
    """Streams live JSON telemetry (Threat Score, Lux, Counts) at ~20 FPS."""
    await websocket.accept()
    cam_info = config.CAMERAS.get(camera_id, config.CAMERAS["CAM_01"])
    cap = cv2.VideoCapture(cam_info["source"])

    try:
        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                await asyncio.sleep(0.1)
                continue

            _, telemetry = detector.analyze_frame(frame)
            await websocket.send_text(json.dumps(telemetry))
            await asyncio.sleep(0.05)  # 20 updates per second
    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from {camera_id}")
    finally:
        cap.release()

@app.get("/api/health")
def health():
    return {"status": "ONLINE", "cameras": list(config.CAMERAS.keys())}

if __name__ == "__main__":
    print("[STARTING] NirbhayaVision Python Edge Gateway running on http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
