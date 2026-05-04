const results = window.GESTURE_RESULTS || [];

const ratingLabels = [
  ["iconicity", "Iconicity"],
  ["sensorimotor_imagery", "Sensorimotor Imagery"],
  ["motional_salience_gesture", "Motional Salience"],
  ["emotional_salience_facial_expression", "Facial Emotion"],
  ["gesture_complexity_fit", "Complexity Fit"],
  ["cultural_familiarity", "Cultural Familiarity"],
  ["enactment_potential", "Enactment Potential"],
];

let currentIndex = 0;

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
    const button = document.createElement("button");
    button.type = "button";
    button.className = `video-button${index === currentIndex ? " active" : ""}`;
    button.innerHTML = `<strong>${item.target_word}</strong><span>${item.title}</span>`;
    button.addEventListener("click", () => {
      currentIndex = index;
      render();
    });
    videoList.appendChild(button);
  });
}

function renderRatings(item) {
  const rating = item.rating;
  ratingDescription.textContent = rating.brief_gesture_description || "";
  ratingsGrid.innerHTML = "";

  ratingLabels.forEach(([key, label]) => {
    const value = rating.ratings[key];
    const card = document.createElement("article");
    card.className = "rating-card";
    card.innerHTML = `
      <div class="rating-head">
        <h3>${label}</h3>
        <div class="score">${value.score}</div>
      </div>
      <p>${value.rationale}</p>
    `;
    ratingsGrid.appendChild(card);
  });

  renderListItems(ratingAmbiguities, rating.coherence_check?.possible_ambiguities || []);
}

function renderProbe(item) {
  const probe = item.probe;
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

  renderList();
  videoPlayer.src = item.video;
  fileName.textContent = item.title;
  targetWord.textContent = item.target_word;
  confidenceBadge.textContent = `Rating confidence: ${item.rating.coherence_check?.confidence || "unknown"}`;

  renderRatings(item);
  renderProbe(item);
}

ratingTab.addEventListener("click", () => setActiveTab("rating"));
probeTab.addEventListener("click", () => setActiveTab("probe"));

render();
