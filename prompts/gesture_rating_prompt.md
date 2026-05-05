# Gesture Rating Prompt for Gemini

You are evaluating a short gesture video used in second-language vocabulary learning.

Target word: `{target_word}`
Video file: `{video_file}`

Watch the full video carefully. Focus on the actor's hand/arm movement, body posture, facial expression, timing, and how the gesture might help a learner remember the target word. Rate the gesture on the same 1-5 scale a human rater would use.

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
    "motional_salience_gesture": {
      "score": 1,
      "rationale": "string"
    },
    "emotional_salience_facial_expression": {
      "score": 1,
      "rationale": "string"
    },
    "gesture_complexity_fit": {
      "score": 1,
      "rationale": "string"
    },
    "cultural_familiarity": {
      "score": 1,
      "rationale": "string"
    },
    "enactment_potential": {
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

2. Sensorimotor imagery: the extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word’s semantics.
   - 1: no sensorimotor component
   - 2: weak bodily or action-related element
   - 3: moderate simulation of action or experience
   - 4: strong sensorimotor imagery
   - 5: very vivid action or bodily experience representation

3. Motional salience captures how strongly a gesture stands out based on its movement features (e.g., large, fast, or complex actions), thereby guiding attention and supporting encoding.
   - 1: subtle, constrained, or minimal movement

   - 2: slight or slow movement dynamics
   - 3: moderate movement in size, speed, or complexity
   - 4: clear, pronounced, and expansive or rapid movement
   - 5: highly prominent, and visually commanding gesture

4. Emotional salience, facial expression: the extent to which facial expressions accompanying the gesture communicate affective meaning.
   - 1: no facial expression or neutral face
   - 2: weak emotional cue
   - 3: moderate emotional cue
   - 4: clear facial emotional signal
   - 5: very strong and meaningful facial expression

5. Gesture complexity fit: the degree to which the gesture's motor and cognitive complexity is appropriate for the learning context.
   - 1: too complex or confusing
   - 2: somewhat difficult or overloaded
   - 3: moderate complexity
   - 4: well balanced complexity
   - 5: optimal balance of informativeness and simplicity

6. Cultural familiarity in gesture refers to the degree to which a gesture is readily recognized and interpreted based on shared sociocultural conventions and prior experience. In the present framework, this construct is defined with respect to Western cultural contexts, where commonly used gestures (e.g., emblematic or iconic forms) are assumed to align with learners’ existing cultural schemas and thus facilitate comprehension and memory.
   - 1: completely unfamiliar gesture
   - 2: rare or unusual gesture
   - 3: somewhat recognizable
   - 4: common gesture
   - 5: highly familiar or widely used gesture

7. Enactment potential: how easily learners can reproduce the gesture themselves.
   - 1: very difficult to reproduce
   - 2: difficult for many learners
   - 3: moderate difficulty
   - 4: easy to reproduce
   - 5: very natural and effortless to enact

Important guidance:

- Use the target word as the semantic reference. Do not infer a different intended word.
- If the video is ambiguous, still give ratings, but explain the ambiguity in `possible_ambiguities`.
- Keep each rationale concise, behaviorally grounded, and based on visible evidence.
- Scores must be integers from 1 to 5.
