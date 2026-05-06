const probeData = window.UNRELATED_PROBE || { ratings: [], rows: [] };
const probeRows = probeData.rows || [];
const probeRatings = probeData.ratings || [];

const summaryGrid = document.getElementById("summaryGrid");
const highScoreChart = document.getElementById("highScoreChart");
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

function drawHighScoreChart() {
  const context = highScoreChart.getContext("2d");
  const width = highScoreChart.width;
  const height = highScoreChart.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const padding = { top: 20, right: 24, bottom: 82, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = 3;

  context.strokeStyle = "#d7dee3";
  context.lineWidth = 1;
  context.font = "12px Inter, system-ui, sans-serif";
  for (let i = 1; i <= max; i += 1) {
    const y = padding.top + chartHeight - (i / max) * chartHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillStyle = "#64717a";
    context.fillText(String(i), 12, y + 4);
  }

  const groupWidth = chartWidth / probeRows.length;
  const barWidth = Math.max(10, Math.min(24, groupWidth / 3));
  probeRows.forEach((row, index) => {
    [
      ["flash", "#1d6f72"],
      ["pro", "#8a5a1f"],
    ].forEach(([model, color], modelIndex) => {
      const value = highCount(row, model);
      const x = padding.left + index * groupWidth + groupWidth / 2 - barWidth + modelIndex * barWidth;
      const barHeight = (value / max) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      context.fillStyle = color;
      context.fillRect(x, y, barWidth - 2, barHeight);
    });

    context.fillStyle = "#64717a";
    context.textAlign = "center";
    const label = row.target_word.length > 10 ? row.target_word.slice(0, 10) : row.target_word;
    context.fillText(label, padding.left + index * groupWidth + groupWidth / 2, height - 22);
  });
  context.textAlign = "left";
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
  drawHighScoreChart();
  renderTable();
  renderDetail();
}

render();
