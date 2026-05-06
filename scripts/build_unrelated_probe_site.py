#!/usr/bin/env python3
"""Build static data for the unrelated-title probe page."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "tests" / "unrelated_title_probe" / "manifest.json"
OUTPUT = ROOT / "unrelated-probe-data.js"
RATINGS = [
    ("iconicity", "Iconicity"),
    ("sensorimotor_imagery", "Sensorimotor imagery"),
    ("cultural_familiarity", "Cultural familiarity"),
]


def video_slug(title: str) -> str:
    stem = Path(title).stem
    return re.sub(r"[^A-Za-z0-9]+", "_", stem).strip("_")


def read_result(model: str, title: str) -> dict[str, Any]:
    path = ROOT / "results" / f"unrelated_title_{model}" / f"{Path(title).stem}.rating.json"
    return json.loads(path.read_text(encoding="utf-8"))


def score(result: dict[str, Any], key: str) -> int:
    value = result["ratings"][key]["score"]
    if not isinstance(value, int):
        raise TypeError(f"{key} score is not an integer")
    return value


def main() -> int:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    rows = []
    for item in manifest:
        flash = read_result("flash", item["title"])
        pro = read_result("pro", item["title"])
        ratings = {}
        for key, label in RATINGS:
            ratings[key] = {
                "label": label,
                "flash": {
                    "score": score(flash, key),
                    "rationale": flash["ratings"][key]["rationale"],
                },
                "pro": {
                    "score": score(pro, key),
                    "rationale": pro["ratings"][key]["rationale"],
                },
            }
        rows.append(
            {
                "original_title": item["original_title"],
                "test_title": item["title"],
                "target_word": item["target_word"],
                "video": f"assets/unrelated-probe-videos/{video_slug(item['title'])}.mp4",
                "flash_confidence": flash.get("coherence_check", {}).get("confidence", ""),
                "pro_confidence": pro.get("coherence_check", {}).get("confidence", ""),
                "ratings": ratings,
            }
        )

    payload = {
        "ratings": [{"key": key, "label": label} for key, label in RATINGS],
        "rows": rows,
    }
    OUTPUT.write_text(
        f"window.UNRELATED_PROBE = {json.dumps(payload, indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
