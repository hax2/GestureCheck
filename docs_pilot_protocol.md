# Pilot Protocol

Goal: test whether Gemini can produce coherent interpretations and questionnaire-style ratings for gesture videos used in second-language vocabulary learning.

## Recommended First Pass

Run 2-4 videos from `pilot_videos.json`.

For each video, use two prompts:

1. Unlabeled interpretation probe: `prompts/gesture_interpretation_probe.md`
   - Purpose: check whether Gemini can describe the gesture and infer plausible meanings without being led by the filename or target word.

2. Target-word rating sheet: `prompts/gesture_rating_prompt.md`
   - Purpose: check whether Gemini can fill the same dimensions as the human questionnaire when the intended word is known.

The current runner implements the second prompt. The interpretation probe is included as a separate prompt template for manual or scripted use in the next iteration.

## Minimal Coherence Criteria

A response is coherent if:

- The gesture description names visible movement features, not only the target word.
- The rating rationales refer to observable evidence.
- Scores are internally consistent with the description.
- The model distinguishes gesture movement from facial expression.
- The model marks ambiguity for abstract words when the visual mapping is weak.
- The model does not invent unseen objects, dialogue, or off-screen context.

## Suggested Result Table

For a quick hand audit, collect:

- video file
- target word
- Gemini brief description
- guessed meanings from the unlabeled probe
- seven rating scores
- confidence
- main ambiguity
- reviewer note: coherent / partially coherent / incoherent

## Next-Step Validity Check

After the first run looks technically sound, compare Gemini ratings against human raters on a larger subset.

Useful checks:

- Spearman correlation by dimension
- mean absolute error by dimension
- agreement after binning scores into low, medium, high
- separate analysis for concrete vs abstract target words
- separate analysis for emotional vs non-emotional target words

This should be treated as a measurement-validity question, not just a model-output quality question.
