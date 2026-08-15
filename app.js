const STORAGE_KEY = "summerHomeworkData_v2";
const DEADLINE = "2026-08-24";

const CATEGORIES = [
  { key: "school", label: "学校の宿題", color: "var(--cat-school)", hex: "#e0483e" },
  { key: "freestep", label: "フリーステップ", color: "var(--cat-freestep)", hex: "#eab308" },
  { key: "shingaku", label: "進学くらぶ", color: "var(--cat-shingaku)", hex: "#3b82f6" },
];

function mascotSvg(hex, size) {
  const h = Math.round(size * 1.21);
  return `
    <svg width="${size}" height="${h}" viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg" class="mascot-icon" aria-hidden="true">
      <line x1="14" y1="10" x2="14" y2="2" stroke="#4a7c2a" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="14" cy="1.5" rx="4" ry="2.3" fill="#8fe07a"/>
      <ellipse cx="14" cy="22" rx="11" ry="12" fill="${hex}"/>
      <circle cx="10" cy="20" r="1.6" fill="#2b2b2b"/>
      <circle cx="18" cy="20" r="1.6" fill="#2b2b2b"/>
      <ellipse cx="9" cy="33" rx="3.3" ry="1.8" fill="${hex}"/>
      <ellipse cx="19" cy="33" rx="3.3" ry="1.8" fill="${hex}"/>
    </svg>
  `;
}

const STATUS_LABEL = {
  "not-started": "🌱 未着手",
  "in-progress": "🌿 進行中",
  done: "🌸 完了",
  overdue: "🥀 期限超過",
};
const STATUS_RANK = { overdue: 0, "in-progress": 1, "not-started": 2, done: 3 };

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function numberLabels(count) {
  return Array.from({ length: count }, (_, i) => String(i + 1));
}
function kaiLabels(count) {
  return Array.from({ length: count }, (_, i) => `第${i + 1}回`);
}
function makeUnit(name, labels, doneFlags) {
  const items = labels.map((label, i) => ({
    label,
    done: Array.isArray(doneFlags) ? !!doneFlags[i] : !!doneFlags,
  }));
  return { name, items };
}

function buildPresetData() {
  const percentItems = [
    { title: "夏休み作品制作", category: "school", subject: "" },
    { title: "新聞作成", category: "school", subject: "" },
    { title: "自主勉強", category: "school", subject: "" },
    { title: "リコーダー練習(動画投稿)", category: "school", subject: "音楽" },
    { title: "川柳", category: "school", subject: "国語" },
    { title: "フリーステップ宿題", category: "freestep", subject: "" },
  ].map((base) => ({
    id: generateId(),
    title: base.title,
    category: base.category,
    subject: base.subject,
    mode: "percent",
    percent: 0,
  }));

  const drillKokugo = {
    id: generateId(),
    title: "ドリルパーク(国語)",
    category: "school",
    subject: "国語",
    mode: "units",
    units: [
      makeUnit("書きドリル", numberLabels(31), true),
      makeUnit("読みドリル", numberLabels(31), true),
      makeUnit("敬語", ["1-1", "まとめ", "応用", "5-1"], [true, true, true, false]),
      makeUnit("漢字の成り立ち", ["2-1", "まとめ", "応用", "5-2"], [true, false, false, false]),
    ],
  };

  const drillSansu = {
    id: generateId(),
    title: "ドリルパーク(算数)",
    category: "school",
    subject: "算数",
    mode: "units",
    units: [
      makeUnit("合同な図形", ["6-1", "まとめ", "応用1", "応用2"], false),
      makeUnit("整数と小数", ["19-1", "19-2"], false),
      makeUnit("体積", ["19-3", "19-4"], false),
      makeUnit("比例", ["19-5", "19-6"], false),
      makeUnit("小数のかけ算", ["19-7", "19-8", "19-9", "19-10"], false),
      makeUnit("夏休みまでの練習", ["20-1"], false),
    ],
  };

  const drillShakai = {
    id: generateId(),
    title: "ドリルパーク(社会)",
    category: "school",
    subject: "社会",
    mode: "units",
    units: [
      makeUnit(
        "社会ドリル",
        ["3-1", "3-2", "3-3", "まとめ", "応用", "10-1", "10-2", "10-3", "10-4", "10-5"],
        false
      ),
    ],
  };

  const drillRika = {
    id: generateId(),
    title: "ドリルパーク(理科)",
    category: "school",
    subject: "理科",
    mode: "units",
    units: [
      makeUnit("理科ドリル", Array.from({ length: 8 }, (_, i) => `11-${i + 1}`), false),
    ],
  };

  const shingakuRika = {
    id: generateId(),
    title: "進学くらぶ(理科)",
    category: "shingaku",
    subject: "理科",
    mode: "units",
    units: [makeUnit("予習ナビ 小5理科", kaiLabels(17), false)],
  };

  const shingakuShakai = {
    id: generateId(),
    title: "進学くらぶ(社会)",
    category: "shingaku",
    subject: "社会",
    mode: "units",
    units: [makeUnit("予習ナビ 小5社会", kaiLabels(17), false)],
  };

  return [...percentItems, drillKokugo, drillSansu, drillShakai, drillRika, shingakuRika, shingakuShakai];
}

function loadHomeworkList() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const preset = buildPresetData();
    saveHomeworkList(preset);
    return preset;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHomeworkList(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getProgress(item) {
  if (item.mode === "percent") return item.percent;
  if (item.mode === "count") {
    return item.count.total > 0 ? Math.round((item.count.done / item.count.total) * 100) : 0;
  }
  if (item.mode === "units") {
    const all = item.units.flatMap((u) => u.items);
    if (all.length === 0) return 0;
    const done = all.filter((i) => i.done).length;
    return Math.round((done / all.length) * 100);
  }
  return 0;
}

function unitProgress(unit) {
  if (unit.items.length === 0) return 0;
  const done = unit.items.filter((i) => i.done).length;
  return Math.round((done / unit.items.length) * 100);
}

function isOverdue() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(DEADLINE + "T00:00:00");
  return today > deadline;
}

function remainingDays() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(DEADLINE + "T00:00:00");
  return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
}

function getStatus(item) {
  const progress = getProgress(item);
  if (progress >= 100) return "done";
  if (isOverdue()) return "overdue";
  if (progress > 0) return "in-progress";
  return "not-started";
}

function formatMD(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const manualToggle = new Set();
function isUnitExpanded(item, unitIndex, unit) {
  const key = `${item.id}:${unitIndex}`;
  const defaultExpanded = unitProgress(unit) < 100;
  return manualToggle.has(key) ? !defaultExpanded : defaultExpanded;
}

function renderOverview(list) {
  const overall = list.length
    ? Math.round(list.reduce((s, i) => s + getProgress(i), 0) / list.length)
    : 0;
  document.getElementById("stat-overall").textContent = `${overall}%`;
  document.getElementById("overview-fill").style.width = `${overall}%`;

  const days = remainingDays();
  document.getElementById("stat-days").textContent =
    days > 0 ? `${days}日` : days === 0 ? "今日まで" : "終了";

  const paceEl = document.getElementById("stat-pace");
  if (days > 0) {
    const remain = Math.max(0, 100 - overall);
    paceEl.textContent = `${(remain / days).toFixed(1)}%`;
  } else {
    paceEl.textContent = overall >= 100 ? "達成" : "-";
  }

  document.getElementById("header-sub").textContent =
    `共通期限 ${formatMD(DEADLINE)}まで、あと${Math.max(0, days)}日`;

  const catListEl = document.getElementById("category-list");
  catListEl.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const items = list.filter((i) => i.category === cat.key);
    const pct = items.length
      ? Math.round(items.reduce((s, i) => s + getProgress(i), 0) / items.length)
      : 0;
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      ${mascotSvg(cat.hex, 18)}
      <span class="category-name">${cat.label}</span>
      <div class="category-track"><div class="category-fill" style="width:${pct}%; background:${cat.color}"></div></div>
      <span class="category-percent">${pct}%</span>
    `;
    catListEl.appendChild(row);
  });
}

function renderUnit(item, unit, unitIndex) {
  const pct = unitProgress(unit);
  const complete = pct >= 100;
  const expanded = isUnitExpanded(item, unitIndex, unit);
  const doneCount = unit.items.filter((i) => i.done).length;
  return `
    <div class="unit-row ${complete ? "complete" : ""}">
      <button type="button" class="unit-row-header" data-item-id="${item.id}" data-unit-index="${unitIndex}">
        <span class="unit-name-wrap"><span class="chevron">${expanded ? "▾" : "▸"}</span><span class="unit-name">${escapeHtml(unit.name)}</span></span>
        <span class="unit-count">${doneCount}/${unit.items.length}</span>
      </button>
      <div class="unit-mini-track"><div class="unit-mini-fill" style="width:${pct}%"></div></div>
      ${
        expanded
          ? `<div class="unit-checklist">
              ${unit.items
                .map(
                  (it, ii) => `
                <label class="check-chip ${it.done ? "checked" : ""}">
                  <input type="checkbox" data-item-id="${item.id}" data-unit-index="${unitIndex}" data-item-index="${ii}" ${it.done ? "checked" : ""}>
                  <span class="chip-label">${escapeHtml(it.label)}</span>
                </label>`
                )
                .join("")}
            </div>`
          : ""
      }
    </div>
  `;
}

function renderItem(item) {
  const progress = getProgress(item);
  const status = getStatus(item);
  const cat = CATEGORIES.find((c) => c.key === item.category);

  const metaParts = [
    `<span class="cat-tag"><span class="category-dot" style="background:${cat.color}"></span>${cat.label}</span>`,
  ];
  if (item.subject) metaParts.push(escapeHtml(item.subject));
  if (item.mode === "units") {
    const all = item.units.flatMap((u) => u.items);
    const doneCount = all.filter((i) => i.done).length;
    metaParts.push(`${doneCount}/${all.length}項目`);
  }
  if (status === "overdue") metaParts.push(`共通期限 ${formatMD(DEADLINE)}`);

  const modeBadge =
    item.mode === "units"
      ? `<span class="mode-badge">単元別</span>`
      : item.mode === "count"
      ? `<span class="mode-badge">件数</span>`
      : "";

  let bodyHtml = "";
  if (item.mode === "percent") {
    bodyHtml = `
      <div class="progress-row">
        <input type="range" min="0" max="100" step="5" value="${item.percent}" class="percent-input" aria-label="進捗">
        <span class="progress-value">${progress}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    `;
  } else if (item.mode === "count") {
    const totalUnset = item.count.total === 0;
    bodyHtml = `
      <div class="count-row">
        <span class="count-field">実施数<input type="number" min="0" class="count-done-input" value="${item.count.done}"></span>
        <span class="count-field">/ 総数<input type="number" min="0" class="count-total-input" value="${item.count.total}"></span>
        <span class="count-percent">${totalUnset ? "総数未設定" : progress + "%"}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
    `;
  } else if (item.mode === "units") {
    bodyHtml = `
      <div class="progress-row">
        <span class="progress-value solo">${progress}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="unit-list">
        ${item.units.map((unit, ui) => renderUnit(item, unit, ui)).join("")}
      </div>
    `;
  }

  const li = document.createElement("li");
  li.className = `homework-item status-${status}`;
  li.dataset.id = item.id;
  li.innerHTML = `
    <div class="homework-item-header">
      <div class="homework-avatar">${mascotSvg(cat.hex, 32)}</div>
      <div class="homework-info">
        <p class="homework-title">${escapeHtml(item.title)}${modeBadge}<span class="status-badge ${status}">${STATUS_LABEL[status]}</span></p>
        <p class="homework-meta${status === "overdue" ? " overdue" : ""}">${metaParts.join(" ・ ")}</p>
      </div>
      <button type="button" class="delete-btn" data-id="${item.id}">削除</button>
    </div>
    ${bodyHtml}
  `;
  return li;
}

function render() {
  const list = loadHomeworkList();
  renderOverview(list);

  const listEl = document.getElementById("homework-list");
  const emptyMessage = document.getElementById("empty-message");
  listEl.innerHTML = "";
  emptyMessage.style.display = list.length === 0 ? "block" : "none";

  list
    .slice()
    .sort((a, b) => STATUS_RANK[getStatus(a)] - STATUS_RANK[getStatus(b)])
    .forEach((item) => listEl.appendChild(renderItem(item)));
}

// Updates a single card's content without touching list order, so the item
// the user just edited doesn't jump away before they see the result.
function updateItemInPlace(id) {
  const list = loadHomeworkList();
  renderOverview(list);
  const item = list.find((i) => i.id === id);
  if (!item) return;
  const oldLi = document.querySelector(`.homework-item[data-id="${id}"]`);
  if (!oldLi) {
    render();
    return;
  }
  oldLi.replaceWith(renderItem(item));
}

// ---- registration form ----
const form = document.getElementById("homework-form");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const subjectInput = document.getElementById("subject");
const modeToggle = document.getElementById("mode-toggle");
const unitsEditor = document.getElementById("units-editor");
const unitsEditorList = document.getElementById("units-editor-list");
let currentMode = "percent";

function addUnitEditorRow() {
  const row = document.createElement("div");
  row.className = "unit-editor-row";
  row.innerHTML = `
    <span class="unit-editor-label">単元名</span>
    <input type="text" class="unit-name-input" placeholder="例: 書きドリル">
    <span class="unit-editor-label">項目(カンマ区切り)</span>
    <input type="text" class="unit-items-input" placeholder="例: 1-1, 1-2, まとめ">
  `;
  unitsEditorList.appendChild(row);
}

modeToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-mode]");
  if (!btn) return;
  currentMode = btn.dataset.mode;
  modeToggle.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
  unitsEditor.classList.toggle("hidden", currentMode !== "units");
  if (currentMode === "units" && unitsEditorList.children.length === 0) {
    addUnitEditorRow();
  }
});

document.getElementById("add-unit-btn").addEventListener("click", addUnitEditorRow);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const list = loadHomeworkList();
  const base = {
    id: generateId(),
    title: titleInput.value.trim(),
    category: categoryInput.value,
    subject: subjectInput.value.trim(),
  };

  let newItem;
  if (currentMode === "percent") {
    newItem = { ...base, mode: "percent", percent: 0 };
  } else if (currentMode === "count") {
    newItem = { ...base, mode: "count", count: { total: 0, done: 0 } };
  } else {
    const units = Array.from(unitsEditorList.querySelectorAll(".unit-editor-row"))
      .map((row) => {
        const name = row.querySelector(".unit-name-input").value.trim();
        const items = row
          .querySelector(".unit-items-input")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return { name, items };
      })
      .filter((u) => u.name && u.items.length > 0)
      .map((u) => ({ name: u.name, items: u.items.map((label) => ({ label, done: false })) }));

    if (units.length === 0) {
      alert("単元名と項目を少なくとも1つ入力してください。");
      return;
    }
    newItem = { ...base, mode: "units", units };
  }

  list.push(newItem);
  saveHomeworkList(list);
  form.reset();
  unitsEditorList.innerHTML = "";
  unitsEditor.classList.add("hidden");
  currentMode = "percent";
  modeToggle.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.mode === "percent"));
  render();
});

// ---- list interactions ----
const listEl = document.getElementById("homework-list");

listEl.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    saveHomeworkList(loadHomeworkList().filter((i) => i.id !== id));
    render();
    return;
  }
  const unitHeader = e.target.closest(".unit-row-header");
  if (unitHeader) {
    const key = `${unitHeader.dataset.itemId}:${unitHeader.dataset.unitIndex}`;
    if (manualToggle.has(key)) manualToggle.delete(key);
    else manualToggle.add(key);
    updateItemInPlace(unitHeader.dataset.itemId);
  }
});

listEl.addEventListener("input", (e) => {
  const percentInput = e.target.closest(".percent-input");
  if (percentInput) {
    const id = e.target.closest(".homework-item").dataset.id;
    const list = loadHomeworkList();
    const item = list.find((i) => i.id === id);
    if (item) {
      item.percent = Number(percentInput.value);
      saveHomeworkList(list);
      updateItemInPlace(id);
    }
    return;
  }

  const countDone = e.target.closest(".count-done-input");
  const countTotal = e.target.closest(".count-total-input");
  if (countDone || countTotal) {
    const id = e.target.closest(".homework-item").dataset.id;
    const list = loadHomeworkList();
    const item = list.find((i) => i.id === id);
    if (item) {
      if (countDone) item.count.done = Math.max(0, Number(countDone.value) || 0);
      if (countTotal) item.count.total = Math.max(0, Number(countTotal.value) || 0);
      saveHomeworkList(list);
      updateItemInPlace(id);
    }
  }
});

listEl.addEventListener("change", (e) => {
  const checkbox = e.target.closest('input[type="checkbox"][data-item-id]');
  if (!checkbox) return;
  const { itemId, unitIndex, itemIndex } = checkbox.dataset;
  const list = loadHomeworkList();
  const item = list.find((i) => i.id === itemId);
  if (item) {
    item.units[Number(unitIndex)].items[Number(itemIndex)].done = checkbox.checked;
    saveHomeworkList(list);
    updateItemInPlace(itemId);
  }
});

render();
