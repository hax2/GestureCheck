# Three-Category Gesture Rating Prompt for Gemini

You are evaluating a short gesture video used in second-language vocabulary learning.

Target word: `{target_word}`
Video file: `{video_file}`

Watch the full video carefully. Focus on the actor's hand/arm movement, body posture, facial expression, timing, and how the gesture might help a learner remember the target word. Rate only the three requested categories on a 1-5 scale.

Return only valid JSON with this exact schema:

```json
{
  "target_word": "string",
  "video_file": "string",
  "brief_gesture_description": "string",
  "ratings": {
    "iconicity": {
      "score": 1,
      "rationale": "string"
    },
    "sensorimotor_imagery": {
      "score": 1,
      "rationale": "string"
    },
    "cultural_familiarity": {
      "score": 1,
      "rationale": "string"
    }
  },
  "coherence_check": {
    "is_video_interpretable": true,
    "possible_ambiguities": ["string"],
    "confidence": "low | medium | high"
  }
}
```

Rating definitions:

1. Iconicity: the degree to which the gesture visually resembles the semantics of the target word.
   - 1: no visual relationship to the semantics
   - 2: very weak resemblance
   - 3: moderate resemblance
   - 4: clear iconic relationship
   - 5: highly transparent visual representation of semantics

2. Sensorimotor imagery: the extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word's semantics.
   - 1: no sensorimotor component
   - 2: weak bodily or action-related element
   - 3: moderate simulation of action or experience
   - 4: strong sensorimotor imagery
   - 5: very vivid action or bodily experience representation

3. Cultural familiarity in gesture refers to the degree to which a gesture is readily recognized and interpreted based on shared sociocultural conventions and prior experience. In the present framework, this construct is defined with respect to Western cultural contexts.
   - 1: completely unfamiliar gesture
   - 2: rare or unusual gesture
   - 3: somewhat recognizable
   - 4: common gesture
   - 5: highly familiar or widely used gesture

Important guidance:

- Use the target word as the semantic reference. Do not infer a different intended word.
- If the video is ambiguous, still give ratings, but explain the ambiguity in `possible_ambiguities`.
- Keep each rationale concise, behaviorally grounded, and based on visible evidence.
- Scores must be integers from 1 to 5.
