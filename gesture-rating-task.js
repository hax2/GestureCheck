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
    ...(window.GESTURE_RATING_TASK_CONFIG || {}),
  };

  const copy = {
    en: {
      appTitle: "Gesture Rating Task",
      pageTitle: "Gesture Rating Task",
      language: "Language",
      participantId: "Participant ID",
      participantPlaceholder: "Optional",
      instructionsKicker: "Instructions",
      instructionsTitle: "Gesture Rating Task Instructions",
      instructionsBody: [
        "In this task, you will watch a series of gesture videos.",
        "For each video, a word and a gesture will be presented.",
        "Please answer the following question for each video using a scale from 1 to 5:",
        "There are no right or wrong answers. Please respond based on your immediate impression.",
      ],
      scaleRating: "Rating",
      scaleMeaning: "Meaning",
      dimensionHead: "Question",
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
      likert: { 1: "Very low", 2: "Low", 3: "Moderate", 4: "High", 5: "Very high" },
      dimensions: [
        ["iconicity", "How much does the gesture visually resemble the meaning of the word?"],
        ["sensorimotor_imagery", "How much does the gesture feel like a real action or experience?"],
        ["motional_salience_gesture", "How visually striking or attention grabbing is the movement?"],
        ["emotional_salience_facial_expression", "How well does the facial expression match the meaning of the word?"],
        ["cultural_familiarity", "How familiar or common does the gesture seem in your country?"],
        ["enactment_potential", "How easy would it be to imitate this gesture?"],
      ],
    },
    de: {
      appTitle: "Gestenbewertung",
      pageTitle: "Gestenbewertung",
      language: "Sprache",
      participantId: "Teilnehmer-ID",
      participantPlaceholder: "Optional",
      instructionsKicker: "Anleitung",
      instructionsTitle: "Anleitung zur Gestenbewertung",
      instructionsBody: [
        "In dieser Aufgabe werden Ihnen mehrere Videos mit Gesten gezeigt.",
        "Für jedes Video werden ein Wort und eine Geste präsentiert.",
        "Bitte beantworten Sie die folgende Frage für jedes Video anhand einer Skala von 1 bis 5:",
        "Es gibt keine richtigen oder falschen Antworten. Bitte antworten Sie basierend auf Ihrem unmittelbaren Eindruck.",
      ],
      scaleRating: "Bewertung",
      scaleMeaning: "Bedeutung",
      dimensionHead: "Frage",
      chooseAll: "Wählen Sie für jede Zeile eine Bewertung aus.",
      completeAll: "Bitte vervollständigen Sie alle sechs Bewertungen, bevor Sie fortfahren.",
      complete: "Block abgeschlossen. Ihre Bewertungen sind in diesem Browser gespeichert.",
      autoSubmitted: "Jede gespeicherte Antwort wird automatisch übermittelt.",
      savedLocalFailed: "Lokal gespeichert, aber die Übermittlung an das Sheet ist fehlgeschlagen: {message}.",
      progress: "Video {current} von {total}",
      blockSummary: "Block {block}: Videos {start}-{end} von {total}",
      saveContinue: "Speichern und fortfahren",
      finish: "Beenden",
      back: "Zurück",
      notes: "Notizen, optional",
      notesPlaceholder: "War etwas an dieser Geste unklar?",
      likert: { 1: "Sehr gering", 2: "Gering", 3: "Mittel", 4: "Hoch", 5: "Sehr hoch" },
      dimensions: [
        ["iconicity", "Wie sehr ähnelt die Geste visuell der Bedeutung des Wortes?"],
        ["sensorimotor_imagery", "Wie sehr fühlt sich die Geste wie eine reale Handlung oder Erfahrung an?"],
        ["motional_salience_gesture", "Wie visuell auffällig oder aufmerksamkeitsstark ist die Bewegung?"],
        ["emotional_salience_facial_expression", "Wie gut passt der Gesichtsausdruck zur Bedeutung des Wortes?"],
        ["cultural_familiarity", "Wie vertraut oder verbreitet erscheint dir diese Geste in deinem Land?"],
        ["enactment_potential", "Wie leicht wäre es, diese Geste nachzuahmen?"],
      ],
    },
    it: {
      appTitle: "Valutazione dei Gesti",
      pageTitle: "Valutazione dei Gesti",
      language: "Lingua",
      participantId: "ID partecipante",
      participantPlaceholder: "Facoltativo",
      instructionsKicker: "Istruzioni",
      instructionsTitle: "Istruzioni per la valutazione dei gesti",
      instructionsBody: [
        "In questo compito verranno mostrati diversi video di gesti.",
        "Per ogni video saranno presentati una parola e un gesto.",
        "Si prega di rispondere alla seguente domanda per ciascun video utilizzando una scala da 1 a 5:",
        "Non ci sono risposte giuste o sbagliate. Si prega di rispondere in base alla propria impressione immediata.",
      ],
      scaleRating: "Valutazione",
      scaleMeaning: "Significato",
      dimensionHead: "Domanda",
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
      likert: { 1: "Molto basso", 2: "Basso", 3: "Medio", 4: "Alto", 5: "Molto alto" },
      dimensions: [
        ["iconicity", "Quanto assomiglia il gesto visivamente al significato della parola?"],
        ["sensorimotor_imagery", "Quanto sembra il gesto una vera azione o esperienza?"],
        ["motional_salience_gesture", "Quanto è visivamente sorprendente o capace di attirare l'attenzione il movimento?"],
        ["emotional_salience_facial_expression", "Quanto corrisponde l'espressione facciale al significato della parola?"],
        ["cultural_familiarity", "Quanto è familiare o comune questo gesto nel tuo Paese?"],
        ["enactment_potential", "Quanto sarebbe facile imitare questo gesto?"],
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
    language: ["en", "de", "it"].includes(new URLSearchParams(window.location.search).get("lang"))
      ? new URLSearchParams(window.location.search).get("lang")
      : "en",
  };

  const $ = (id) => document.getElementById(id);
  const appTitle = $("appTitle");
  const targetWord = $("targetWord");
  const videoTitle = $("videoTitle");
  const stimulusWord = $("stimulusWord");
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
  const instructionsKicker = $("instructionsKicker");
  const instructionsTitle = $("instructionsTitle");
  const instructionsBody = $("instructionsBody");
  const scaleRatingHead = $("scaleRatingHead");
  const scaleMeaningHead = $("scaleMeaningHead");
  const scaleRows = $("scaleRows");
  const dimensionHead = $("dimensionHead");

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
    return `gesture-rating-task:${participantId.value.trim() || "anonymous"}:block-${state.block}`;
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

  function renderInstructions() {
    const labels = t().likert;
    instructionsBody.innerHTML = t().instructionsBody.map((paragraph) => `<p>${paragraph}</p>`).join("");
    scaleRows.innerHTML = Object.entries(labels).map(([score, meaning]) => `
      <tr>
        <td>${score}</td>
        <td>${meaning}</td>
      </tr>
    `).join("");
  }

  function applyLanguage() {
    document.documentElement.lang = state.language;
    document.title = t().pageTitle;
    appTitle.textContent = t().appTitle;
    languageSelect.previousElementSibling.textContent = t().language;
    participantId.previousElementSibling.textContent = t().participantId;
    participantId.placeholder = t().participantPlaceholder;
    instructionsKicker.textContent = t().instructionsKicker;
    instructionsTitle.textContent = t().instructionsTitle;
    scaleRatingHead.textContent = t().scaleRating;
    scaleMeaningHead.textContent = t().scaleMeaning;
    dimensionHead.textContent = t().dimensionHead;
    const labels = t().likert;
    Object.entries(labels).forEach(([score, label]) => {
      document.querySelector(`[data-label="${score}"]`).textContent = label;
    });
    notesLabel.textContent = t().notes;
    notes.placeholder = t().notesPlaceholder;
    backButton.textContent = t().back;
    saveStatus.textContent = config.submitUrl ? t().autoSubmitted : t().chooseAll;
    renderInstructions();
    renderRows();
    renderVideo();
  }

  function renderRows() {
    const item = currentItem();
    const saved = item ? state.responses[responseKey(item)] : null;
    const ratings = saved?.ratings || {};
    ratingRows.innerHTML = "";

    t().dimensions.forEach(([key, question]) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="dimension-cell">
          <span class="question">${question}</span>
        </td>
        ${[1, 2, 3, 4, 5].map((score) => `
          <td class="choice-cell">
            <label class="choice" aria-label="${question}: ${score}">
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
      stimulusWord.textContent = "";
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
    stimulusWord.textContent = item.target_word || item.title;
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
