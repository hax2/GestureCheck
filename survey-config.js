window.SURVEY_CONFIG = {
  // GitHub Pages can serve the survey, but cannot store submissions by itself.
  // Add a POST endpoint here if you want automatic collection.
  submitUrl: "https://script.google.com/macros/s/AKfycbwuSNHhGiSg9LSKNdlb1NvyAAFGtObsl3gGcrz0L-KglJsXA_FErZ0f9qBylGHKNZEM/exec",
  submitMode: "no-cors",
  submitEachResponse: true,

  // Optional. If set, the final screen links back with ?cc=<completionCode>.
  completionUrl: "",
  completionCode: "GESTURE-RATING-COMPLETE",

  // Default manifest and converted MP4 asset location.
  manifestUrl: "all_rating_videos.json",
  assetBaseUrl: "assets/rating-videos/",

  // Participants must watch this fraction of each video before advancing.
  minWatchRatio: 0.8,
};
