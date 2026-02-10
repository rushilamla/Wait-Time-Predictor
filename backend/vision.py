"""
Computer vision utilities for estimating queue size from an uploaded image.

Hackathon-friendly approach:
- Use a lightweight, pre-trained object detection model to count people.
- We count detections of class "person" and treat that as queue size.

Notes:
- This is an approximation. Crowded scenes, occlusions, camera angle, and lighting affect accuracy.
"""

from __future__ import annotations

from io import BytesIO
from typing import Optional


_yolo_model = None


def _get_model():
    """
    Lazy-load the YOLO model on first use.
    This avoids loading weights at import time and speeds up cold start.
    """
    global _yolo_model
    if _yolo_model is None:
        # Ultralytics will download weights if not present.
        from ultralytics import YOLO

        _yolo_model = YOLO("yolov8n.pt")  # small, fast model
    return _yolo_model


def estimate_queue_size_from_image(
    image_bytes: bytes,
    conf_threshold: float = 0.35,
    max_people: int = 500,
) -> int:
    """
    Estimate queue size by counting people in an image.

    Args:
        image_bytes: Raw image bytes (jpg/png/etc)
        conf_threshold: Detection confidence threshold
        max_people: Safety cap to avoid absurd counts in noisy detections

    Returns:
        Estimated number of people (>= 0)
    """
    # PIL is used to decode image bytes robustly.
    from PIL import Image

    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    model = _get_model()

    # Run inference
    results = model.predict(img, conf=conf_threshold, verbose=False)
    if not results:
        return 0

    r0 = results[0]

    # `r0.boxes.cls` contains class ids for each detection
    # YOLO COCO class id 0 == "person"
    person_class_id = 0
    people = 0
    try:
        if r0.boxes is None:
            people = 0
        else:
            cls = r0.boxes.cls
            if cls is None:
                people = 0
            else:
                # cls can be a tensor; convert to list of ints
                cls_list = [int(x) for x in cls.tolist()]
                people = sum(1 for c in cls_list if c == person_class_id)
    except Exception:
        # Defensive fallback
        people = 0

    return max(0, min(int(people), int(max_people)))

