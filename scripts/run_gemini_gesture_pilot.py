#!/usr/bin/env python3
"""Run a small Gemini pilot on gesture-learning videos.

The script intentionally keeps each stage explicit:

1. Read selected videos from a manifest.
2. Download missing videos from Figshare article metadata.
3. Upload each video through Gemini Files API.
4. Ask Gemini to fill the gesture rating sheet as JSON.
5. Save raw and parsed outputs under results/.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path
from typing import Any

import requests


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "pilot_videos.json"
DEFAULT_RATING_PROMPT = ROOT / "prompts" / "gesture_rating_prompt.md"
DEFAULT_PROBE_PROMPT = ROOT / "prompts" / "gesture_interpretation_probe.md"
DEFAULT_VIDEO_DIR = ROOT / "data" / "videos"
DEFAULT_RESULTS_DIR = ROOT / "results"
DEFAULT_TMP_DIR = ROOT / ".tmp" / "anonymized_uploads"


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def read_text(path: Path) -> str:
    with path.open("r", encoding="utf-8") as handle:
        return handle.read()


def load_dotenv(path: Path, *, override: bool = False) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if override:
            os.environ[key] = value
        else:
            os.environ.setdefault(key, value)


def slug_filename(name: str) -> str:
    clean = re.sub(r"[^A-Za-z0-9._-]+", "_", name).strip("_")
    return clean or "video.avi"


def get_figshare_download_url(article_api_url: str, timeout: int) -> str:
    response = requests.get(article_api_url, timeout=timeout)
    response.raise_for_status()
    article = response.json()
    files = article.get("files") or []
    if not files:
        raise RuntimeError(f"No files listed in Figshare article: {article_api_url}")

    preferred = files[0]
    for file_info in files:
        if file_info.get("download_url"):
            preferred = file_info
            break

    download_url = preferred.get("download_url")
    if not download_url:
        raise RuntimeError(f"No download_url found in Figshare article: {article_api_url}")
    return download_url


def download_file(url: str, destination: Path, timeout: int) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=timeout) as response:
        response.raise_for_status()
        with destination.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    handle.write(chunk)


def ensure_video(video: dict[str, Any], video_dir: Path, timeout: int) -> Path:
    filename = slug_filename(video["title"])
    destination = video_dir / filename
    if destination.exists() and destination.stat().st_size > 0:
        return destination

    if video.get("local_path"):
        source = Path(video["local_path"]).expanduser()
        if not source.exists():
            raise FileNotFoundError(f"Local video does not exist: {source}")
        return source

    if video.get("download_url"):
        download_url = video["download_url"]
    elif video.get("url_public_api"):
        download_url = get_figshare_download_url(video["url_public_api"], timeout)
    else:
        raise RuntimeError(f"Video has neither local_path nor Figshare URL: {video}")

    print(f"Downloading {video['title']} -> {destination}", flush=True)
    download_file(download_url, destination, timeout)
    return destination


def wait_until_active(client: Any, uploaded_file: Any, poll_seconds: int) -> Any:
    while not uploaded_file.state or uploaded_file.state.name != "ACTIVE":
        if uploaded_file.state and uploaded_file.state.name == "FAILED":
            raise RuntimeError(f"Gemini failed to process uploaded file: {uploaded_file.name}")
        print(f"Waiting for Gemini file processing: {uploaded_file.name}", flush=True)
        time.sleep(poll_seconds)
        uploaded_file = client.files.get(name=uploaded_file.name)
    return uploaded_file


def render_prompt(template: str, video: dict[str, Any], display_title: str | None = None) -> str:
    return (
        template.replace("{target_word}", str(video.get("target_word", "UNKNOWN")))
        .replace("{video_file}", str(display_title or video["title"]))
    )


def anonymized_title(index: int, source_path: Path) -> str:
    suffix = source_path.suffix.lower() or ".avi"
    return f"video_{index:03d}{suffix}"


def anonymized_upload_copy(source_path: Path, index: int, tmp_dir: Path) -> tuple[str, Path]:
    title = anonymized_title(index, source_path)
    tmp_dir.mkdir(parents=True, exist_ok=True)
    destination = tmp_dir / title
    if not destination.exists() or destination.stat().st_size != source_path.stat().st_size:
        shutil.copy2(source_path, destination)
    return title, destination


def extract_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if stripped.startswith("```"):
        stripped = re.sub(r"^```(?:json)?\s*", "", stripped)
        stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def rate_video(
    client: Any,
    genai_types: Any,
    model: str,
    video_path: Path,
    prompt: str,
    poll_seconds: int,
) -> tuple[str, dict[str, Any]]:
    uploaded = client.files.upload(file=video_path)
    uploaded = wait_until_active(client, uploaded, poll_seconds)

    response = client.models.generate_content(
        model=model,
        contents=[uploaded, prompt],
        config=genai_types.GenerateContentConfig(
            temperature=0,
            response_mime_type="application/json",
        ),
    )
    raw_text = response.text or ""
    return raw_text, extract_json_object(raw_text)


def run(args: argparse.Namespace) -> int:
    load_dotenv(ROOT / ".env")
    load_dotenv(ROOT / "env.local", override=True)
    manifest = read_json(args.manifest)
    prompt_path = args.prompt or (
        DEFAULT_PROBE_PROMPT if args.task == "probe" else DEFAULT_RATING_PROMPT
    )
    prompt_template = read_text(prompt_path)
    videos = manifest[: args.limit] if args.limit else manifest

    args.video_dir.mkdir(parents=True, exist_ok=True)
    args.results_dir.mkdir(parents=True, exist_ok=True)

    client = None
    genai_types = None
    if not args.dry_run:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("GEMINI_API_KEY is not set. See .env.example.", file=sys.stderr)
            return 2
        try:
            from google import genai
            from google.genai import types as imported_types
        except ImportError:
            print(
                "Missing dependency: install requirements.txt before running Gemini calls.",
                file=sys.stderr,
            )
            return 2
        client = genai.Client(api_key=api_key)
        genai_types = imported_types

    if args.dry_run:
        for index, video in enumerate(videos, start=1):
            source_path = Path(video.get("local_path", video["title"]))
            display_title = (
                anonymized_title(index, source_path)
                if args.task == "probe" and args.anonymize_probe
                else video["title"]
            )
            prompt = render_prompt(prompt_template, video, display_title=display_title)
            label = video.get("target_word", "unlabeled")
            print(f"Prompt for {video['title']} ({label}):")
            print(prompt)
        return 0

    combined_path = args.results_dir / f"gemini_gesture_{args.task}.jsonl"
    with combined_path.open("a", encoding="utf-8") as combined:
        for index, video in enumerate(videos, start=1):
            video_path = ensure_video(video, args.video_dir, args.timeout)
            display_title = video["title"]
            upload_path = video_path
            if args.task == "probe" and args.anonymize_probe:
                display_title, upload_path = anonymized_upload_copy(
                    video_path,
                    index,
                    args.tmp_dir,
                )
            prompt = render_prompt(prompt_template, video, display_title=display_title)
            label = video.get("target_word", "unlabeled")
            print(
                f"Running {args.task} on {video['title']} ({label}); "
                f"Gemini sees {display_title}",
                flush=True,
            )

            raw_text, parsed = rate_video(
                client=client,
                genai_types=genai_types,
                model=args.model,
                video_path=upload_path,
                prompt=prompt,
                poll_seconds=args.poll_seconds,
            )

            stem = f"{Path(video['title']).stem}.{args.task}"
            raw_path = args.results_dir / f"{stem}.raw.txt"
            json_path = args.results_dir / f"{stem}.json"

            raw_path.write_text(raw_text, encoding="utf-8")
            json_path.write_text(json.dumps(parsed, indent=2, ensure_ascii=False), encoding="utf-8")
            combined.write(json.dumps(parsed, ensure_ascii=False) + "\n")
            combined.flush()
            print(f"Wrote {json_path}", flush=True)

    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--prompt", type=Path)
    parser.add_argument("--task", choices=["rating", "probe"], default="rating")
    parser.add_argument("--video-dir", type=Path, default=DEFAULT_VIDEO_DIR)
    parser.add_argument("--results-dir", type=Path, default=DEFAULT_RESULTS_DIR)
    parser.add_argument("--tmp-dir", type=Path, default=DEFAULT_TMP_DIR)
    parser.add_argument("--model", default=os.environ.get("GEMINI_MODEL", "gemini-3.1-flash"))
    parser.add_argument("--limit", type=int, default=4)
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--poll-seconds", type=int, default=5)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--no-anonymize-probe",
        action="store_false",
        dest="anonymize_probe",
        help="For probe runs, pass original filenames instead of neutral temporary names.",
    )
    parser.set_defaults(anonymize_probe=True)
    return parser.parse_args()


if __name__ == "__main__":
    raise SystemExit(run(parse_args()))
