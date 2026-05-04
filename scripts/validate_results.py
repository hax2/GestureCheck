#!/usr/bin/env python3
"""Validate Gemini gesture-rating JSON outputs."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


REQUIRED_RATINGS = [
    "iconicity",
    "sensorimotor_imagery",
    "motional_salience_gesture",
    "emotional_salience_facial_expression",
    "gesture_complexity_fit",
    "cultural_familiarity",
    "enactment_potential",
]


def validate_result(path: Path, data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for field in ["target_word", "video_file", "brief_gesture_description", "ratings"]:
        if field not in data:
            errors.append(f"{path}: missing top-level field {field}")

    ratings = data.get("ratings", {})
    if not isinstance(ratings, dict):
        return errors + [f"{path}: ratings is not an object"]

    for rating_name in REQUIRED_RATINGS:
        rating = ratings.get(rating_name)
        if not isinstance(rating, dict):
            errors.append(f"{path}: missing rating object {rating_name}")
            continue
        score = rating.get("score")
        if not isinstance(score, int) or not 1 <= score <= 5:
            errors.append(f"{path}: {rating_name}.score must be an integer from 1 to 5")
        if not isinstance(rating.get("rationale"), str) or not rating["rationale"].strip():
            errors.append(f"{path}: {rating_name}.rationale must be a non-empty string")

    return errors


def validate_probe(path: Path, data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for field in ["video_file", "brief_gesture_description", "visible_components", "candidate_meanings"]:
        if field not in data:
            errors.append(f"{path}: missing top-level field {field}")
    candidates = data.get("candidate_meanings", [])
    if not isinstance(candidates, list) or not candidates:
        errors.append(f"{path}: candidate_meanings must be a non-empty list")
    return errors


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path, default=[Path("results")])
    return parser.parse_args()


def iter_json_files(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if path.is_dir():
            files.extend(sorted(path.glob("*.json")))
        else:
            files.append(path)
    return files


def main() -> int:
    args = parse_args()
    errors: list[str] = []
    files = iter_json_files(args.paths)
    if not files:
        print("No JSON result files found.", file=sys.stderr)
        return 1

    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{path}: invalid JSON: {exc}")
            continue
        if "ratings" in data:
            errors.extend(validate_result(path, data))
        elif "candidate_meanings" in data:
            errors.extend(validate_probe(path, data))
        else:
            errors.append(f"{path}: unrecognized result schema")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1

    print(f"Validated {len(files)} result file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
