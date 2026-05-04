# Gesture Interpretation Probe for Gemini

You are viewing a short gesture video used in second-language vocabulary learning.

Video file: `{video_file}`

Do not assume you know the intended target word from the file name. Watch the full video and infer what meaning or concept the gesture appears to express.

Return only valid JSON with this exact schema:

```json
{
  "video_file": "string",
  "brief_gesture_description": "string",
  "visible_components": {
    "hands_and_arms": "string",
    "body_posture": "string",
    "facial_expression": "string",
    "movement_dynamics": "string"
  },
  "candidate_meanings": [
    {
      "meaning": "string",
      "confidence": "low | medium | high",
      "evidence": "string"
    }
  ],
  "l2_learning_usefulness": {
    "likely_memorable": true,
    "rationale": "string"
  },
  "ambiguities": ["string"]
}
```

Guidance:

- Base the interpretation only on visible behavior in the video.
- Include up to five candidate meanings, ordered from most to least likely.
- If the gesture is conventional or culturally familiar, say so; if it seems idiosyncratic, say so.
- Keep all rationales concise and grounded in visible evidence.
