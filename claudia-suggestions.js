(function () {
  const config = {
    manifestUrl: "all_rating_videos.json",
    assetBaseUrl: "assets/rating-videos/",
    submitUrl: "https://script.google.com/macros/s/AKfycbwuSNHhGiSg9LSKNdlb1NvyAAFGtObsl3gGcrz0L-KglJsXA_FErZ0f9qBylGHKNZEM/exec",
    submitMode: "no-cors",
    submitEachResponse: true,
    completionUrl: "",
    completionCode: "GESTURE-RATING-COMPLETE",
    blockSize: 20,
    ...window.CLAUDIA_SURVEY_CONFIG,
  };

  const copy = {
    en: {
      chooseAll: "Choose one score for each row.",
      completeAll: "Please complete all six ratings before continuing.",
      complete: "Block complete. Your ratings are saved in this browser.",
      autoSubmitted: "Each saved response is submitted automatically.",
      savedLocalFailed: "Saved locally, but Sheet submission failed: {message}.",
      progress: "Video {current} of {total}",
      blockSummary: "Block {block}: videos {start}-{end} of {total}",
      saveContinue: "Save and continue",
      finish: "Finish",
      back: "Back",
      notes: "Notes, optional",
      notesPlaceholder: "Anything unclear about this gesture?",
      likert: { 1: "Not at all", 2: "Slightly", 3: "Moderately", 4: "Strongly", 5: "Very strongly" },
      dimensions: [
        ["iconicity", "Iconicity", "How much does the gesture visually resemble the meaning of the word?"],
        ["sensorimotor_imagery", "Sensorimotor imagery", "How much does the gesture evoke physical actions, movements, or bodily experiences related to the word?"],
        ["emotional_salience_gesture", "Emotional salience (gesture)", "How much do the movement dynamics of the gesture convey emotional expressiveness?"],
        ["emotional_salience_face", "Emotional salience (face)", "How much do the facial expressions communicate emotions or emotional states?"],
        ["cultural_familiarity", "Cultural familiarity", "How familiar or common does the gesture seem in your sociocultural context?"],
        ["enactment", "Enactment", "How easy would it be to imitate or reproduce this gesture?"],
      ],
    },
    it: {
      chooseAll: "Scegli un punteggio per ogni riga.",
      completeAll: "Completa tutte e sei le valutazioni prima di continuare.",
      complete: "Blocco completato. Le valutazioni sono salvate in questo browser.",
      autoSubmitted: "Ogni risposta salvata viene inviata automaticamente.",
      savedLocalFailed: "Salvato localmente, ma l'invio al foglio non è riuscito: {message}.",
      progress: "Video {current} di {total}",
      blockSummary: "Blocco {block}: video {start}-{end} di {total}",
      saveContinue: "Salva e continua",
      finish: "Fine",
      back: "Indietro",
      notes: "Note, facoltative",
      notesPlaceholder: "Qualcosa non era chiaro in questo gesto?",
      likert: { 1: "Per niente", 2: "Poco", 3: "Moderatamente", 4: "Molto", 5: "Moltissimo" },
      dimensions: [
        ["iconicity", "Iconicità", "Quanto il gesto assomiglia visivamente al significato della parola?"],
        ["sensorimotor_imagery", "Immaginazione sensomotoria", "Quanto il gesto richiama azioni fisiche, movimenti o esperienze corporee legate alla parola?"],
        ["emotional_salience_gesture", "Salienza emotiva (gesto)", "In che misura le dinamiche del gesto trasmettono espressività emotiva?"],
        ["emotional_salience_face", "Salienza emotiva (viso)", "Quanto le espressioni del viso comunicano emozioni o stati emotivi?"],
        ["cultural_familiarity", "Familiarità culturale", "Quanto è familiare o comune il gesto nel tuo contesto socio-culturale?"],
        ["enactment", "Esecuzione", "Quanto sarebbe facile imitare o ripetere questo gesto?"],
      ],
    },
  };

  const state = {
    videos: [],
    totalVideos: 0,
    block: 1,
    blockStart: 0,
    blockEnd: 0,
    index: 0,
    responses: {},
    language: new URLSearchParams(window.location.search).get("lang") === "it" ? "it" : "en",
  };

  const $ = (id) => document.getElementById(id);
  const targetWord = $("targetWord");
  const videoTitle = $("videoTitle");
  const videoPlayer = $("videoPlayer");
  const progressText = $("progressText");
  const progressBar = $("progressBar");
  const saveStatus = $("saveStatus");
  const blockSummary = $("blockSummary");
  const languageSelect = $("languageSelect");
  const participantId = $("participantId");
  const ratingForm = $("ratingForm");
  const ratingRows = $("ratingRows");
  const notes = $("notes");
  const notesLabel = $("notesLabel");
  const backButton = $("backButton");
  const nextButton = $("nextButton");

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

  function t() {
    return copy[state.language] || copy.en;
  }

  function format(text, values) {
    return text.replaceAll(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  }

  function query() {
    return new URLSearchParams(window.location.search);
  }

  function syncUrl(overrides = {}) {
    const url = new URL(window.location.href);
    const current = query();
    const next = {
      manifest: current.get("manifest") || null,
      block_size: current.get("block_size") || String(config.blockSize),
      block: String(state.block),
      lang: state.language,
      ...overrides,
    };
    Object.entries(next).forEach(([key, value]) => {
      if (value == null || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState({}, "", url.toString());
  }

  function storageKey() {
    return `claudia-suggestions:${participantId.value.trim() || "anonymous"}:block-${state.block}`;
  }

  function responseKey(item) {
    return `${item.collection || "video"}::${item.title}`;
  }

  function currentItem() {
    return state.videos[state.index];
  }

  function setSelectedStyles() {
    ratingRows.querySelectorAll(".choice").forEach((label) => {
      const input = label.querySelector("input");
      label.classList.toggle("selected", input.checked);
    });
  }

  function applyLanguage() {
    const labels = t().likert;
    Object.entries(labels).forEach(([score, label]) => {
      document.querySelector(`[data-label="${score}"]`).textContent = label;
    });
    notesLabel.textContent = t().notes;
    notes.placeholder = t().notesPlaceholder;
    backButton.textContent = t().back;
    saveStatus.textContent = config.submitUrl ? t().autoSubmitted : t().chooseAll;
    renderRows();
    renderVideo();
  }

  function renderRows() {
    const item = currentItem();
    const saved = item ? state.responses[responseKey(item)] : null;
    const ratings = saved?.ratings || {};
    ratingRows.innerHTML = "";

    t().dimensions.forEach(([key, label, question]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="dimension-cell">
          <span class="dimension-name">${label}</span>
          <span class="question">${question}</span>
        </td>
        ${[1, 2, 3, 4, 5].map((score) => `
          <td class="choice-cell">
            <label class="choice" aria-label="${label}: ${score}">
              <input type="radio" name="${key}" value="${score}" ${ratings[key] === score ? "checked" : ""}>
              <span class="choice-mark"></span>
            </label>
          </td>
        `).join("")}
      `;
      ratingRows.appendChild(row);
    });
    setSelectedStyles();
  }

  function renderVideo() {
    const item = currentItem();
    if (!item) {
      targetWord.textContent = "Complete";
      videoTitle.textContent = "";
      videoPlayer.removeAttribute("src");
      videoPlayer.load();
      progressText.textContent = format(t().progress, { current: state.videos.length, total: state.videos.length });
      blockSummary.textContent = format(t().blockSummary, { block: state.block, start: state.blockStart + 1, end: state.blockEnd, total: state.totalVideos });
      progressBar.style.width = "100%";
      saveStatus.textContent = t().complete;
      nextButton.disabled = true;
      backButton.disabled = state.videos.length === 0;
      return;
    }

    targetWord.textContent = item.target_word || item.title;
    videoTitle.textContent = item.title;
    progressText.textContent = format(t().progress, { current: state.index + 1, total: state.videos.length });
    blockSummary.textContent = format(t().blockSummary, { block: state.block, start: state.blockStart + 1, end: state.blockEnd, total: state.totalVideos });
    progressBar.style.width = `${Math.round((state.index / Math.max(state.videos.length, 1)) * 100)}%`;
    backButton.disabled = state.index === 0;
    nextButton.disabled = false;
    nextButton.textContent = state.index >= state.videos.length - 1 ? t().finish : t().saveContinue;

    const saved = state.responses[responseKey(item)];
    notes.value = saved?.notes || "";
    videoPlayer.src = videoUrl(item);
    videoPlayer.load();
  }

  function selectedRatings() {
    const ratings = {};
    for (const [key] of t().dimensions) {
      const selected = ratingForm.querySelector(`input[name="${key}"]:checked`);
      if (!selected) return null;
      ratings[key] = Number(selected.value);
    }
    return ratings;
  }

  function saveCurrent() {
    const item = currentItem();
    if (!item) return true;
    const ratings = selectedRatings();
    if (!ratings) {
      saveStatus.textContent = t().completeAll;
      saveStatus.classList.add("warning");
      return false;
    }
    saveStatus.classList.remove("warning");
    const response = {
      participant_id: participantId.value.trim(),
      language: state.language,
      collection: item.collection || "",
      source: item.source || "",
      title: item.title,
      target_word: item.target_word || item.title,
      video_url: videoUrl(item),
      ratings,
      notes: notes.value.trim(),
      saved_at: new Date().toISOString(),
    };
    state.responses[responseKey(item)] = response;
    localStorage.setItem(storageKey(), JSON.stringify({ index: state.index, responses: state.responses }));
    submitResponseInBackground(response);
    return true;
  }

  function loadSaved() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || "null");
      if (!saved) return;
      state.index = Math.min(saved.index || 0, Math.max(state.videos.length - 1, 0));
      state.responses = saved.responses || {};
    } catch {
      localStorage.removeItem(storageKey());
    }
  }

  function payloadFor(responses) {
    return {
      participant: {
        participantId: participantId.value.trim(),
        language: state.language,
        block: state.block,
      },
      session_started_at: new Date().toISOString(),
      exported_at: new Date().toISOString(),
      block: state.block,
      responses,
    };
  }

  async function postResponses(responses) {
    const response = await fetch(config.submitUrl, {
      method: "POST",
      mode: config.submitMode,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payloadFor(responses)),
    });
    if (config.submitMode !== "no-cors" && !response.ok) throw new Error(`HTTP ${response.status}`);
  }

  function submitResponseInBackground(response) {
    if (!config.submitUrl || !config.submitEachResponse) return;
    postResponses([response]).catch((error) => {
      saveStatus.textContent = format(t().savedLocalFailed, { message: error.message });
      saveStatus.classList.add("warning");
    });
  }

  ratingForm.addEventListener("change", () => {
    saveStatus.classList.remove("warning");
    saveStatus.textContent = config.submitUrl ? t().autoSubmitted : t().chooseAll;
    setSelectedStyles();
  });

  ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!saveCurrent()) return;
    if (state.index >= state.videos.length - 1) {
      state.index = state.videos.length;
      renderVideo();
      return;
    }
    state.index += 1;
    renderRows();
    renderVideo();
  });

  backButton.addEventListener("click", () => {
    saveCurrent();
    state.index = Math.max(0, state.index - 1);
    renderRows();
    renderVideo();
  });

  languageSelect.addEventListener("change", () => {
    state.language = languageSelect.value;
    syncUrl({ lang: state.language });
    applyLanguage();
  });

  participantId.addEventListener("change", () => {
    loadSaved();
    renderRows();
    renderVideo();
  });

  async function init() {
    languageSelect.value = state.language;
    const params = query();
    const manifestUrl = params.get("manifest") || config.manifestUrl;
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error("Could not load video manifest");
    const videos = await response.json();
    state.totalVideos = videos.length;
    const blockSize = Math.max(1, Number(params.get("block_size") || config.blockSize));
    state.block = Math.max(1, Number(params.get("block") || 1));
    state.blockStart = (state.block - 1) * blockSize;
    state.blockEnd = Math.min(state.blockStart + blockSize, state.totalVideos);
    state.videos = videos.slice(state.blockStart, state.blockEnd);
    if (!state.videos.length) {
      throw new Error(`Block ${state.block} has no videos. This manifest has ${Math.ceil(state.totalVideos / blockSize)} blocks.`);
    }
    syncUrl({
      lang: state.language,
      block: String(state.block),
      block_size: String(blockSize),
      manifest: manifestUrl === config.manifestUrl ? null : manifestUrl,
    });
    loadSaved();
    applyLanguage();
  }

  init().catch((error) => {
    targetWord.textContent = "Could not load videos";
    videoTitle.textContent = error.message;
  });
})();
