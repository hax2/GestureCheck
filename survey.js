(function () {
  const config = {
    manifestUrl: "all_rating_videos.json",
    assetBaseUrl: "assets/rating-videos/",
    submitUrl: "",
    submitMode: "cors",
    submitEachResponse: false,
    completionUrl: "",
    completionCode: "GESTURE-RATING-COMPLETE",
    minWatchRatio: 0.8,
    blockSize: 20,
    ...window.SURVEY_CONFIG,
  };

  const categories = [
    {
      key: "iconicity",
      label: "Iconicity",
      definition: "The degree to which the gesture visually resembles the semantics of the target word.",
      low: "1 = no visual relationship",
      high: "5 = highly transparent visual representation",
      anchors: [
        "1: no visual relationship to the semantics",
        "2: very weak resemblance",
        "3: moderate resemblance",
        "4: clear iconic relationship",
        "5: highly transparent visual representation of semantics",
      ],
    },
    {
      key: "sensorimotor_imagery",
      label: "Sensorimotor Imagery",
      definition: "The extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word's semantics.",
      low: "1 = no bodily/action component",
      high: "5 = vivid action or bodily experience",
      anchors: [
        "1: no sensorimotor component",
        "2: weak bodily or action-related element",
        "3: moderate simulation of action or experience",
        "4: strong sensorimotor imagery",
        "5: very vivid action or bodily experience representation",
      ],
    },
    {
      key: "motional_salience_gesture",
      label: "Motional Salience",
      definition: "Motional salience captures how strongly a gesture stands out based on its movement features, such as large, fast, or complex actions, thereby guiding attention and supporting encoding.",
      low: "1 = subtle/minimal movement",
      high: "5 = visually commanding gesture",
      anchors: [
        "1: subtle, constrained, or minimal movement",
        "2: slight or slow movement dynamics",
        "3: moderate movement in size, speed, or complexity",
        "4: clear, pronounced, and expansive or rapid movement",
        "5: highly prominent, and visually commanding gesture",
      ],
    },
    {
      key: "emotional_salience_facial_expression",
      label: "Emotional Salience, Facial Expression",
      definition: "The extent to which facial expressions accompanying the gesture communicate affective meaning.",
      low: "1 = neutral/no expression",
      high: "5 = very strong facial expression",
      anchors: [
        "1: no facial expression or neutral face",
        "2: weak emotional cue",
        "3: moderate emotional cue",
        "4: clear facial emotional signal",
        "5: very strong and meaningful facial expression",
      ],
    },
    {
      key: "gesture_complexity_fit",
      label: "Gesture Complexity Fit",
      definition: "The degree to which the gesture's motor and cognitive complexity is appropriate for the learning context.",
      low: "1 = too complex/confusing",
      high: "5 = optimal balance",
      anchors: [
        "1: too complex or confusing",
        "2: somewhat difficult or overloaded",
        "3: moderate complexity",
        "4: well balanced complexity",
        "5: optimal balance of informativeness and simplicity",
      ],
    },
    {
      key: "cultural_familiarity",
      label: "Cultural Familiarity",
      definition: "Cultural familiarity in gesture refers to the degree to which a gesture is readily recognized and interpreted based on shared sociocultural conventions and prior experience. In the present framework, this construct is defined with respect to Western cultural contexts, where commonly used gestures, such as emblematic or iconic forms, are assumed to align with learners' existing cultural schemas and thus facilitate comprehension and memory.",
      low: "1 = completely unfamiliar",
      high: "5 = highly familiar or widely used",
      anchors: [
        "1: completely unfamiliar gesture",
        "2: rare or unusual gesture",
        "3: somewhat recognizable",
        "4: common gesture",
        "5: highly familiar or widely used gesture",
      ],
    },
    {
      key: "enactment_potential",
      label: "Enactment Potential",
      definition: "How easily learners can reproduce the gesture themselves.",
      low: "1 = very difficult",
      high: "5 = natural and effortless",
      anchors: [
        "1: very difficult to reproduce",
        "2: difficult for many learners",
        "3: moderate difficulty",
        "4: easy to reproduce",
        "5: very natural and effortless to enact",
      ],
    },
  ];

  const state = {
    participant: {},
    videos: [],
    order: [],
    index: 0,
    responses: {},
    block: null,
    totalVideos: 0,
    currentWatchSeconds: 0,
    currentMaxTime: 0,
    videoStartedAt: 0,
    sessionStartedAt: new Date().toISOString(),
  };

  const $ = (id) => document.getElementById(id);
  const introScreen = $("introScreen");
  const tutorialScreen = $("tutorialScreen");
  const ratingScreen = $("ratingScreen");
  const doneScreen = $("doneScreen");
  const participantForm = $("participantForm");
  const participantId = $("participantId");
  const sessionNotes = $("sessionNotes");
  const blockSummary = $("blockSummary");
  const blockLinks = $("blockLinks");
  const tutorialGrid = $("tutorialGrid");
  const tutorialConfirm = $("tutorialConfirm");
  const startRatingButton = $("startRatingButton");
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
    const block = state.block ? `block-${state.block}` : "all";
    return `gesture-rating-survey:${pid}:${block}`;
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
    [introScreen, tutorialScreen, ratingScreen, doneScreen].forEach((node) => node.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  function renderTutorial() {
    tutorialGrid.innerHTML = "";
    categories.forEach((category, index) => {
      const card = document.createElement("article");
      card.className = "tutorial-category";
      card.innerHTML = `
        <div class="tutorial-number">${index + 1}</div>
        <div>
          <h2>${category.label}</h2>
          <p>${category.definition}</p>
          <ol class="anchor-list">
            ${category.anchors.map((anchor) => `<li>${anchor}</li>`).join("")}
          </ol>
        </div>
      `;
      tutorialGrid.appendChild(card);
    });
  }

  function renderBlockLinks(totalVideos, blockSize) {
    if (!blockLinks || blockSize <= 0) return;
    const blockCount = Math.ceil(totalVideos / blockSize);
    const url = new URL(window.location.href);
    blockLinks.innerHTML = `
      <h2>20-video block URLs</h2>
      <div>
        ${Array.from({ length: blockCount }, (_, index) => {
          url.searchParams.set("block", String(index + 1));
          url.searchParams.delete("limit");
          return `<a href="${url.pathname}${url.search}">Block ${index + 1}</a>`;
        }).join("")}
      </div>
    `;
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
        <ol class="anchor-list">
          ${category.anchors.map((anchor) => `<li>${anchor}</li>`).join("")}
        </ol>
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

  function responseId(item) {
    return [
      state.participant.participantId || "anonymous",
      state.participant.sessionId || "session",
      item.collection || "video",
      item.title || "untitled",
    ].join("::");
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
        block: state.block,
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

    const response = {
      response_id: responseId(item),
      participant_id: state.participant.participantId,
      study_id: state.participant.studyId,
      session_id: state.participant.sessionId,
      collection: item.collection || "",
      source: item.source || "",
      block_id: state.block || "",
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
    state.responses[responseKey(item)] = response;
    saveState();
    return response;
  }

  function validateForm() {
    if (!watchedEnough()) {
      formWarning.textContent = "Please watch at least 80% of the video before continuing.";
      return false;
    }
    if (!ratingForm.reportValidity()) {
      formWarning.textContent = "Please complete all required ratings.";
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
      "block_id",
      "title",
      "target_word",
      "video_url",
      "order_index",
      "iconicity",
      "sensorimotor_imagery",
      "motional_salience_gesture",
      "emotional_salience_facial_expression",
      "gesture_complexity_fit",
      "cultural_familiarity",
      "enactment_potential",
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

  function payloadFor(responses) {
    return {
      participant: state.participant,
      session_started_at: state.sessionStartedAt,
      exported_at: new Date().toISOString(),
      block: state.block,
      responses,
    };
  }

  function jsonData(responses = rows()) {
    return JSON.stringify(
      payloadFor(responses),
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
      <article><strong>${state.block ? `Block ${state.block}` : "All"}</strong><span>video set</span></article>
    `;

    submitButton.disabled = !config.submitUrl;
    if (!config.submitUrl) {
      submitStatus.textContent = "No submission endpoint is configured. Use CSV or JSON download.";
    } else if (config.submitEachResponse) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitted as you go";
      submitStatus.textContent = "Each saved video response is submitted automatically. Download CSV/JSON as a backup.";
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
      await postResponses(rows());
      submitStatus.textContent =
        config.submitMode === "no-cors"
          ? "Submitted. Download CSV/JSON as a backup if this is a pilot run."
          : `Submitted. Completion code: ${config.completionCode}`;
    } catch (error) {
      submitStatus.textContent = `Submission failed: ${error.message}. Download CSV/JSON as backup.`;
      submitButton.disabled = false;
    }
  }

  async function postResponses(responses) {
    const response = await fetch(config.submitUrl, {
      method: "POST",
      mode: config.submitMode,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: jsonData(responses),
    });
    if (config.submitMode !== "no-cors" && !response.ok) throw new Error(`HTTP ${response.status}`);
  }

  function submitResponseInBackground(response) {
    if (!config.submitUrl || !config.submitEachResponse) return;
    postResponses([response]).catch((error) => {
      formWarning.textContent = `Saved locally, but Sheet submission failed: ${error.message}.`;
    });
  }

  async function loadManifest() {
    const manifestUrl = query().get("manifest") || config.manifestUrl;
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`Could not load ${manifestUrl}`);
    let videos = await response.json();
    state.totalVideos = videos.length;
    const block = Number(query().get("block") || 0);
    const blockSize = Number(query().get("block_size") || config.blockSize);
    if (block > 0 && blockSize > 0) {
      const start = (block - 1) * blockSize;
      videos = videos.slice(start, start + blockSize);
      state.block = block;
      if (videos.length === 0) {
        throw new Error(`Block ${block} has no videos. This manifest has ${Math.ceil(state.totalVideos / blockSize)} blocks.`);
      }
      blockSummary.textContent = `You are rating block ${block}: videos ${start + 1}-${Math.min(start + blockSize, state.totalVideos)} of ${state.totalVideos}.`;
    } else {
      blockSummary.textContent = `You are rating ${videos.length} videos. Use ?block=1, ?block=2, etc. to assign 20-video blocks.`;
    }
    renderBlockLinks(state.totalVideos, blockSize);
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
      block: state.block,
    };
  }

  participantForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.participant.participantId = participantId.value.trim() || `anon-${randomId()}`;
    state.participant.notes = sessionNotes.value.trim();
    state.participant.block = state.block;
    state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    loadState();
    if (!state.order.length) state.order = shuffledIndexes(state.videos.length, state.participant.participantId);
    saveState();
    tutorialConfirm.checked = false;
    startRatingButton.disabled = true;
    show(tutorialScreen);
  });

  tutorialConfirm.addEventListener("change", () => {
    startRatingButton.disabled = !tutorialConfirm.checked;
  });

  startRatingButton.addEventListener("click", () => {
    if (!tutorialConfirm.checked) return;
    renderVideo();
    show(ratingScreen);
  });

  ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    const response = collectCurrentResponse();
    submitResponseInBackground(response);
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
  renderTutorial();
  initParticipant();
  loadManifest().catch((error) => {
    document.body.innerHTML = `<main class="screen"><div class="hero-card"><h1>Survey failed to load</h1><p>${error.message}</p></div></main>`;
  });
})();
