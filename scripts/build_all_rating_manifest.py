#!/usr/bin/env python3
"""Build the full local video manifest for rating runs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "all_rating_videos.json"
SOURCES = [
    ("gesture", "local_gesture_videos", ROOT / "data" / "gesture_videos"),
    ("object", "local_object_videos", ROOT / "data" / "videos"),
]
TARGET_OVERRIDES = {
    "06_parseley.mov.AVI": "Parsley",
    "09_gießkanne.mov.AVI": "Watering Can",
    "13_violine.mov.AVI": "Violin",
    "26_radiergummi.mov.AVI": "Eraser",
    "41_mirrow.mov.AVI": "Mirror",
}


def target_word(path: Path) -> str:
    if path.name in TARGET_OVERRIDES:
        return TARGET_OVERRIDES[path.name]
    stem = path.stem
    stem = re.sub(r"^\d+[_ -]*", "", stem)
    stem = re.sub(r"\.mov$", "", stem, flags=re.IGNORECASE)
    stem = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", stem)
    words = re.split(r"[_ -]+", stem)
    return " ".join(word.capitalize() for word in words if word)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    records = []
    for collection, source, directory in SOURCES:
        for path in sorted(directory.iterdir()):
            if not path.is_file() or path.suffix.lower() != ".avi":
                continue
            records.append(
                {
                    "collection": collection,
                    "source": source,
                    "title": path.name,
                    "target_word": target_word(path),
                    "local_path": str(path.relative_to(ROOT)),
                }
            )

    args.output.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} videos to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
