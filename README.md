# Gemini Gesture Rating Pilot

This workspace contains a small pilot setup for testing whether Gemini can interpret gesture videos used in second-language vocabulary learning.

The local questionnaire in `Gesture Rating Sheet.docx` was converted into a structured prompt with seven 1-5 rating dimensions:

- iconicity
- sensorimotor imagery
- motional salience of the gesture
- emotional salience of the facial expression
- gesture complexity fit
- cultural familiarity
- enactment potential

## Files

- `prompts/gesture_rating_prompt.md`: prompt template based on the attached human rating sheet.
- `prompts/gesture_interpretation_probe.md`: unlabeled prompt for checking whether Gemini can infer plausible meanings without the target word.
- `pilot_videos.json`: first four Figshare videos selected for a pilot run.
- `scripts/run_gemini_gesture_pilot.py`: downloads videos from Figshare, uploads them to Gemini, asks for JSON ratings, and saves outputs.
- `scripts/validate_results.py`: validates rating-result JSON files.
- `requirements.txt`: Python dependencies for the runner.
- `.env.example`: environment variables expected by the runner.

## Pilot Videos

The initial four videos are from the Figshare collection `Gesture video corpus`:

1. `81_Innocence.avi`
2. `89_Admission.avi`
3. `70_Sensation.avi`
4. `64_Boredom.avi`

These were chosen from the first Figshare API page available during setup. They include abstract/emotional or less directly imageable words, which should be a useful stress test for VLM interpretation.

## Running

Install dependencies:

```bash
python3 -m pip install -r requirements.txt
```

Set the Gemini API key:

```bash
export GEMINI_API_KEY="..."
export GEMINI_MODEL="gemini-3.1-flash"
```

Preview the prompt without network or Gemini calls:

```bash
python3 scripts/run_gemini_gesture_pilot.py --dry-run --limit 1
python3 scripts/run_gemini_gesture_pilot.py --task probe --dry-run --limit 1
```

Run the first four videos with the rating prompt:

```bash
python3 scripts/run_gemini_gesture_pilot.py --limit 4
```

Run the unlabeled interpretation probe:

```bash
python3 scripts/run_gemini_gesture_pilot.py --task probe --limit 4
```

Outputs are written to `results/`:

- one `*.json` file per video with parsed model ratings
- one `*.raw.txt` file per video with the original Gemini response
- `gemini_gesture_rating.jsonl` or `gemini_gesture_probe.jsonl` with one parsed result per line

Validate rating outputs:

```bash
python3 scripts/validate_results.py results
```

## Coherence Check

For the first pass, treat the run as coherent if:

- Gemini gives a concrete visual description of the gesture rather than generic comments.
- Scores line up with the visible description. For example, a simple easy-to-copy gesture should not get very low enactment potential without a clear reason.
- Ambiguity is acknowledged for abstract words when the gesture does not transparently map to the target word.
- Facial-emotion ratings are low when the face is neutral and higher only when affect is visibly present.
- The JSON parses cleanly and all scores are integers from 1 to 5.

The pilot does not establish validity against human raters. It only checks whether VLM responses are structured, interpretable, and plausible enough to justify a broader comparison.

## Notes

The JKU Sync2 link and full Figshare corpus still need network access to enumerate and download all videos. The runner already supports Figshare API URLs and local files, so manually downloaded videos can also be added to `pilot_videos.json` with a `local_path` field.
