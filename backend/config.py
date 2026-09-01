import os

# Camera Streams (Use 0 for Laptop/USB Webcam, or RTSP URL for real CCTV)
# Examples:
# Hikvision: "rtsp://admin:12345@192.168.1.64:554/Streaming/Channels/101"
# Dahua/CP-Plus: "rtsp://admin:12345@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0"
CAMERAS = {
    "CAM_01": {
        "id": "CAM_01",
        "name": "North Gate Perimeter",
        "source": os.getenv("CAM_01_RTSP", 0),  # Defaults to default webcam if no RTSP set
        "zone": "Perimeter Walkway",
    },
    "CAM_02": {
        "id": "CAM_02",
        "name": "Library Back Alley",
        "source": os.getenv("CAM_02_RTSP", "rtsp://admin:pass@192.168.1.65:554/live"),
        "zone": "Library Isolated Alley",
    }
}

# AI Safety Thresholds
DARK_LUX_THRESHOLD = 30           # Lux under 30 is flagged as dangerous darkness
STALKING_DISTANCE_PIXELS = 120    # Proximity threshold between pursuer and target
STALKING_TIME_SECONDS = 5.0       # Consecutive seconds of trailing before auto-escalation
POLICE_EMERGENCY_NUMBER = "112"
