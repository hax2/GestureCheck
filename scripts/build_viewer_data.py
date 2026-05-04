#!/usr/bin/env python3
"""Build the static viewer data bundle from local manifests and result JSON."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = [
    ROOT / "results-data.js",
    ROOT / "viewer" / "results-data.js",
]

COLLECTIONS = [
    {
        "name": "Object videos",
        "manifest": ROOT / "first10_object_videos.json",
        "default_model": "pro",
        "models": [
            {
                "key": "pro",
                "label": "Pro",
                "model": "gemini-3.1-pro-preview",
                "probe_dir": ROOT / "results" / "object10_probe_pro",
                "rating_dir": ROOT / "results" / "object10_rating_pro",
            },
        ],
    },
    {
        "name": "Gesture videos",
        "manifest": ROOT / "first10_gesture_videos.json",
        "default_model": "pro",
        "models": [
            {
                "key": "flash",
                "label": "Flash",
                "model": "gemini-3.1-flash-lite-preview",
                "probe_dir": ROOT / "results" / "first10_probe",
                "rating_dir": ROOT / "results" / "first10_rating",
            },
            {
                "key": "pro",
                "label": "Pro",
                "model": "gemini-3.1-pro-preview",
                "probe_dir": ROOT / "results" / "first10_probe_pro",
                "rating_dir": ROOT / "results" / "first10_rating_pro",
            },
        ],
    },
]


def video_slug(title: str) -> str:
    stem = re.sub(r"\.(mov\.)?avi$", "", title, flags=re.IGNORECASE)
    return re.sub(r"[^A-Za-z0-9]+", "_", stem).strip("_")


def main() -> int:
    records = []
    for collection in COLLECTIONS:
        manifest = json.loads(collection["manifest"].read_text(encoding="utf-8"))
        for item in manifest:
            slug = video_slug(item["title"])
            variants = []
            for model_config in collection["models"]:
                probe_path = model_config["probe_dir"] / f"{Path(item['title']).stem}.probe.json"
                rating_path = model_config["rating_dir"] / f"{Path(item['title']).stem}.rating.json"
                variants.append(
                    {
                        "key": model_config["key"],
                        "label": model_config["label"],
                        "model": model_config["model"],
                        "probe": json.loads(probe_path.read_text(encoding="utf-8")),
                        "rating": json.loads(rating_path.read_text(encoding="utf-8")),
                    }
                )
            default_variant = next(
                variant for variant in variants if variant["key"] == collection["default_model"]
            )
            records.append(
                {
                    "collection": collection["name"],
                    "default_model": collection["default_model"],
                    "model": default_variant["model"],
                    "title": item["title"],
                    "target_word": item["target_word"],
                    "video": f"assets/videos/{slug}.mp4",
                    "probe": default_variant["probe"],
                    "rating": default_variant["rating"],
                    "variants": variants,
                }
            )

    payload = json.dumps(records, indent=2, ensure_ascii=False)
    for output in OUTPUTS:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(f"window.GESTURE_RESULTS = {payload};\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
