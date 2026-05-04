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

1. Iconicity: the degree to which the gesture visually resembles the meaning of the target word.
   - 1: no visual relationship to the meaning
   - 2: very weak resemblance
   - 3: moderate resemblance
   - 4: clear iconic relationship
   - 5: highly transparent visual representation of meaning

2. Sensorimotor imagery: the extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word.
   - 1: no sensorimotor component
   - 2: weak bodily or action-related element
   - 3: moderate simulation of action or experience
   - 4: strong sensorimotor imagery
   - 5: very vivid action or bodily experience representation

3. Motional salience, gesture: the degree to which the movement dynamics convey emotional expressiveness. Consider amplitude, speed or rhythm, intensity, and dynamic emphasis.
   - 1: emotionally neutral movement
   - 2: slight emotional expressiveness
   - 3: moderate expressiveness
   - 4: clear emotional movement dynamics
   - 5: highly expressive and emotionally engaging gesture

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

6. Cultural familiarity: the extent to which the gesture is likely to be recognized within the cultural repertoire of learners.
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

- Use the target word as the semantic reference. Do not infer a different intended word unless the gesture clearly contradicts the provided label.
- If the video is ambiguous, still give ratings, but explain the ambiguity in `possible_ambiguities`.
- Keep each rationale concise, behaviorally grounded, and based on visible evidence.
- Scores must be integers from 1 to 5.
