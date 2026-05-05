#!/usr/bin/env python3
"""Convert local rating videos to browser-playable MP4 assets."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def video_slug(title: str) -> str:
    stem = Path(title).stem
    stem = re.sub(r"\.mov$", "", stem, flags=re.IGNORECASE)
    return re.sub(r"[^A-Za-z0-9]+", "_", stem).strip("_")


def output_path(output_dir: Path, title: str) -> Path:
    return output_dir / f"{video_slug(title)}.mp4"


def convert(item: dict[str, str], output_dir: Path, force: bool) -> str:
    source = ROOT / item["local_path"]
    destination = output_path(output_dir, item["title"])
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and destination.stat().st_size > 0 and not force:
        return f"skip {destination}"

    command = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(source),
        "-an",
        "-vf",
        "scale='min(960,iw)':-2,format=yuv420p",
        "-c:v",
        "libopenh264",
        "-movflags",
        "+faststart",
        str(destination),
    ]
    subprocess.run(command, check=True)
    return f"wrote {destination}"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=ROOT / "all_rating_videos.json")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets" / "rating-videos")
    parser.add_argument("--jobs", type=int, default=4)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    with ThreadPoolExecutor(max_workers=args.jobs) as executor:
        futures = [executor.submit(convert, item, args.output_dir, args.force) for item in manifest]
        for future in as_completed(futures):
            print(future.result(), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
