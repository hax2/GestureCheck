# Gemini Gesture Rating Pilot

This workspace contains a small pilot setup for testing whether Gemini can interpret gesture videos used in second-language vocabulary learning.

## Results Viewer

The repository root contains a static results viewer for GitHub Pages:

- `index.html`
- `app.js`
- `styles.css`
- `results-data.js`
- `assets/videos/`

To publish it, configure GitHub Pages to deploy from the `main` branch and root directory. The page will be available at:

```text
https://hax2.github.io/GestureCheck/
```

The local questionnaire in `Gesture Rating Sheet.docx` was converted into a structured prompt with seven 1-5 rating dimensions:

- iconicity
- sensorimotor imagery
- motional salience of the gesture
- emotional salience of the facial expression
- gesture complexity fit
- cultural familiarity
- enactment potential

## Human Rating Survey

The repository also contains a GitHub Pages-compatible human rating app:

- `survey.html`
- `survey.css`
- `survey.js`
- `survey-config.js`
- `all_rating_videos.json`
- `assets/rating-videos/`

Open it locally through a static server:

```bash
python3 -m http.server 8765
```

Then visit:

```text
http://127.0.0.1:8765/survey.html
```

Useful URL parameters:

- `?limit=10`: show only the first 10 videos from the manifest.
- `?order=fixed`: disable participant-specific randomization.
- `?participant_id=...&study_id=...&session_id=...`: identifiers are captured automatically.
- `?return=https://...`: show a completion return link after export/submission.
- `?manifest=custom.json`: use a different manifest with the same fields.

The app uses the same three rubric categories as `prompts/gesture_rating_prompt_three_categories.md`:

- iconicity
- sensorimotor imagery
- cultural familiarity

Because GitHub Pages is static hosting, it cannot store submitted survey responses by itself. The included collection path is Google Apps Script writing to Google Sheets.

Google Sheets setup:

1. Create a new Google Sheet.
2. Open Extensions > Apps Script.
3. Replace the default script with `google-apps-script/Code.gs`.
4. Click Deploy > New deployment.
5. Choose type: Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Deploy and copy the Web app URL ending in `/exec`.
9. Paste that URL into `submitUrl` in `survey-config.js`.

Expected config:

```js
window.SURVEY_CONFIG = {
  submitUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  submitMode: "no-cors",
  completionUrl: "",
  completionCode: "GESTURE-RATING-COMPLETE",
  manifestUrl: "all_rating_videos.json",
  assetBaseUrl: "assets/rating-videos/",
  minWatchRatio: 0.8,
};
```

The Apps Script creates or reuses a `responses` sheet and writes one spreadsheet row per rated video. The survey still provides CSV/JSON downloads as a backup.

Browser playback should use MP4 or WebM, not AVI. Convert local manifest videos into deployable MP4 assets with:

```bash
python3 scripts/build_rating_videos.py --manifest all_rating_videos.json --output-dir assets/rating-videos --jobs 4
```

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
