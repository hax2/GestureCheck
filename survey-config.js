window.SURVEY_CONFIG = {
  // GitHub Pages can serve the survey, but cannot store submissions by itself.
  // Add a POST endpoint here if you want automatic collection.
  submitUrl: "https://script.google.com/macros/s/AKfycbwA8kJntiYR5wYe7OAAhNblfEltTZLJW5VqNbyK70PUpDy6l3NL98y8KfxdsBn-qspl/exec",
  submitMode: "no-cors",

  // Optional. If set, the final screen links back with ?cc=<completionCode>.
  completionUrl: "",
  completionCode: "GESTURE-RATING-COMPLETE",

  // Default manifest and converted MP4 asset location.
  manifestUrl: "all_rating_videos.json",
  assetBaseUrl: "assets/rating-videos/",

  // Participants must watch this fraction of each video before advancing.
  minWatchRatio: 0.8,
};
