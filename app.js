const goCurrentWeekBtnEl = document.getElementById("goCurrentWeekBtn");
const weekPanelEl = document.getElementById("weekPage");
const overviewCarouselEl = document.getElementById("overviewCarousel");
const overviewPageEl = document.getElementById("overviewPage");
const overviewOpsEl = document.getElementById("overviewOps");
const overviewCtaEl = document.getElementById("overviewCta");
const strategicRemindersEl = document.getElementById("strategicReminders");
const overviewPrevBtnEl = document.getElementById("overviewPrevBtn");
const overviewNextBtnEl = document.getElementById("overviewNextBtn");
const overviewDotsEl = document.getElementById("overviewDots");
const overviewViewportEl = overviewCarouselEl?.querySelector(".carousel-viewport");
const overviewTrackEl = overviewCarouselEl?.querySelector(".carousel-track");
const reminderContentEl = document.getElementById("reminderContent");
const editReminderBtnEl = document.getElementById("editReminderBtn");
const missionListEl = document.getElementById("missionList");
const addMissionBtnEl = document.getElementById("addMissionBtn");
const opsTableBodyEl = document.getElementById("opsTableBody");
const addOpsBtnEl = document.getElementById("addOpsBtn");

const weekDateRangeEl = document.getElementById("weekDateRange");
const weekMissionFocusEl = document.getElementById("weekMissionFocus");
const weekChecklistEl = document.getElementById("weekChecklist");
const weekDaysEl = document.getElementById("weekDays");
const weekNotesEl = document.getElementById("weekNotes");
const prevWeekBtnEl = document.getElementById("prevWeekBtn");
const homeBtnEl = document.getElementById("homeBtn");
const nextWeekBtnEl = document.getElementById("nextWeekBtn");

const TOTAL_PAGES = 35;
let currentPage = 1;
const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};
const CHECKLIST_STATE_KEY = "pesa_checklist_state_v1";
const DAY_DONE_STATE_KEY = "pesa_day_done_state_v1";
const MISSION_STATE_KEY = "pesa_mission_state_v1";
const OPS_STATE_KEY = "pesa_ops_state_v1";
const REMINDER_STATE_KEY = "pesa_reminder_state_v1";
const OVERVIEW_SLIDES = [overviewPageEl, overviewOpsEl, strategicRemindersEl];
const DEFAULT_MISSION = [
  "Become a respected coach, instructor, and expedition leader",
  "Build consistent coaching opportunities",
  "Develop Level Wings partnership and PG identity",
  "Grow visibility through storytelling and reviews",
  "Develop INNHOPP systems and leadership",
  "Create sustainable multi-income ecosystem",
  "Coach at 3-5 meaningful events",
  "Complete first AFF student progression",
  "Publish 8-12 PG / Level Wings pieces",
  "Weekly posting consistency",
  "Become operationally hard to replace",
  "Build 10+ meaningful industry contacts"
];
const DEFAULT_OPS = [
  { date: "June", task: "Drive toward Voss" },
  { date: "May 15-24", task: "Sardinia AFF support mission" },
  { date: "Now -> early June", task: "Critical Sardinia scouting window" },
  { date: "Jun 7-12", task: "Pioneer Adventure (late arrival likely)" },
  { date: "Jun 21-28", task: "Ekstremsportveko involvement" },
  { date: "Mid June", task: "20-year skydiving milestone jump" },
  { date: "July 8-12", task: "Too Hot To Handle" },
  { date: "Jul 19-27", task: "Reid Garton's Innhopp Birthday" },
  { date: "Summer", task: "Launch consistent Level Wings review content" },
  { date: "Aug 30 - Sep 4", task: "Timeless Classics" },
  { date: "Oct 19-30", task: "Tora Tora Paradise coaching" },
  { date: "Nov 25 - Dec 1", task: "INNHOPP Colombia #2 expedition" }
];
let overviewSlideIndex = 0;
let overviewAnimating = false;
const DEFAULT_REMINDER_HTML = reminderContentEl ? reminderContentEl.innerHTML : "";
let reminderEditing = false;

function wrapOverviewIndex(index) {
  const totalSlides = OVERVIEW_SLIDES.length;
  if (!totalSlides) return 0;
  return ((index % totalSlides) + totalSlides) % totalSlides;
}

function getOverviewCenteredOffset(slide) {
  if (!overviewViewportEl || !slide) return 0;
  const viewportWidth = overviewViewportEl.clientWidth;
  const activeCenter = slide.offsetLeft + (slide.offsetWidth / 2);
  const viewportCenter = viewportWidth / 2;
  return viewportCenter - activeCenter;
}

function renderOverviewCarousel() {
  const totalSlides = OVERVIEW_SLIDES.length;
  if (!totalSlides) return;

  const orderedIndexes = [];
  for (let offset = -1; offset < totalSlides - 1; offset += 1) {
    const idx = (overviewSlideIndex + offset + totalSlides) % totalSlides;
    orderedIndexes.push(idx);
  }

  OVERVIEW_SLIDES.forEach((slide, idx) => {
    slide.style.order = String(orderedIndexes.indexOf(idx));
  });

  OVERVIEW_SLIDES.forEach((slide, idx) => {
    slide.classList.toggle("is-active", idx === overviewSlideIndex);
  });

  if (overviewTrackEl && overviewViewportEl) {
    const activeSlide = OVERVIEW_SLIDES[overviewSlideIndex];
    const offset = getOverviewCenteredOffset(activeSlide);
    overviewTrackEl.style.transform = `translateX(${offset}px)`;
  }

  if (overviewDotsEl) {
    const dots = overviewDotsEl.querySelectorAll(".carousel-dot");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === overviewSlideIndex);
    });
  }
}

function syncOverviewSlideHeights() {
  if (!overviewTrackEl) return;
  let maxHeight = 0;

  OVERVIEW_SLIDES.forEach((slide) => {
    const prevMinHeight = slide.style.minHeight;
    slide.style.minHeight = "0";
    maxHeight = Math.max(maxHeight, slide.offsetHeight);
    slide.style.minHeight = prevMinHeight;
  });

  if (maxHeight > 0) {
    OVERVIEW_SLIDES.forEach((slide) => {
      slide.style.minHeight = `${maxHeight}px`;
    });
  }
  renderOverviewCarousel();
}

function setOverviewSlide(index) {
  if (overviewAnimating) return;
  overviewSlideIndex = wrapOverviewIndex(index);
  renderOverviewCarousel();
}

function stepOverviewSlide(direction) {
  if (overviewAnimating || !overviewTrackEl || !overviewViewportEl || !OVERVIEW_SLIDES.length) {
    return;
  }
  const activeSlide = OVERVIEW_SLIDES[overviewSlideIndex];
  const trackStyles = window.getComputedStyle(overviewTrackEl);
  const gap = Number.parseFloat(trackStyles.gap || "0") || 0;
  const step = activeSlide.offsetWidth + gap;
  const startOffset = getOverviewCenteredOffset(activeSlide);
  const animatedOffset = startOffset + (direction > 0 ? -step : step);

  overviewAnimating = true;
  overviewTrackEl.style.transition = "transform 260ms ease";
  overviewTrackEl.style.transform = `translateX(${startOffset}px)`;

  requestAnimationFrame(() => {
    overviewTrackEl.style.transform = `translateX(${animatedOffset}px)`;
  });

  const onEnd = () => {
    overviewTrackEl.removeEventListener("transitionend", onEnd);
    overviewTrackEl.style.transition = "none";
    overviewSlideIndex = wrapOverviewIndex(overviewSlideIndex + direction);
    renderOverviewCarousel();
    void overviewTrackEl.offsetWidth;
    overviewTrackEl.style.transition = "";
    overviewAnimating = false;
  };

  overviewTrackEl.addEventListener("transitionend", onEnd, { once: true });
}

function initOverviewCarousel() {
  if (!overviewDotsEl) return;
  overviewDotsEl.innerHTML = "";
  OVERVIEW_SLIDES.forEach((slide, idx) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Show ${slide.dataset.slideName || `section ${idx + 1}`}`);
    dot.addEventListener("click", () => setOverviewSlide(idx));
    overviewDotsEl.append(dot);
  });
  renderOverviewCarousel();
  syncOverviewSlideHeights();
}

function loadChecklistState() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(CHECKLIST_STATE_KEY, JSON.stringify(state));
}

function loadDayDoneState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_DONE_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveDayDoneState(state) {
  localStorage.setItem(DAY_DONE_STATE_KEY, JSON.stringify(state));
}

function loadMissionState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MISSION_STATE_KEY) || "null");    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // Legacy migration from { left: [], right: [] }
    if (parsed && Array.isArray(parsed.left) && Array.isArray(parsed.right)) {
      return [...parsed.left, ...parsed.right];
    }
    return [...DEFAULT_MISSION];
  } catch (_) {
    return [...DEFAULT_MISSION];
  }
}

function saveMissionState(state) {
  localStorage.setItem(MISSION_STATE_KEY, JSON.stringify(state));
}

function loadOpsState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(OPS_STATE_KEY) || "null");
    if (!Array.isArray(parsed) || !parsed.length) {
      return [...DEFAULT_OPS];
    }
    return parsed.map((item) => ({
      date: String(item?.date || "").trim() || "New window",
      task: String(item?.task || "").trim() || "New operation"
    }));
  } catch (_) {
    return [...DEFAULT_OPS];
  }
}

function saveOpsState(state) {
  localStorage.setItem(OPS_STATE_KEY, JSON.stringify(state));
}

function loadReminderState() {
  try {
    const parsed = localStorage.getItem(REMINDER_STATE_KEY);
    if (typeof parsed === "string" && parsed.trim().length > 0) {
      return parsed;
    }
  } catch (_) {
    // no-op
  }
  return DEFAULT_REMINDER_HTML;
}

function saveReminderState(value) {
  localStorage.setItem(REMINDER_STATE_KEY, String(value || ""));
}

function setReminderEditing(isEditing) {
  if (!reminderContentEl || !editReminderBtnEl) return;
  reminderEditing = isEditing;
  reminderContentEl.contentEditable = isEditing ? "true" : "false";
  reminderContentEl.classList.toggle("is-editing", isEditing);
  strategicRemindersEl?.classList.toggle("is-editing", isEditing);
  reminderContentEl.setAttribute("aria-label", isEditing ? "Editable remember notes" : "Remember notes");
  editReminderBtnEl.textContent = "Edit";
}

function renderReminder() {
  if (!reminderContentEl) return;
  reminderContentEl.innerHTML = loadReminderState();
  setReminderEditing(false);
}

function moveItem(items, from, to) {
  if (from === to) return [...items];
  const next = [...items];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

function renderOps() {
  const items = loadOpsState();
  let draggedIndex = null;

  opsTableBodyEl.innerHTML = "";
  items.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = "ops-row";
    tr.dataset.index = String(index);
    tr.draggable = false;

    const dateTd = document.createElement("td");
    const dateText = document.createElement("span");
    dateText.textContent = item.date;
    dateTd.append(dateText);

    const taskTd = document.createElement("td");
    taskTd.className = "ops-cell-task";
    const taskText = document.createElement("span");
    taskText.className = "ops-task-text";
    taskText.textContent = item.task;
    const actionsEl = document.createElement("div");
    actionsEl.className = "ops-actions";

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "ops-icon-btn ops-drag-handle";
    dragHandle.title = "Drag to reorder";
    dragHandle.setAttribute("aria-label", "Drag to reorder row");
    dragHandle.draggable = true;
    dragHandle.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">drag_indicator</span>";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "ops-icon-btn";
    editBtn.title = "Edit";
    editBtn.setAttribute("aria-label", "Edit operation row");
    editBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "ops-icon-btn";
    deleteBtn.title = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete operation row");
    deleteBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">delete</span>";

    editBtn.addEventListener("click", () => {
      tr.classList.add("editing");
      const dateInput = document.createElement("input");
      dateInput.type = "text";
      dateInput.className = "ops-editor";
      dateInput.value = item.date;

      const taskInput = document.createElement("input");
      taskInput.type = "text";
      taskInput.className = "ops-editor";
      taskInput.value = item.task;

      dateTd.replaceChildren(dateInput);
      taskTd.replaceChildren(taskInput, actionsEl);
      dateInput.focus();
      dateInput.setSelectionRange(dateInput.value.length, dateInput.value.length);

      let saved = false;
      const saveEdit = () => {
        if (saved) return;
        saved = true;
        const state = loadOpsState();
        state[index] = {
          date: dateInput.value.trim() || "New window",
          task: taskInput.value.trim() || "New operation"
        };
        saveOpsState(state);
        renderOps();
      };

      const onKeyDown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          saveEdit();
        }
      };

      dateInput.addEventListener("keydown", onKeyDown);
      taskInput.addEventListener("keydown", onKeyDown);

      // Save only when focus leaves the entire row, not when moving between fields.
      const onFocusOut = () => {
        setTimeout(() => {
          if (!tr.contains(document.activeElement)) {
            saveEdit();
          }
        }, 0);
      };

      dateInput.addEventListener("blur", onFocusOut);
      taskInput.addEventListener("blur", onFocusOut);
    });

    deleteBtn.addEventListener("click", () => {
      const state = loadOpsState();
      state.splice(index, 1);
      saveOpsState(state);
      renderOps();
    });

    dragHandle.addEventListener("dragstart", (event) => {
      draggedIndex = index;
      tr.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
      }
    });

    tr.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    });

    tr.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetIndex = Number(tr.dataset.index);
      if (draggedIndex === null || Number.isNaN(targetIndex) || draggedIndex === targetIndex) {
        return;
      }
      const reordered = moveItem(loadOpsState(), draggedIndex, targetIndex);
      saveOpsState(reordered);
      renderOps();
    });

    dragHandle.addEventListener("dragend", () => {
      draggedIndex = null;
      opsTableBodyEl.querySelectorAll(".ops-row.dragging").forEach((row) => {
        row.classList.remove("dragging");
      });
    });

    actionsEl.append(dragHandle, editBtn, deleteBtn);
    taskTd.append(taskText, actionsEl);
    tr.append(dateTd, taskTd);
    opsTableBodyEl.append(tr);
  });
  syncOverviewSlideHeights();
}

function renderMission() {
  const items = loadMissionState();
  missionListEl.innerHTML = "";

  items.forEach((text, index) => {
    const li = document.createElement("li");
    li.className = "mission-item";

    const textEl = document.createElement("div");
    textEl.className = "mission-text";
    textEl.textContent = text;

    const actionsEl = document.createElement("div");
    actionsEl.className = "mission-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "mission-icon-btn";
    editBtn.title = "Edit";
    editBtn.setAttribute("aria-label", "Edit mission");
    editBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "mission-icon-btn";
    deleteBtn.title = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete mission");
    deleteBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">delete</span>";

    editBtn.addEventListener("click", () => {
      li.classList.add("editing");
      const textarea = document.createElement("textarea");
      textarea.className = "mission-editor";
      textarea.value = textEl.textContent;
      textarea.rows = 3;
      textEl.replaceWith(textarea);
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);

      const saveEdit = () => {
        const state = loadMissionState();
        state[index] = textarea.value.trim() || "New mission statement";
        saveMissionState(state);
        renderMission();
      };

      textarea.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          saveEdit();
        }
      });
      textarea.addEventListener("blur", saveEdit, { once: true });
    });

    deleteBtn.addEventListener("click", () => {
      const state = loadMissionState();
      state.splice(index, 1);
      saveMissionState(state);
      renderMission();
    });

    actionsEl.append(editBtn, deleteBtn);
    li.append(textEl, actionsEl);
    missionListEl.append(li);
  });
  syncOverviewSlideHeights();
}

function pageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = Number(params.get("page"));
  if (!Number.isFinite(raw)) return 1;
  return Math.max(1, Math.min(TOTAL_PAGES, Math.trunc(raw)));
}

function setUrlForPage(page, replace = false) {
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(page));
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", url);
}

function getWeekByPage(page) {
  return weeksData.find((week) => week.page === page) || null;
}

function parseRangeToDates(dateRange) {
  const normalized = String(dateRange || "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  const match = normalized.match(/^([A-Za-z]{3})\s+(\d{1,2})\s*-\s*([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/);
  if (!match) return null;
  const [, startMon, startDay, endMon, endDay, year] = match;
  if (MONTHS[startMon] === undefined || MONTHS[endMon] === undefined) return null;
  const y = Number(year);
  return {
    start: new Date(y, MONTHS[startMon], Number(startDay), 0, 0, 0, 0),
    end: new Date(y, MONTHS[endMon], Number(endDay), 23, 59, 59, 999)
  };
}

function getCurrentWeekPage() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  for (const week of weeksData) {
    const range = parseRangeToDates(week.dateRange || "");
    if (!range) continue;
    if (now >= range.start && now <= range.end) {
      return week.page;
    }
  }

  // Deterministic fallback if date parsing does not match any range.
  return weeksData[0]?.page || 2;
}

function renderChecklist(page, items) {
  const state = loadChecklistState();
  const pageState = state[String(page)] || {};

  weekChecklistEl.innerHTML = "";
  items.forEach((item, idx) => {
    const li = document.createElement("li");

    const label = document.createElement("label");
    label.className = "check-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(pageState[idx]);
    input.addEventListener("change", () => {
      const current = loadChecklistState();
      const nextPageState = { ...(current[String(page)] || {}) };
      nextPageState[idx] = input.checked;
      current[String(page)] = nextPageState;
      saveChecklistState(current);
    });

    const text = document.createElement("span");
    text.textContent = item;

    label.append(input, text);
    li.append(label);
    weekChecklistEl.append(li);
  });
}

function renderDayTable(page, days) {
  const state = loadDayDoneState();
  const pageState = state[String(page)] || {};

  weekDaysEl.innerHTML = "";

  const table = document.createElement("table");
  table.className = "week-days-table";

  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>DAY</th><th>PRIMARY INTENT</th><th>DONE</th></tr>";

  const tbody = document.createElement("tbody");
  days.forEach((row, idx) => {
    const tr = document.createElement("tr");
    const dayTd = document.createElement("td");
    dayTd.textContent = row.day;

    const intentTd = document.createElement("td");
    intentTd.textContent = row.intent;

    const doneTd = document.createElement("td");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "day-done-checkbox";
    input.checked = pageState[idx] !== undefined ? Boolean(pageState[idx]) : Boolean(row.done);
    input.addEventListener("change", () => {
      const current = loadDayDoneState();
      const nextPageState = { ...(current[String(page)] || {}) };
      nextPageState[idx] = input.checked;
      current[String(page)] = nextPageState;
      saveDayDoneState(current);
    });
    doneTd.append(input);

    tr.append(dayTd, intentTd, doneTd);
    tbody.append(tr);
  });

  table.append(thead, tbody);
  weekDaysEl.append(table);
}

function renderWeekPage(page) {
  const week = getWeekByPage(page);
  if (!week) return;

  weekDateRangeEl.textContent = week.dateRange || "-";
  weekMissionFocusEl.textContent = week.missionFocus || "-";
  weekNotesEl.textContent = week.notes || "";

  renderChecklist(page, week.checklist || []);
  renderDayTable(page, week.days || []);
}

function renderPage(page, opts = {}) {
  const { updateUrl = true, replaceUrl = false } = opts;
  currentPage = Math.max(1, Math.min(TOTAL_PAGES, page));
  if (updateUrl) {
    setUrlForPage(currentPage, replaceUrl);
  }

  const onOverview = currentPage === 1;
  overviewCarouselEl.hidden = !onOverview;
  overviewCtaEl.hidden = !onOverview;
  weekPanelEl.hidden = onOverview;

  if (!onOverview) {
    renderWeekPage(currentPage);
    prevWeekBtnEl.disabled = currentPage <= 2;
    nextWeekBtnEl.disabled = currentPage >= TOTAL_PAGES;
  }

}

overviewPrevBtnEl.addEventListener("click", () => {
  stepOverviewSlide(-1);
});

overviewNextBtnEl.addEventListener("click", () => {
  stepOverviewSlide(1);
});

if (editReminderBtnEl && reminderContentEl) {
  editReminderBtnEl.addEventListener("click", () => {
    if (reminderEditing) return;
    setReminderEditing(true);
    reminderContentEl.focus();
  });
}

document.addEventListener("mousedown", (event) => {
  if (!reminderEditing || !strategicRemindersEl || !reminderContentEl) return;
  if (strategicRemindersEl.contains(event.target)) return;
  saveReminderState(reminderContentEl.innerHTML);
  setReminderEditing(false);
  syncOverviewSlideHeights();
});

goCurrentWeekBtnEl.addEventListener("click", () => {
  const page = getCurrentWeekPage();
  renderPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
addMissionBtnEl.addEventListener("click", () => {
  const state = loadMissionState();
  state.push("New mission statement");
  saveMissionState(state);
  renderMission();
});

addOpsBtnEl.addEventListener("click", () => {
  const state = loadOpsState();
  state.push({ date: "New window", task: "New operation" });
  saveOpsState(state);
  renderOps();
});

prevWeekBtnEl.addEventListener("click", () => {
  renderPage(currentPage - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

nextWeekBtnEl.addEventListener("click", () => {
  renderPage(currentPage + 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

homeBtnEl.addEventListener("click", () => {
  renderPage(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("popstate", () => {
  renderPage(pageFromUrl(), { updateUrl: false });
});

window.addEventListener("resize", () => {
  syncOverviewSlideHeights();
});

renderPage(pageFromUrl(), { replaceUrl: true });
renderMission();
renderOps();
renderReminder();
initOverviewCarousel();
