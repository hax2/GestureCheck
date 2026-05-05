const payload = window.RATING_DASHBOARD || { ratings: [], rows: [] };
const rows = payload.rows || [];
const ratings = payload.ratings || [];

const searchInput = document.getElementById("searchInput");
const collectionFilter = document.getElementById("collectionFilter");
const ratingFilter = document.getElementById("ratingFilter");
const sortSelect = document.getElementById("sortSelect");
const completeOnly = document.getElementById("completeOnly");
const totalCount = document.getElementById("totalCount");
const completeCount = document.getElementById("completeCount");
const meanDelta = document.getElementById("meanDelta");
const maxDelta = document.getElementById("maxDelta");
const visibleCount = document.getElementById("visibleCount");
const itemsBody = document.getElementById("itemsBody");
const detailDrawer = document.getElementById("detailDrawer");
const averageChart = document.getElementById("averageChart");
const deltaChart = document.getElementById("deltaChart");

const ratingDefinitions = {
  iconicity: "The degree to which the gesture visually resembles the semantics of the target word.",
  sensorimotor_imagery:
    "The extent to which the gesture evokes bodily actions, physical interactions, or perceptual experiences related to the word's semantics.",
  motional_salience_gesture:
    "How strongly a gesture stands out based on its movement features, such as large, fast, or complex actions, thereby guiding attention and supporting encoding.",
  emotional_salience_facial_expression:
    "The extent to which facial expressions accompanying the gesture communicate affective meaning.",
  gesture_complexity_fit:
    "The degree to which the gesture's motor and cognitive complexity is appropriate for the learning context.",
  cultural_familiarity:
    "The degree to which a gesture is readily recognized and interpreted based on shared sociocultural conventions and prior experience, defined here with respect to Western cultural contexts.",
  enactment_potential: "How easily learners can reproduce the gesture themselves.",
};

function initControls() {
  const collections = [...new Set(rows.map((row) => row.collection).filter(Boolean))].sort();
  collections.forEach((collection) => {
    const option = document.createElement("option");
    option.value = collection;
    option.textContent = collection;
    collectionFilter.appendChild(option);
  });

  ratings.forEach((rating) => {
    const option = document.createElement("option");
    option.value = rating.key;
    option.textContent = rating.label;
    ratingFilter.appendChild(option);
  });
}

function selectedRating() {
  return ratingFilter.value || ratings[0]?.key;
}

function ratingValue(row, model, key = selectedRating()) {
  return row.ratings?.[key]?.[model]?.score ?? null;
}

function deltaValue(row, key = selectedRating()) {
  return row.ratings?.[key]?.delta ?? null;
}

function filteredRows() {
  const query = searchInput.value.trim().toLowerCase();
  const collection = collectionFilter.value;
  return rows
    .filter((row) => !completeOnly.checked || row.complete)
    .filter((row) => collection === "all" || row.collection === collection)
    .filter((row) => {
      if (!query) return true;
      return `${row.target_word} ${row.title}`.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (sortSelect.value === "target_word") {
        return a.target_word.localeCompare(b.target_word);
      }
      const left = a[sortSelect.value] ?? -1;
      const right = b[sortSelect.value] ?? -1;
      return right - left;
    });
}

function average(values) {
  const clean = values.filter((value) => typeof value === "number");
  if (!clean.length) return null;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function fmt(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function renderSummary(visibleRows) {
  const deltas = visibleRows.flatMap((row) =>
    ratings
      .map((rating) => row.ratings?.[rating.key]?.delta)
      .filter((value) => typeof value === "number")
      .map((value) => Math.abs(value)),
  );
  totalCount.textContent = rows.length;
  completeCount.textContent = rows.filter((row) => row.complete).length;
  meanDelta.textContent = fmt(average(deltas) ?? 0);
  maxDelta.textContent = fmt(Math.max(0, ...deltas));
  visibleCount.textContent = `${visibleRows.length} visible`;
}

function drawBarChart(canvas, labels, series) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const padding = { top: 20, right: 22, bottom: 78, left: 42 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const max = Math.max(5, ...series.flatMap((entry) => entry.values.filter((value) => value !== null)));

  context.strokeStyle = "#d7dee3";
  context.lineWidth = 1;
  for (let i = 1; i <= 5; i += 1) {
    const y = padding.top + chartHeight - (i / max) * chartHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillStyle = "#64717a";
    context.fillText(String(i), 10, y + 4);
  }

  context.font = "12px Inter, system-ui, sans-serif";
  const groupWidth = chartWidth / labels.length;
  const barWidth = Math.max(8, Math.min(24, groupWidth / (series.length + 1)));
  labels.forEach((label, index) => {
    series.forEach((entry, seriesIndex) => {
      const value = entry.values[index];
      if (value === null) return;
      const x = padding.left + index * groupWidth + seriesIndex * barWidth + groupWidth / 2 - barWidth;
      const barHeight = (value / max) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      context.fillStyle = entry.color;
      context.fillRect(x, y, barWidth - 2, barHeight);
    });
    context.fillStyle = "#64717a";
    context.textAlign = "center";
    const labelLines = label.split(" ");
    const labelX = padding.left + index * groupWidth + groupWidth / 2;
    const labelY = padding.top + chartHeight + 18;
    labelLines.forEach((line, lineIndex) => {
      context.fillText(line, labelX, labelY + lineIndex * 14);
    });
  });
}

function drawHorizontalChart(canvas, items, key) {
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  const padding = { top: 18, right: 28, bottom: 16, left: 170 };
  const max = Math.max(1, ...items.map((item) => Math.abs(deltaValue(item, key) ?? 0)));
  const rowHeight = (height - padding.top - padding.bottom) / Math.max(1, items.length);
  items.forEach((item, index) => {
    const delta = deltaValue(item, key) ?? 0;
    const y = padding.top + index * rowHeight + 5;
    const barWidth = (Math.abs(delta) / max) * (width - padding.left - padding.right);
    context.fillStyle = "#64717a";
    context.fillText(item.target_word.slice(0, 24), 8, y + rowHeight / 2);
    context.fillStyle = Math.abs(delta) >= 2 ? "#a33a3a" : "#8a5a1f";
    context.fillRect(padding.left, y, barWidth, Math.max(8, rowHeight - 8));
    context.fillStyle = "#182026";
    context.fillText(String(delta), padding.left + barWidth + 6, y + rowHeight / 2);
  });
}

function renderCharts(visibleRows) {
  const labels = ratings.map((rating) => rating.label);
  drawBarChart(averageChart, labels, [
    {
      color: "#1d6f72",
      values: ratings.map((rating) => average(visibleRows.map((row) => ratingValue(row, "flash", rating.key)))),
    },
    {
      color: "#8a5a1f",
      values: ratings.map((rating) => average(visibleRows.map((row) => ratingValue(row, "pro", rating.key)))),
    },
  ]);

  const key = selectedRating();
  const top = [...visibleRows]
    .filter((row) => typeof deltaValue(row, key) === "number")
    .sort((a, b) => Math.abs(deltaValue(b, key)) - Math.abs(deltaValue(a, key)))
    .slice(0, 12);
  drawHorizontalChart(deltaChart, top, key);
}

function renderTable(visibleRows) {
  const key = selectedRating();
  itemsBody.innerHTML = "";
  visibleRows.forEach((row) => {
    const delta = deltaValue(row, key);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${row.target_word}</strong><br><span class="confidence">${row.title}</span></td>
      <td>${row.collection}</td>
      <td>${row.ratings[key]?.label || key}</td>
      <td>${fmt(ratingValue(row, "flash", key))}</td>
      <td>${fmt(ratingValue(row, "pro", key))}</td>
      <td class="delta ${Math.abs(delta ?? 0) >= 2 ? "hot" : ""}">${fmt(delta)}</td>
      <td class="confidence">F: ${row.flash_confidence || "-"}<br>P: ${row.pro_confidence || "-"}</td>
    `;
    tr.addEventListener("click", () => openDetail(row));
    itemsBody.appendChild(tr);
  });
}

function openDetail(row) {
  detailDrawer.innerHTML = `
    <div class="detail-head">
      <div>
        <p class="eyebrow">${row.collection}</p>
        <h2>${row.target_word}</h2>
        <p class="confidence">${row.title}</p>
      </div>
      <button class="detail-close" type="button" aria-label="Close">×</button>
    </div>
    <video class="detail-video" controls playsinline src="${row.video || ""}"></video>
    ${ratings
      .map((rating) => {
        const value = row.ratings[rating.key];
        const definition = ratingDefinitions[rating.key] || "No definition available.";
        return `
          <article class="detail-card">
            <h3 class="rating-title" tabindex="0">
              <span>${rating.label}</span>
              <span class="category-help" aria-hidden="true">?</span>
              <span class="category-tooltip" role="tooltip">${definition}</span>
              <span class="rating-delta">delta ${fmt(value.delta)}</span>
            </h3>
            <div class="rationale-grid">
              <div>
                <strong>Flash ${fmt(value.flash.score)}</strong>
                <p>${value.flash.rationale || "Missing"}</p>
              </div>
              <div>
                <strong>Pro ${fmt(value.pro.score)}</strong>
                <p>${value.pro.rationale || "Missing"}</p>
              </div>
            </div>
          </article>
        `;
      })
      .join("")}
  `;
  detailDrawer.querySelector(".detail-close").addEventListener("click", () => {
    detailDrawer.classList.remove("open");
  });
  detailDrawer.classList.add("open");
}

function render() {
  const visibleRows = filteredRows();
  renderSummary(visibleRows);
  renderCharts(visibleRows);
  renderTable(visibleRows);
}

initControls();
[searchInput, collectionFilter, ratingFilter, sortSelect, completeOnly].forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});
render();
