const probeData = window.UNRELATED_PROBE || { ratings: [], rows: [] };
const probeRows = probeData.rows || [];
const probeRatings = probeData.ratings || [];

const summaryGrid = document.getElementById("summaryGrid");
const analysisBody = document.getElementById("analysisBody");
const itemsBody = document.getElementById("itemsBody");
const itemCount = document.getElementById("itemCount");
const detailPanel = document.getElementById("detailPanel");

let currentIndex = 0;

function scores(row, model) {
  return probeRatings.map((rating) => row.ratings[rating.key][model].score);
}

function highCount(row, model) {
  return scores(row, model).filter((score) => score >= 4).length;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function fmt(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function scoreBadge(score) {
  const tone = score >= 4 ? "high" : score <= 2 ? "low" : "mid";
  return `<span class="score-badge ${tone}">${score}</span>`;
}

function scoreBadges(row, model) {
  return scores(row, model).map(scoreBadge).join("");
}

function modelSummary(row, model) {
  const modelScores = scores(row, model);
  const mean = average(modelScores);
  return {
    mean,
    high: highCount(row, model),
  };
}

function readForRow(row) {
  const flash = modelSummary(row, "flash");
  const pro = modelSummary(row, "pro");
  const highDifference = Math.abs(flash.high - pro.high);
  const meanDifference = Math.abs(flash.mean - pro.mean);

  if (flash.high >= 2 && pro.high >= 2) {
    return {
      label: "Both rate the unrelated label highly",
      tone: "hot",
      detail: `Flash ${flash.high}/3 high, Pro ${pro.high}/3 high`,
    };
  }
  if (highDifference >= 2 || meanDifference >= 1.5) {
    return {
      label: "Model split",
      tone: "split",
      detail: `Flash avg ${fmt(flash.mean)}, Pro avg ${fmt(pro.mean)}`,
    };
  }
  if (flash.high <= 1 && pro.high <= 1) {
    return {
      label: "Mostly rejected",
      tone: "cool",
      detail: `Only ${flash.high + pro.high} of 6 ratings were high`,
    };
  }
  return {
    label: "Mixed signal",
    tone: "mixed",
    detail: `Flash ${flash.high}/3 high, Pro ${pro.high}/3 high`,
  };
}

function renderSummary() {
  const flashScores = probeRows.flatMap((row) => scores(row, "flash"));
  const proScores = probeRows.flatMap((row) => scores(row, "pro"));
  const flashHigh = flashScores.filter((score) => score >= 4).length;
  const proHigh = proScores.filter((score) => score >= 4).length;
  const cards = [
    ["Videos", probeRows.length, "Copied under unrelated filenames"],
    ["Flash high scores", `${flashHigh}/${flashScores.length}`, `Mean score ${fmt(average(flashScores))}`],
    ["Pro high scores", `${proHigh}/${proScores.length}`, `Mean score ${fmt(average(proScores))}`],
    ["High threshold", ">= 4", "Across Iconicity, Sensorimotor imagery, Cultural familiarity"],
  ];
  summaryGrid.innerHTML = cards
    .map(
      ([label, value, note]) => `
        <article>
          <strong>${label}</strong>
          <span>${value}</span>
          <small>${note}</small>
        </article>
      `,
    )
    .join("");
}

function renderAnalysis() {
  analysisBody.innerHTML = "";
  probeRows.forEach((row, index) => {
    const flash = modelSummary(row, "flash");
    const pro = modelSummary(row, "pro");
    const read = readForRow(row);
    const tr = document.createElement("tr");
    tr.className = index === currentIndex ? "active" : "";
    tr.innerHTML = `
      <td><strong>${row.target_word}</strong><br><span class="file-meta">${row.test_title}</span></td>
      <td>${row.original_title}</td>
      <td>
        <div class="score-badges" aria-label="Flash scores">${scoreBadges(row, "flash")}</div>
        <span class="analysis-note">avg ${fmt(flash.mean)}, ${flash.high}/3 high</span>
      </td>
      <td>
        <div class="score-badges" aria-label="Pro scores">${scoreBadges(row, "pro")}</div>
        <span class="analysis-note">avg ${fmt(pro.mean)}, ${pro.high}/3 high</span>
      </td>
      <td><span class="read-pill ${read.tone}">${read.label}</span><br><span class="analysis-note">${read.detail}</span></td>
    `;
    tr.addEventListener("click", () => {
      currentIndex = index;
      render();
    });
    analysisBody.appendChild(tr);
  });
}

function renderTable() {
  itemCount.textContent = `${probeRows.length} items`;
  itemsBody.innerHTML = "";
  probeRows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.className = index === currentIndex ? "active" : "";
    const flashScores = scores(row, "flash");
    const proScores = scores(row, "pro");
    tr.innerHTML = `
      <td><strong>${row.target_word}</strong><br><span class="file-meta">${row.test_title}</span></td>
      <td>${row.original_title}</td>
      <td class="score-list">${flashScores.join(" / ")}</td>
      <td class="score-list">${proScores.join(" / ")}</td>
      <td><span class="hot">F ${highCount(row, "flash")}/3</span><br><span class="hot">P ${highCount(row, "pro")}/3</span></td>
    `;
    tr.addEventListener("click", () => {
      currentIndex = index;
      render();
    });
    itemsBody.appendChild(tr);
  });
}

function renderDetail() {
  const row = probeRows[currentIndex];
  if (!row) return;
  detailPanel.innerHTML = `
    <div class="detail-grid">
      <div>
        <video class="detail-video" controls playsinline src="${row.video}"></video>
        <p class="file-meta">
          Test label: <strong>${row.target_word}</strong><br>
          Test file: ${row.test_title}<br>
          Original source: ${row.original_title}
        </p>
      </div>
      <div>
        ${probeRatings
          .map((rating) => {
            const value = row.ratings[rating.key];
            return `
              <article class="rating-card">
                <h3>${rating.label}</h3>
                <div class="rationale-grid">
                  <div>
                    <strong>Flash ${value.flash.score}</strong>
                    <p>${value.flash.rationale}</p>
                  </div>
                  <div>
                    <strong>Pro ${value.pro.score}</strong>
                    <p>${value.pro.rationale}</p>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function render() {
  renderSummary();
  renderAnalysis();
  renderTable();
  renderDetail();
}

render();
