(function () {
  const config = {
    manifestUrl: "all_rating_videos.json",
    assetBaseUrl: "assets/rating-videos/",
    submitUrl: "",
    submitMode: "cors",
    completionUrl: "",
    completionCode: "GESTURE-RATING-COMPLETE",
    minWatchRatio: 0.8,
    ...window.SURVEY_CONFIG,
  };

  const categories = [
    {
      key: "iconicity",
      label: "Iconicity",
      definition: "The degree to which the gesture visually resembles the meaning of the target word.",
      low: "1 = no visual relationship",
      high: "5 = highly transparent visual representation",
    },
    {
      key: "sensorimotor_imagery",
      label: "Sensorimotor Imagery",
      definition: "The extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word.",
      low: "1 = no bodily/action component",
      high: "5 = vivid action or bodily experience",
    },
    {
      key: "cultural_familiarity",
      label: "Cultural Familiarity",
      definition: "How readily the gesture is recognized from shared sociocultural conventions and prior experience in Western cultural contexts.",
      low: "1 = completely unfamiliar",
      high: "5 = highly familiar or widely used",
    },
  ];

  const state = {
    participant: {},
    videos: [],
    order: [],
    index: 0,
    responses: {},
    currentWatchSeconds: 0,
    currentMaxTime: 0,
    videoStartedAt: 0,
    sessionStartedAt: new Date().toISOString(),
  };

  const $ = (id) => document.getElementById(id);
  const introScreen = $("introScreen");
  const ratingScreen = $("ratingScreen");
  const doneScreen = $("doneScreen");
  const participantForm = $("participantForm");
  const participantId = $("participantId");
  const sessionNotes = $("sessionNotes");
  const progressText = $("progressText");
  const progressBar = $("progressBar");
  const targetWord = $("targetWord");
  const videoTitle = $("videoTitle");
  const videoPlayer = $("videoPlayer");
  const watchStatus = $("watchStatus");
  const replayButton = $("replayButton");
  const ratingForm = $("ratingForm");
  const rubricGrid = $("rubricGrid");
  const gestureDescription = $("gestureDescription");
  const ambiguities = $("ambiguities");
  const formWarning = $("formWarning");
  const backButton = $("backButton");
  const nextButton = $("nextButton");
  const summaryStats = $("summaryStats");
  const downloadCsvButton = $("downloadCsvButton");
  const downloadJsonButton = $("downloadJsonButton");
  const submitButton = $("submitButton");
  const submitStatus = $("submitStatus");
  const completionLink = $("completionLink");

  function query() {
    return new URLSearchParams(window.location.search);
  }

  function storageKey() {
    const pid = state.participant.participantId || "anonymous";
    return `gesture-rating-survey:${pid}`;
  }

  function slug(title) {
    return title
      .replace(/\.[^.]+$/, "")
      .replace(/\.mov$/i, "")
      .replace(/[^A-Za-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function videoUrl(item) {
    if (item.video_url) return item.video_url;
    if (item.video) return item.video;
    if (item.github_pages_path) return item.github_pages_path;
    return `${config.assetBaseUrl}${slug(item.title)}.mp4`;
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }

  function seededRandom(seed) {
    let value = seed || 1;
    return function () {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffledIndexes(length, seedText) {
    const indexes = Array.from({ length }, (_, index) => index);
    if (query().get("order") === "fixed") return indexes;
    const random = seededRandom(hashString(seedText));
    for (let i = indexes.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    return indexes;
  }

  function show(screen) {
    [introScreen, ratingScreen, doneScreen].forEach((node) => node.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  function renderRubric() {
    rubricGrid.innerHTML = "";
    categories.forEach((category) => {
      const card = document.createElement("article");
      card.className = "rubric-card";
      card.innerHTML = `
        <h2>${category.label}</h2>
        <p>${category.definition}</p>
        <div class="score-row" role="radiogroup" aria-label="${category.label}">
          ${[1, 2, 3, 4, 5]
            .map(
              (score) => `
                <label class="score-option">
                  <input type="radio" name="${category.key}" value="${score}" required>
                  <span>${score}</span>
                </label>
              `,
            )
            .join("")}
        </div>
        <div class="scale-labels"><span>${category.low}</span><span>${category.high}</span></div>
      `;
      rubricGrid.appendChild(card);
    });
  }

  function currentItem() {
    return state.videos[state.order[state.index]];
  }

  function responseKey(item) {
    return `${item.collection || "video"}::${item.title}`;
  }

  function restoreForm(item) {
    ratingForm.reset();
    const saved = state.responses[responseKey(item)];
    if (!saved) return;
    categories.forEach((category) => {
      const input = ratingForm.querySelector(`input[name="${category.key}"][value="${saved.ratings[category.key]}"]`);
      if (input) input.checked = true;
    });
    gestureDescription.value = saved.gesture_description || "";
    ambiguities.value = saved.ambiguities || "";
  }

  function resetWatchState() {
    state.currentWatchSeconds = 0;
    state.currentMaxTime = 0;
    state.videoStartedAt = Date.now();
    watchStatus.textContent = "Watch at least 80% of the video before continuing.";
    formWarning.textContent = "";
  }

  function renderVideo() {
    const item = currentItem();
    if (!item) {
      renderDone();
      return;
    }

    resetWatchState();
    targetWord.textContent = item.target_word || item.title;
    videoTitle.textContent = item.title;
    progressText.textContent = `Video ${state.index + 1} of ${state.order.length}`;
    progressBar.style.width = `${Math.round((state.index / state.order.length) * 100)}%`;
    videoPlayer.src = videoUrl(item);
    videoPlayer.load();
    restoreForm(item);
    backButton.disabled = state.index === 0;
    nextButton.textContent = state.index === state.order.length - 1 ? "Finish survey" : "Save and continue";
  }

  function watchedEnough() {
    const duration = videoPlayer.duration || 0;
    if (!Number.isFinite(duration) || duration <= 0) return true;
    return state.currentMaxTime / duration >= config.minWatchRatio;
  }

  function saveState() {
    localStorage.setItem(
      storageKey(),
      JSON.stringify({
        participant: state.participant,
        order: state.order,
        index: state.index,
        responses: state.responses,
        sessionStartedAt: state.sessionStartedAt,
      }),
    );
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || "null");
      if (!saved || !Array.isArray(saved.order)) return;
      state.order = saved.order.filter((index) => index >= 0 && index < state.videos.length);
      state.index = Math.min(saved.index || 0, state.order.length - 1);
      state.responses = saved.responses || {};
      state.sessionStartedAt = saved.sessionStartedAt || state.sessionStartedAt;
    } catch {
      localStorage.removeItem(storageKey());
    }
  }

  function collectCurrentResponse() {
    const item = currentItem();
    const formData = new FormData(ratingForm);
    const ratings = {};
    categories.forEach((category) => {
      ratings[category.key] = Number(formData.get(category.key));
    });

    state.responses[responseKey(item)] = {
      participant_id: state.participant.participantId,
      study_id: state.participant.studyId,
      session_id: state.participant.sessionId,
      collection: item.collection || "",
      source: item.source || "",
      title: item.title,
      target_word: item.target_word || "",
      video_url: videoUrl(item),
      order_index: state.index + 1,
      ratings,
      gesture_description: gestureDescription.value.trim(),
      ambiguities: ambiguities.value.trim(),
      watch_seconds: Math.round(state.currentMaxTime),
      response_seconds: Math.round((Date.now() - state.videoStartedAt) / 1000),
      submitted_at: new Date().toISOString(),
    };
    saveState();
  }

  function validateForm() {
    if (!watchedEnough()) {
      formWarning.textContent = "Please watch at least 80% of the video before continuing.";
      return false;
    }
    if (!ratingForm.reportValidity()) {
      formWarning.textContent = "Please complete all required ratings and the brief gesture description.";
      return false;
    }
    formWarning.textContent = "";
    return true;
  }

  function rows() {
    return state.order
      .map((index) => state.videos[index])
      .map((item) => state.responses[responseKey(item)])
      .filter(Boolean);
  }

  function csvEscape(value) {
    const text = value == null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function csvData() {
    const header = [
      "participant_id",
      "study_id",
      "session_id",
      "collection",
      "source",
      "title",
      "target_word",
      "video_url",
      "order_index",
      "iconicity",
      "sensorimotor_imagery",
      "cultural_familiarity",
      "gesture_description",
      "ambiguities",
      "watch_seconds",
      "response_seconds",
      "submitted_at",
    ];
    const body = rows().map((row) =>
      header
        .map((key) => {
          if (key in row.ratings) return csvEscape(row.ratings[key]);
          return csvEscape(row[key]);
        })
        .join(","),
    );
    return [header.join(","), ...body].join("\n");
  }

  function jsonData() {
    return JSON.stringify(
      {
        participant: state.participant,
        session_started_at: state.sessionStartedAt,
        exported_at: new Date().toISOString(),
        responses: rows(),
      },
      null,
      2,
    );
  }

  function download(filename, data, type) {
    const blob = new Blob([data], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function renderDone() {
    progressBar.style.width = "100%";
    show(doneScreen);
    const completed = rows().length;
    summaryStats.innerHTML = `
      <article><strong>${completed}</strong><span>videos rated</span></article>
      <article><strong>${categories.length}</strong><span>rating dimensions</span></article>
      <article><strong>${state.participant.participantId || "anonymous"}</strong><span>participant ID</span></article>
    `;

    submitButton.disabled = !config.submitUrl;
    if (!config.submitUrl) {
      submitStatus.textContent = "No submission endpoint is configured. Use CSV or JSON download.";
    }

    const returnUrl = query().get("return") || config.completionUrl;
    if (returnUrl) {
      completionLink.href = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}cc=${encodeURIComponent(config.completionCode)}`;
      completionLink.classList.remove("hidden");
    }
  }

  async function submitResults() {
    if (!config.submitUrl) return;
    submitButton.disabled = true;
    submitStatus.textContent = "Submitting...";
    try {
      const response = await fetch(config.submitUrl, {
        method: "POST",
        mode: config.submitMode,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: jsonData(),
      });
      if (config.submitMode !== "no-cors" && !response.ok) throw new Error(`HTTP ${response.status}`);
      submitStatus.textContent =
        config.submitMode === "no-cors"
          ? "Submitted. Download CSV/JSON as a backup if this is a pilot run."
          : `Submitted. Completion code: ${config.completionCode}`;
    } catch (error) {
      submitStatus.textContent = `Submission failed: ${error.message}. Download CSV/JSON as backup.`;
      submitButton.disabled = false;
    }
  }

  async function loadManifest() {
    const manifestUrl = query().get("manifest") || config.manifestUrl;
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`Could not load ${manifestUrl}`);
    let videos = await response.json();
    const limit = Number(query().get("limit") || 0);
    if (limit > 0) videos = videos.slice(0, limit);
    state.videos = videos;
  }

  function initParticipant() {
    const params = query();
    participantId.value = params.get("participant_id") || params.get("participant") || params.get("pid") || "";
    state.participant = {
      participantId: participantId.value.trim(),
      studyId: params.get("study_id") || "",
      sessionId: params.get("session_id") || randomId(),
      notes: "",
    };
  }

  participantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.participant.participantId = participantId.value.trim() || `anon-${randomId()}`;
    state.participant.notes = sessionNotes.value.trim();
    state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    loadState();
    if (!state.order.length) state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    saveState();
    renderVideo();
    show(ratingScreen);
  });

  ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    collectCurrentResponse();
    state.index += 1;
    saveState();
    renderVideo();
  });

  backButton.addEventListener("click", () => {
    if (state.index === 0) return;
    state.index -= 1;
    saveState();
    renderVideo();
  });

  replayButton.addEventListener("click", () => {
    videoPlayer.currentTime = 0;
    videoPlayer.play();
  });

  videoPlayer.addEventListener("timeupdate", () => {
    state.currentMaxTime = Math.max(state.currentMaxTime, videoPlayer.currentTime || 0);
    if (watchedEnough()) {
      watchStatus.textContent = "Watch requirement met.";
    }
  });

  downloadCsvButton.addEventListener("click", () => download("gesture-human-ratings.csv", csvData(), "text/csv"));
  downloadJsonButton.addEventListener("click", () => download("gesture-human-ratings.json", jsonData(), "application/json"));
  submitButton.addEventListener("click", submitResults);

  renderRubric();
  initParticipant();
  loadManifest().catch((error) => {
    document.body.innerHTML = `<main class="screen"><div class="hero-card"><h1>Survey failed to load</h1><p>${error.message}</p></div></main>`;
  });
})();
