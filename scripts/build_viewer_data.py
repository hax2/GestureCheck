#!/usr/bin/env python3
"""Build the static viewer data bundle from local manifests and result JSON."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "first10_gesture_videos.json"
PROBE_DIR = ROOT / "results" / "first10_probe"
RATING_DIR = ROOT / "results" / "first10_rating"
OUTPUT = ROOT / "viewer" / "results-data.js"


def video_slug(title: str) -> str:
    stem = re.sub(r"\.(mov\.)?avi$", "", title, flags=re.IGNORECASE)
    return re.sub(r"[^A-Za-z0-9]+", "_", stem).strip("_")


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    records = []
    for item in manifest:
        slug = video_slug(item["title"])
        probe_path = PROBE_DIR / f"{Path(item['title']).stem}.probe.json"
        rating_path = RATING_DIR / f"{Path(item['title']).stem}.rating.json"
        records.append(
            {
                "title": item["title"],
                "target_word": item["target_word"],
                "video": f"assets/videos/{slug}.mp4",
                "probe": json.loads(probe_path.read_text(encoding="utf-8")),
                "rating": json.loads(rating_path.read_text(encoding="utf-8")),
            }
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(records, indent=2, ensure_ascii=False)
    OUTPUT.write_text(f"window.GESTURE_RESULTS = {payload};\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
