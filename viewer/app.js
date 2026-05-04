const results = window.GESTURE_RESULTS || [];

const ratingLabels = [
  [
    "iconicity",
    "Iconicity",
    "How much the gesture visually resembles the target word's meaning.",
  ],
  [
    "sensorimotor_imagery",
    "Sensorimotor Imagery",
    "How much the gesture evokes bodily action, physical interaction, or perceptual experience.",
  ],
  [
    "motional_salience_gesture",
    "Motional Salience",
    "How much the gesture's movement dynamics convey emotional expressiveness.",
  ],
  [
    "emotional_salience_facial_expression",
    "Facial Emotion",
    "How much the actor's facial expression communicates affective meaning.",
  ],
  [
    "gesture_complexity_fit",
    "Complexity Fit",
    "How appropriate the gesture's motor and cognitive complexity is for learning.",
  ],
  [
    "cultural_familiarity",
    "Cultural Familiarity",
    "How likely learners are to recognize the gesture from a cultural repertoire.",
  ],
  [
    "enactment_potential",
    "Enactment Potential",
    "How easily learners could reproduce the gesture themselves.",
  ],
];

let currentIndex = 0;
const selectedModels = {};

const videoList = document.getElementById("videoList");
const videoPlayer = document.getElementById("videoPlayer");
const fileName = document.getElementById("fileName");
const targetWord = document.getElementById("targetWord");
const confidenceBadge = document.getElementById("confidenceBadge");
const ratingDescription = document.getElementById("ratingDescription");
const ratingsGrid = document.getElementById("ratingsGrid");
const ratingAmbiguities = document.getElementById("ratingAmbiguities");
const probeDescription = document.getElementById("probeDescription");
const candidateList = document.getElementById("candidateList");
const componentsList = document.getElementById("componentsList");
const probeAmbiguities = document.getElementById("probeAmbiguities");
const ratingTab = document.getElementById("ratingTab");
const probeTab = document.getElementById("probeTab");
const ratingView = document.getElementById("ratingView");
const probeView = document.getElementById("probeView");
const modelToggle = document.getElementById("modelToggle");

function itemKey(item) {
  return `${item.collection}::${item.title}`;
}

function getVariants(item) {
  return item.variants || [
    {
      key: "default",
      label: item.model,
      model: item.model,
      rating: item.rating,
      probe: item.probe,
    },
  ];
}

function getSelectedVariant(item) {
  const variants = getVariants(item);
  const selectedKey = selectedModels[itemKey(item)] || item.default_model || variants[0].key;
  return variants.find((variant) => variant.key === selectedKey) || variants[0];
}

function setActiveTab(tab) {
  const showRating = tab === "rating";
  ratingTab.classList.toggle("active", showRating);
  probeTab.classList.toggle("active", !showRating);
  ratingView.classList.toggle("active", showRating);
  probeView.classList.toggle("active", !showRating);
}

function renderList() {
  videoList.innerHTML = "";
  results.forEach((item, index) => {
    const variant = getSelectedVariant(item);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `video-button${index === currentIndex ? " active" : ""}`;
    button.innerHTML = `<strong>${item.target_word}</strong><span>${item.collection} · ${variant.label} · ${item.title}</span>`;
    button.addEventListener("click", () => {
      currentIndex = index;
      render();
    });
    videoList.appendChild(button);
  });
}

function renderModelToggle(item) {
  const variants = getVariants(item);
  const selectedVariant = getSelectedVariant(item);

  modelToggle.innerHTML = "";
  if (variants.length <= 1) {
    modelToggle.classList.add("single");
    modelToggle.textContent = selectedVariant.label;
    return;
  }

  modelToggle.classList.remove("single");
  variants.forEach((variant) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-button${variant.key === selectedVariant.key ? " active" : ""}`;
    button.textContent = variant.label;
    button.addEventListener("click", () => {
      selectedModels[itemKey(item)] = variant.key;
      render();
    });
    modelToggle.appendChild(button);
  });
}

function renderRatings(variant) {
  const rating = variant.rating;
  ratingDescription.textContent = rating.brief_gesture_description || "";
  ratingsGrid.innerHTML = "";

  ratingLabels.forEach(([key, label, hint]) => {
    const value = rating.ratings[key];
    const card = document.createElement("article");
    card.className = "rating-card";
    card.innerHTML = `
      <div class="rating-head">
        <h3>
          ${label}
          <button class="hint-button" type="button" aria-label="${label} definition">
            ?
            <span class="hint-tooltip" role="tooltip">${hint}</span>
          </button>
        </h3>
        <div class="score">${value.score}</div>
      </div>
      <p>${value.rationale}</p>
    `;
    ratingsGrid.appendChild(card);
  });

  renderListItems(ratingAmbiguities, rating.coherence_check?.possible_ambiguities || []);
}

function renderProbe(variant) {
  const probe = variant.probe;
  probeDescription.textContent = probe.brief_gesture_description || "";

  candidateList.innerHTML = "";
  (probe.candidate_meanings || []).forEach((candidate) => {
    const card = document.createElement("article");
    card.className = "candidate";
    card.innerHTML = `
      <div class="candidate-header">
        <strong>${candidate.meaning}</strong>
        <span class="confidence">${candidate.confidence}</span>
      </div>
      <p>${candidate.evidence}</p>
    `;
    candidateList.appendChild(card);
  });

  componentsList.innerHTML = "";
  Object.entries(probe.visible_components || {}).forEach(([key, value]) => {
    const row = document.createElement("div");
    const label = key.replaceAll("_", " ");
    row.innerHTML = `<dt>${label}</dt><dd>${value}</dd>`;
    componentsList.appendChild(row);
  });

  renderListItems(probeAmbiguities, probe.ambiguities || []);
}

function renderListItems(container, items) {
  container.innerHTML = "";
  if (!items.length) {
    const item = document.createElement("li");
    item.textContent = "None reported.";
    container.appendChild(item);
    return;
  }

  items.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    container.appendChild(item);
  });
}

function render() {
  const item = results[currentIndex];
  if (!item) return;
  const variant = getSelectedVariant(item);

  renderList();
  renderModelToggle(item);
  videoPlayer.src = item.video;
  fileName.textContent = item.title;
  targetWord.textContent = item.target_word;
  confidenceBadge.textContent = `${item.collection} · ${variant.model} · rating confidence: ${variant.rating.coherence_check?.confidence || "unknown"}`;

  renderRatings(variant);
  renderProbe(variant);
}

ratingTab.addEventListener("click", () => setActiveTab("rating"));
probeTab.addEventListener("click", () => setActiveTab("probe"));

render();
