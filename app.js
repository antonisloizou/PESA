import { createClient } from "@supabase/supabase-js";
import weeksData from "./data/weeks.js";

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

const weekCarouselTrackEl = document.getElementById("weekCarouselTrack");
const weekDotsEl = document.getElementById("weekDots");
const weekViewportEl = weekPanelEl?.querySelector(".week-carousel-viewport");
const prevWeekBtnEl = document.getElementById("prevWeekBtn");
const homeBtnEl = document.getElementById("homeBtn");
const nextWeekBtnEl = document.getElementById("nextWeekBtn");
const dayPanelEl = document.getElementById("dayPage");
const dayCarouselTrackEl = document.getElementById("dayCarouselTrack");
const dayDotsEl = document.getElementById("dayDots");
const dayViewportEl = dayPanelEl?.querySelector(".week-carousel-viewport");
const prevDayBtnEl = document.getElementById("prevDayBtn");
const nextDayBtnEl = document.getElementById("nextDayBtn");
const dayHomeBtnEl = document.getElementById("dayHomeBtn");
const dayWeekBtnEl = document.getElementById("dayWeekBtn");

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
const CHECKLIST_ITEMS_STATE_KEY = "pesa_checklist_items_state_v2";
const DAY_DONE_STATE_KEY = "pesa_day_done_state_v1";
const DAY_INTENT_STATE_KEY = "pesa_day_intent_state_v1";
const DAY_HOURS_STATE_KEY = "pesa_day_hours_state_v1";
const DAY_HOUR_DONE_STATE_KEY = "pesa_day_hour_done_state_v1";
const DAY_ROUTINE_ANSWERS_STATE_KEY = "pesa_day_routine_answers_state_v1";
const WEEK_TITLE_STATE_KEY = "pesa_week_title_state_v1";
const WEEK_NOTES_STATE_KEY = "pesa_week_notes_state_v1";
const MISSION_STATE_KEY = "pesa_mission_state_v1";
const OPS_STATE_KEY = "pesa_ops_state_v1";
const REMINDER_STATE_KEY = "pesa_reminder_state_v1";
const REWARD_STATE_KEY = "pesa_reward_state_v1";
const LOCAL_STATE_KEYS = [
  DAY_ROUTINE_ANSWERS_STATE_KEY,
  CHECKLIST_STATE_KEY,
  CHECKLIST_ITEMS_STATE_KEY,
  DAY_DONE_STATE_KEY,
  DAY_INTENT_STATE_KEY,
  DAY_HOURS_STATE_KEY,
  DAY_HOUR_DONE_STATE_KEY,
  MISSION_STATE_KEY,
  OPS_STATE_KEY,
  REMINDER_STATE_KEY,
  REWARD_STATE_KEY,
  WEEK_TITLE_STATE_KEY,
  WEEK_NOTES_STATE_KEY
];
const SUPABASE_CLIENT_ID_KEY = "pesa_client_id_v1";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_FIXED_CLIENT_ID = String(import.meta.env.VITE_SUPABASE_CLIENT_ID || "").trim();
let supabase = null;
let supabaseClientId = null;
let syncTimer = null;
const ROUTINE_MODAL_COPY = {
  morning: {
    title: "High Performance Morning Routine",
    questions: [
      "One thing I can get excited about today:",
      "If one word could describe the kind of person I want to be today, that word is:",
      "And the reason I chose it is:",
      "Someone who needs me on my A-game today is:",
      "A situation that might stress me out or trip me up today could be:",
      "And the way my best self would deal with that is:",
      "One thing I could do today that is a little outside my comfort zone is:",
      "I would know that today was a great success if at the end of the day I did, said or felt this:"
    ]
  },
  evening: {
    title: "High Performance Evening Routine",
    questions: [
      "What am I most happy with about today?",
      "What did I learn today?",
      "What will I do differently tomorrow?",
      "If I was my own coach I would tell myself this statement about today:"
    ]
  }
};
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
let overviewTransitionEndHandler = null;
const WEEK_PAGES = weeksData.map((week) => week.page);
let weekSlideIndex = 0;
let weekAnimating = false;
let weekTransitionEndHandler = null;
let currentView = "overview";
let daySlideIndex = 0;
let dayAnimating = false;
let dayTransitionEndHandler = null;
const MOBILE_ACTIONS_MEDIA_QUERY = "(max-width: 700px)";

function isMobileActionsViewport() {
  return window.matchMedia(MOBILE_ACTIONS_MEDIA_QUERY).matches;
}

function clearMobileActionPanels() {
  document.querySelectorAll(".mobile-actions-open").forEach((el) => {
    el.classList.remove("mobile-actions-open");
  });
}

function toggleMobileActionPanelFromTarget(target) {
  if (!isMobileActionsViewport() || !(target instanceof Element)) return;

  const panelOwner = target.closest(".mission-item, .ops-row, .checklist-item-row, .week-day-intent-cell, .day-hour-detail-cell");
  if (!panelOwner) {
    clearMobileActionPanels();
    return;
  }

  if (panelOwner.classList.contains("mobile-actions-open")) return;
  clearMobileActionPanels();
  panelOwner.classList.add("mobile-actions-open");
}
const DEFAULT_REMINDER_HTML = reminderContentEl ? reminderContentEl.innerHTML : "";
let reminderEditing = false;
let activeRoutineModalClose = null;
let rewardHudEl = null;
let cherriesValueEl = null;
let peachesValueEl = null;
let rewardState = { cherries: 0, peaches: 0 };
let displayedRewardState = { cherries: 0, peaches: 0 };
const rewardCounterTimers = { cherries: null, peaches: null };

function loadRewardState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REWARD_STATE_KEY) || "{}");
    return {
      cherries: Number.isFinite(parsed?.cherries) ? Math.max(0, Math.floor(parsed.cherries)) : 0,
      peaches: Number.isFinite(parsed?.peaches) ? Math.max(0, Math.floor(parsed.peaches)) : 0
    };
  } catch (_) {
    return { cherries: 0, peaches: 0 };
  }
}

function saveRewardState() {
  saveLocalStateValue(REWARD_STATE_KEY, JSON.stringify(rewardState));
}

function renderRewardHudValues() {
  if (cherriesValueEl) cherriesValueEl.textContent = String(displayedRewardState.cherries);
  if (peachesValueEl) peachesValueEl.textContent = String(displayedRewardState.peaches);
}

function createRewardHud() {
  if (rewardHudEl) return;
  rewardState = loadRewardState();
  displayedRewardState = { ...rewardState };
  const hud = document.createElement("aside");
  hud.className = "reward-hud";
  hud.setAttribute("aria-label", "Progress rewards");

  const cherriesCounter = document.createElement("div");
  cherriesCounter.className = "reward-counter reward-counter-cherries";
  cherriesCounter.dataset.rewardType = "cherries";
  cherriesCounter.innerHTML = "<span class=\"reward-counter-emoji\" aria-hidden=\"true\">🍒</span><span class=\"reward-counter-value\">0</span>";
  cherriesValueEl = cherriesCounter.querySelector(".reward-counter-value");

  const peachesCounter = document.createElement("div");
  peachesCounter.className = "reward-counter reward-counter-peaches";
  peachesCounter.dataset.rewardType = "peaches";
  peachesCounter.innerHTML = "<span class=\"reward-counter-emoji\" aria-hidden=\"true\">🍑</span><span class=\"reward-counter-value\">0</span>";
  peachesValueEl = peachesCounter.querySelector(".reward-counter-value");

  hud.append(peachesCounter, cherriesCounter);
  document.body.append(hud);
  rewardHudEl = hud;
  renderRewardHudValues();
}

function animateRewardCounterTo(type, targetValue) {
  if (rewardCounterTimers[type]) {
    window.clearTimeout(rewardCounterTimers[type]);
    rewardCounterTimers[type] = null;
  }
  const step = () => {
    const currentValue = displayedRewardState[type];
    if (currentValue === targetValue) {
      rewardCounterTimers[type] = null;
      return;
    }
    displayedRewardState[type] += currentValue < targetValue ? 1 : -1;
    renderRewardHudValues();
    rewardCounterTimers[type] = window.setTimeout(step, 36);
  };
  step();
}

function syncRewardStateFromStorage() {
  rewardState = loadRewardState();
}

function rebuildRewardsFromCheckedItems() {
  const checklistState = loadChecklistItemsState();
  const dayDoneState = loadDayDoneState();
  const dayHourDoneState = loadDayHourDoneState();

  const weeklyChecked = Object.values(checklistState).reduce((sum, items) => {
    if (!Array.isArray(items)) return sum;
    return sum + items.filter((item) => Boolean(item?.done)).length;
  }, 0);

  const dayIntentChecked = Object.values(dayDoneState).reduce((sum, pageState) => {
    if (!pageState || typeof pageState !== "object") return sum;
    return sum + Object.values(pageState).filter(Boolean).length;
  }, 0);

  const hourlyChecked = Object.values(dayHourDoneState).reduce((sum, pageState) => {
    if (!pageState || typeof pageState !== "object") return sum;
    return sum + Object.values(pageState).reduce((daySum, dayState) => {
      if (!dayState || typeof dayState !== "object") return daySum;
      return daySum + Object.values(dayState).filter(Boolean).length;
    }, 0);
  }, 0);

  rewardState = {
    cherries: hourlyChecked * 10,
    peaches: (weeklyChecked + dayIntentChecked) * 5
  };
  displayedRewardState = { ...rewardState };
  renderRewardHudValues();
  saveRewardState();
  return { ...rewardState };
}

function animateRewardFountain(fromEl, type) {
  if (!(fromEl instanceof Element) || !rewardHudEl) return;
  const target = rewardHudEl.querySelector(`[data-reward-type="${type}"]`);
  if (!(target instanceof Element)) return;
  const emoji = type === "cherries" ? "🍒" : "🍑";
  const fromRect = fromEl.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const startX = fromRect.left + (fromRect.width / 2);
  const startY = fromRect.top + (fromRect.height / 2);
  const endX = targetRect.left + (targetRect.width / 2);
  const endY = targetRect.top + (targetRect.height / 2);

  const particles = 12;
  const durationMs = 1100;
  const spreadPx = 130;
  const burstBaseY = -65;
  const burstRangeY = 105;
  const targetJitterPx = 14;
  for (let i = 0; i < particles; i += 1) {
    const particle = document.createElement("span");
    particle.className = "reward-particle";
    particle.textContent = emoji;
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    document.body.append(particle);

    const spread = (Math.random() - 0.5) * spreadPx;
    const burstX = spread;
    const burstY = burstBaseY - (Math.random() * burstRangeY);
    const toX = (endX - startX) + ((Math.random() - 0.5) * targetJitterPx);
    const toY = (endY - startY) + ((Math.random() - 0.5) * targetJitterPx);

    particle.animate(
      [
        { transform: "translate(-50%, -50%) translate3d(0, 0, 0) scale(0.7)", opacity: 0 },
        { transform: `translate(-50%, -50%) translate3d(${burstX}px, ${burstY}px, 0) scale(1)`, opacity: 1, offset: 0.28 },
        { transform: `translate(-50%, -50%) translate3d(${toX}px, ${toY}px, 0) scale(0.95)`, opacity: 0.96 }
      ],
      {
        duration: durationMs,
        easing: "cubic-bezier(0.15, 0.8, 0.2, 1)",
        fill: "forwards"
      }
    ).addEventListener("finish", () => {
      particle.remove();
    });
  }
}

function awardReward(type, amount, sourceEl) {
  syncRewardStateFromStorage();
  if (type === "cherries") {
    rewardState.cherries = Math.max(0, rewardState.cherries + amount);
  } else {
    rewardState.peaches = Math.max(0, rewardState.peaches + amount);
  }
  saveRewardState();
  if (amount > 0) {
    animateRewardFountain(sourceEl, type);
  }
  if (amount !== 0) {
    animateRewardCounterTo(type, rewardState[type]);
  }
}

function saveLocalStateValue(key, value) {
  localStorage.setItem(key, value);
  scheduleSupabaseStateSync();
}

function getOrCreateSupabaseClientId() {
  if (SUPABASE_FIXED_CLIENT_ID) {
    try {
      localStorage.setItem(SUPABASE_CLIENT_ID_KEY, SUPABASE_FIXED_CLIENT_ID);
    } catch (_) {
      // no-op
    }
    return SUPABASE_FIXED_CLIENT_ID;
  }
  try {
    const existing = String(localStorage.getItem(SUPABASE_CLIENT_ID_KEY) || "").trim();
    if (existing) return existing;
    const created = (globalThis.crypto && crypto.randomUUID)
      ? `client_${crypto.randomUUID()}`
      : `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SUPABASE_CLIENT_ID_KEY, created);
    return created;
  } catch (_) {
    return `client_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

function readLocalStateSnapshot() {
  const snapshot = {};
  LOCAL_STATE_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) snapshot[key] = value;
  });
  return snapshot;
}

function applyLocalStateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return;
  Object.entries(snapshot).forEach(([key, value]) => {
    if (!LOCAL_STATE_KEYS.includes(key)) return;
    if (typeof value !== "string") return;
    localStorage.setItem(key, value);
  });
}

async function upsertSupabaseState(snapshot) {
  if (!supabase || !supabaseClientId) return;
  await supabase.from("planner_clients").upsert(
    { client_id: supabaseClientId, state: snapshot },
    { onConflict: "client_id" }
  );
}

function scheduleSupabaseStateSync() {
  if (!supabase || !supabaseClientId) return;
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    const snapshot = readLocalStateSnapshot();
    upsertSupabaseState(snapshot);
  }, 250);
}

async function initSupabaseStateSync() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  supabaseClientId = getOrCreateSupabaseClientId();

  const localSnapshot = readLocalStateSnapshot();
  const { data } = await supabase
    .from("planner_clients")
    .select("state")
    .eq("client_id", supabaseClientId)
    .maybeSingle();

  const remoteSnapshot = data?.state && typeof data.state === "object" ? data.state : {};
  if (Object.keys(remoteSnapshot).length > 0) {
    applyLocalStateSnapshot(remoteSnapshot);
    return;
  }

  if (Object.keys(localSnapshot).length > 0) {
    await upsertSupabaseState(localSnapshot);
  }
}

function getRoutineTypeByText(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "high performance morning routine") return "morning";
  if (text === "high performance evening routine") return "evening";
  return null;
}

function loadRoutineAnswersState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_ROUTINE_ANSWERS_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveRoutineAnswersState(state) {
  saveLocalStateValue(DAY_ROUTINE_ANSWERS_STATE_KEY, JSON.stringify(state));
}

function loadRoutineAnswersForSlot(page, day, hour, routineType) {
  const state = loadRoutineAnswersState();
  const value =
    (((state[String(page)] || {})[day] || {})[hour] || {})[routineType];
  if (!value || typeof value !== "object") return {};
  return value;
}

function saveRoutineAnswersForSlot(page, day, hour, routineType, answers) {
  const state = loadRoutineAnswersState();
  const pageKey = String(page);
  const pageState = { ...(state[pageKey] || {}) };
  const dayState = { ...(pageState[day] || {}) };
  const hourState = { ...(dayState[hour] || {}) };
  hourState[routineType] = answers;
  dayState[hour] = hourState;
  pageState[day] = dayState;
  state[pageKey] = pageState;
  saveRoutineAnswersState(state);
}

function closeRoutineOverlay() {
  if (typeof activeRoutineModalClose === "function") {
    activeRoutineModalClose();
  }
}

function openRoutineOverlay({ page, day, hour, routineType }) {
  const copy = ROUTINE_MODAL_COPY[routineType];
  if (!copy) return;
  closeRoutineOverlay();

  const overlay = document.createElement("div");
  overlay.className = "routine-overlay";

  const card = document.createElement("div");
  card.className = "routine-modal";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", copy.title);

  const title = document.createElement("h3");
  title.className = "routine-modal-title";
  title.textContent = copy.title;

  const form = document.createElement("form");
  form.className = "routine-modal-form";

  const savedAnswers = loadRoutineAnswersForSlot(page, day, hour, routineType);
  copy.questions.forEach((question, index) => {
    const field = document.createElement("label");
    field.className = "routine-modal-field";

    const prompt = document.createElement("span");
    prompt.className = "routine-modal-prompt";
    prompt.textContent = question;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "routine-modal-input";
    input.value = String(savedAnswers[`q${index + 1}`] || "");
    input.setAttribute("aria-label", question);
    input.dataset.questionKey = `q${index + 1}`;

    field.append(prompt, input);
    form.append(field);
  });

  const actions = document.createElement("div");
  actions.className = "routine-modal-actions";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "routine-modal-btn routine-modal-btn-secondary";
  cancelBtn.textContent = "Close";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "routine-modal-btn routine-modal-btn-primary";
  saveBtn.textContent = "Save";

  actions.append(cancelBtn, saveBtn);
  form.append(actions);
  card.append(title, form);
  overlay.append(card);
  document.body.append(overlay);

  const cleanup = () => {
    document.removeEventListener("keydown", onEscClose);
    overlay.remove();
    if (activeRoutineModalClose === cleanup) {
      activeRoutineModalClose = null;
    }
  };

  const onEscClose = (event) => {
    if (event.key === "Escape") cleanup();
  };

  cancelBtn.addEventListener("click", cleanup);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) cleanup();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextAnswers = {};
    form.querySelectorAll(".routine-modal-input").forEach((inputEl) => {
      const key = inputEl.dataset.questionKey;
      if (!key) return;
      nextAnswers[key] = String(inputEl.value || "").trim();
    });
    saveRoutineAnswersForSlot(page, day, hour, routineType, nextAnswers);
    cleanup();
  });
  document.addEventListener("keydown", onEscClose);
  activeRoutineModalClose = cleanup;

  const firstInput = form.querySelector(".routine-modal-input");
  if (firstInput) {
    firstInput.focus();
  }
}

function setFullItemDragImage(event, sourceEl) {
  if (!event.dataTransfer || !sourceEl) return;
  const rect = sourceEl.getBoundingClientRect();
  let dragImageEl;

  if (sourceEl.tagName === "TR") {
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");
    const rowClone = sourceEl.cloneNode(true);
    tbody.append(rowClone);
    table.append(tbody);
    table.style.borderCollapse = "collapse";
    table.style.width = `${rect.width}px`;
    dragImageEl = table;
  } else {
    dragImageEl = sourceEl.cloneNode(true);
    dragImageEl.style.width = `${rect.width}px`;
    dragImageEl.style.maxWidth = `${rect.width}px`;
    dragImageEl.style.boxSizing = "border-box";
  }

  dragImageEl.style.position = "fixed";
  dragImageEl.style.left = "-10000px";
  dragImageEl.style.top = "0";
  dragImageEl.style.pointerEvents = "none";
  document.body.append(dragImageEl);
  event.dataTransfer.setDragImage(dragImageEl, rect.width / 2, rect.height / 2);
  requestAnimationFrame(() => dragImageEl.remove());
}

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
    overviewTransitionEndHandler = null;
    overviewTrackEl.style.transition = "none";
    overviewSlideIndex = wrapOverviewIndex(overviewSlideIndex + direction);
    renderOverviewCarousel();
    void overviewTrackEl.offsetWidth;
    overviewTrackEl.style.transition = "";
    overviewAnimating = false;
  };

  overviewTransitionEndHandler = onEnd;
  overviewTrackEl.addEventListener("transitionend", onEnd, { once: true });
}

function resetOverviewTransitionState() {
  if (!overviewTrackEl) return;
  if (overviewTransitionEndHandler) {
    overviewTrackEl.removeEventListener("transitionend", overviewTransitionEndHandler);
    overviewTransitionEndHandler = null;
  }
  overviewTrackEl.style.transition = "none";
  overviewAnimating = false;
  renderOverviewCarousel();
  void overviewTrackEl.offsetWidth;
  overviewTrackEl.style.transition = "";
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
  saveLocalStateValue(CHECKLIST_STATE_KEY, JSON.stringify(state));
}

function loadChecklistItemsState() {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_ITEMS_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveChecklistItemsState(state) {
  saveLocalStateValue(CHECKLIST_ITEMS_STATE_KEY, JSON.stringify(state));
}

function makeChecklistItemId() {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadChecklistItemsForPage(page, defaults) {
  const itemsState = loadChecklistItemsState();
  const pageItems = itemsState[String(page)];
  if (Array.isArray(pageItems) && pageItems.length) {
    return pageItems.map((item) => ({
      id: String(item?.id || makeChecklistItemId()),
      text: String(item?.text || "").trim() || "New checklist item",
      done: Boolean(item?.done)
    }));
  }

  const legacyState = loadChecklistState();
  const pageLegacyState = legacyState[String(page)] || {};
  return defaults.map((text, idx) => ({
    id: makeChecklistItemId(),
    text: String(text),
    done: Boolean(pageLegacyState[idx])
  }));
}

function getOrInitChecklistItemsForPage(page, defaults) {
  const state = loadChecklistItemsState();
  const pageKey = String(page);
  const existing = state[pageKey];
  if (Array.isArray(existing) && existing.length) {
    return existing.map((item) => ({
      id: String(item?.id || makeChecklistItemId()),
      text: String(item?.text || "").trim() || "New checklist item",
      done: Boolean(item?.done)
    }));
  }

  const initialized = loadChecklistItemsForPage(page, defaults);
  state[pageKey] = initialized.map((item) => ({
    id: String(item.id || makeChecklistItemId()),
    text: String(item.text || "").trim() || "New checklist item",
    done: Boolean(item.done)
  }));
  saveChecklistItemsState(state);
  return state[pageKey];
}

function saveChecklistItemsForPage(page, items) {
  const state = loadChecklistItemsState();
  state[String(page)] = items.map((item) => ({
    id: String(item.id || makeChecklistItemId()),
    text: String(item.text || "").trim() || "New checklist item",
    done: Boolean(item.done)
  }));
  saveChecklistItemsState(state);
}

function getChecklistDefaultsForPage(page) {
  const week = weeksData.find((entry) => entry.page === page);
  return week?.checklist || [];
}

function applyGoalTextEditAcrossWeeks(oldText, newText) {
  for (const week of weeksData) {
    const state = getOrInitChecklistItemsForPage(week.page, getChecklistDefaultsForPage(week.page));
    let changed = false;
    const next = state.map((entry) => {
      if (entry.text !== oldText) return entry;
      changed = true;
      return { ...entry, text: newText };
    });
    if (changed) {
      saveChecklistItemsForPage(week.page, next);
    }
  }
}

function deleteGoalAcrossWeeks(goalText) {
  for (const week of weeksData) {
    const state = getOrInitChecklistItemsForPage(week.page, getChecklistDefaultsForPage(week.page));
    const next = state.filter((entry) => entry.text !== goalText);
    if (next.length !== state.length) {
      saveChecklistItemsForPage(week.page, next);
    }
  }
}

function refreshAllRenderedWeekChecklists() {
  if (!weekCarouselTrackEl) return;
  const lists = weekCarouselTrackEl.querySelectorAll(".week-checklist ul[data-week-page]");
  lists.forEach((listEl) => {
    const page = Number(listEl.getAttribute("data-week-page"));
    if (!Number.isFinite(page)) return;
    renderChecklist(listEl, page, getChecklistDefaultsForPage(page));
  });
}

function addChecklistGoalForWeek(page) {
  const defaults = getChecklistDefaultsForPage(page);
  const state = getOrInitChecklistItemsForPage(page, defaults);
  state.push({
    id: makeChecklistItemId(),
    text: "New weekly goal",
    done: false
  });
  saveChecklistItemsForPage(page, state);
}

function addChecklistGoalAcrossWeeks() {
  for (const week of weeksData) {
    addChecklistGoalForWeek(week.page);
  }
}

function loadDayDoneState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_DONE_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveDayDoneState(state) {
  saveLocalStateValue(DAY_DONE_STATE_KEY, JSON.stringify(state));
}

function loadDayIntentState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_INTENT_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveDayIntentState(state) {
  saveLocalStateValue(DAY_INTENT_STATE_KEY, JSON.stringify(state));
}

function loadDayHoursState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_HOURS_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveDayHoursState(state) {
  saveLocalStateValue(DAY_HOURS_STATE_KEY, JSON.stringify(state));
}

function loadDayHourDoneState() {
  try {
    return JSON.parse(localStorage.getItem(DAY_HOUR_DONE_STATE_KEY) || "{}");
  } catch (_) {
    return {};
  }
}

function saveDayHourDoneState(state) {
  saveLocalStateValue(DAY_HOUR_DONE_STATE_KEY, JSON.stringify(state));
}

function saveDayHourDoneValue(page, day, hour, done) {
  const state = loadDayHourDoneState();
  const pageKey = String(page);
  const nextPageState = { ...(state[pageKey] || {}) };
  const nextDayState = { ...(nextPageState[day] || {}) };

  if (done) {
    nextDayState[hour] = true;
  } else {
    delete nextDayState[hour];
  }

  if (Object.keys(nextDayState).length) {
    nextPageState[day] = nextDayState;
  } else {
    delete nextPageState[day];
  }

  if (Object.keys(nextPageState).length) {
    state[pageKey] = nextPageState;
  } else {
    delete state[pageKey];
  }

  saveDayHourDoneState(state);
}

function saveDayHourValue(page, day, hour, value) {
  const state = loadDayHoursState();
  const pageKey = String(page);
  const nextPageState = { ...(state[pageKey] || {}) };
  const nextDayState = { ...(nextPageState[day] || {}) };
  const cleanValue = String(value || "").trim();

  nextDayState[hour] = cleanValue;

  if (!cleanValue) {
    saveDayHourDoneValue(page, day, hour, false);
  }

  nextPageState[day] = nextDayState;

  state[pageKey] = nextPageState;

  saveDayHoursState(state);
}

function formatDayIntentTitleCase(intent) {
  const trimmed = String(intent || "").trim();
  if (!trimmed) return "";

  return trimmed.replace(/[A-Za-z][A-Za-z']*/g, (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

function saveDayIntentForPage(page, day, intent) {
  const state = loadDayIntentState();
  const pageKey = String(page);
  const nextPageState = { ...(state[pageKey] || {}) };
  nextPageState[day] = formatDayIntentTitleCase(intent);
  state[pageKey] = nextPageState;
  saveDayIntentState(state);
}

function saveDayIntentAcrossWeeks(day, intent) {
  const nextIntent = formatDayIntentTitleCase(intent);
  const state = loadDayIntentState();
  for (const week of weeksData) {
    const pageKey = String(week.page);
    const nextPageState = { ...(state[pageKey] || {}) };
    nextPageState[day] = nextIntent;
    state[pageKey] = nextPageState;
  }
  saveDayIntentState(state);
}

function readDayDoneValue(pageDoneState, day, idx) {
  if (pageDoneState && typeof pageDoneState === "object") {
    if (Object.prototype.hasOwnProperty.call(pageDoneState, day)) {
      return Boolean(pageDoneState[day]);
    }
    // Backward compatibility for previously persisted numeric-index keys.
    if (Object.prototype.hasOwnProperty.call(pageDoneState, idx)) {
      return Boolean(pageDoneState[idx]);
    }
    if (Object.prototype.hasOwnProperty.call(pageDoneState, String(idx))) {
      return Boolean(pageDoneState[String(idx)]);
    }
  }
  return false;
}

function refreshAllRenderedWeekDayTables() {
  if (!weekCarouselTrackEl) return;
  const dayCards = weekCarouselTrackEl.querySelectorAll(".week-days[data-week-page]");
  dayCards.forEach((cardEl) => {
    const page = Number(cardEl.getAttribute("data-week-page"));
    if (!Number.isFinite(page)) return;
    const week = getWeekByPage(page);
    if (!week) return;
    renderDayTable(cardEl, page, week.days || []);
  });
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
  saveLocalStateValue(MISSION_STATE_KEY, JSON.stringify(state));
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
  saveLocalStateValue(OPS_STATE_KEY, JSON.stringify(state));
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
  saveLocalStateValue(REMINDER_STATE_KEY, String(value || ""));
}

function loadWeekTitleState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WEEK_TITLE_STATE_KEY) || "{}");
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {
    // no-op
  }
  return {};
}

function saveWeekTitleState(state) {
  saveLocalStateValue(WEEK_TITLE_STATE_KEY, JSON.stringify(state));
}

function loadWeekTitleForPage(page, fallbackTitle, legacyWeekLabel = "") {
  const state = loadWeekTitleState();
  const saved = state[String(page)];
  if (typeof saved === "string" && saved.trim().length) {
    const normalizedSaved = saved.trim();
    const normalizedLegacyLabel = String(legacyWeekLabel || "").trim();
    const normalizedFallback = String(fallbackTitle || "-").trim() || "-";
    if (
      normalizedLegacyLabel &&
      normalizedSaved === normalizedLegacyLabel &&
      normalizedSaved !== normalizedFallback
    ) {
      return normalizedFallback;
    }
    return normalizedSaved;
  }
  return String(fallbackTitle || "-").trim() || "-";
}

function saveWeekTitleForPage(page, value, fallbackTitle) {
  const normalized = String(value || "").trim();
  const fallback = String(fallbackTitle || "-").trim() || "-";
  const state = loadWeekTitleState();
  state[String(page)] = normalized || fallback;
  saveWeekTitleState(state);
}

function loadWeekNotesState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(WEEK_NOTES_STATE_KEY) || "{}");
    if (parsed && typeof parsed === "object") return parsed;
  } catch (_) {
    // no-op
  }
  return {};
}

function saveWeekNotesState(state) {
  saveLocalStateValue(WEEK_NOTES_STATE_KEY, JSON.stringify(state));
}

function loadWeekNotesForPage(page, fallbackNotes = "") {
  const state = loadWeekNotesState();
  const saved = state[String(page)];
  if (typeof saved === "string") return saved;
  return String(fallbackNotes || "");
}

function saveWeekNotesForPage(page, value) {
  const state = loadWeekNotesState();
  state[String(page)] = String(value || "");
  saveWeekNotesState(state);
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
        setFullItemDragImage(event, tr);
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
  let draggedIndex = null;
  missionListEl.innerHTML = "";

  items.forEach((text, index) => {
    const li = document.createElement("li");
    li.className = "mission-item";
    li.dataset.itemIndex = String(index);

    const textEl = document.createElement("div");
    textEl.className = "mission-text";
    textEl.textContent = text;

    const actionsEl = document.createElement("div");
    actionsEl.className = "mission-actions";

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "mission-icon-btn mission-drag-handle";
    dragHandle.title = "Drag to reorder";
    dragHandle.setAttribute("aria-label", "Drag to reorder mission");
    dragHandle.draggable = true;
    dragHandle.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">drag_indicator</span>";

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

    dragHandle.addEventListener("dragstart", (event) => {
      draggedIndex = index;
      li.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(index));
        setFullItemDragImage(event, li);
      }
    });

    li.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });

    li.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetIndex = Number(li.dataset.itemIndex);
      if (draggedIndex === null || Number.isNaN(targetIndex) || draggedIndex === targetIndex) return;
      const reordered = moveItem(loadMissionState(), draggedIndex, targetIndex);
      saveMissionState(reordered);
      renderMission();
    });

    dragHandle.addEventListener("dragend", () => {
      draggedIndex = null;
      missionListEl.querySelectorAll(".mission-item.dragging").forEach((row) => {
        row.classList.remove("dragging");
      });
    });

    actionsEl.append(dragHandle, editBtn, deleteBtn);
    li.append(textEl, actionsEl);
    missionListEl.append(li);
  });
  syncOverviewSlideHeights();
}

function pageStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = Number(params.get("page"));
  const page = Number.isFinite(raw) ? Math.max(1, Math.min(TOTAL_PAGES, Math.trunc(raw))) : 1;
  if (!params.has("day")) return { page, dayIndex: null };
  const rawDay = Number(params.get("day"));
  if (!Number.isFinite(rawDay)) return { page, dayIndex: null };
  const dayIndex = Math.max(0, Math.min(WEEK_DAY_ORDER.length - 1, Math.trunc(rawDay)));
  return { page, dayIndex };
}

function setUrlForState(page, dayIndex = null, replace = false) {
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", String(page));
  }
  if (dayIndex === null || dayIndex === undefined) {
    url.searchParams.delete("day");
  } else {
    url.searchParams.set("day", String(dayIndex));
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

function renderChecklist(containerEl, page, items) {
  const checklistItems = getOrInitChecklistItemsForPage(page, items);
  let draggedId = null;
  let activeScopePicker = null;
  const closeScopePicker = () => {
    if (activeScopePicker) {
      activeScopePicker.remove();
      activeScopePicker = null;
    }
  };

  const showScopePicker = (rowEl, anchorEl, triggerBtn, onSelect) => {
    closeScopePicker();
    const picker = document.createElement("div");
    picker.className = "check-scope-picker";

    const thisWeekBtn = document.createElement("button");
    thisWeekBtn.type = "button";
    thisWeekBtn.className = "check-scope-btn";
    thisWeekBtn.textContent = "This Week";

    const allWeeksBtn = document.createElement("button");
    allWeeksBtn.type = "button";
    allWeeksBtn.className = "check-scope-btn";
    allWeeksBtn.textContent = "All Weeks";

    thisWeekBtn.addEventListener("click", () => {
      closeScopePicker();
      onSelect("this");
    });
    allWeeksBtn.addEventListener("click", () => {
      closeScopePicker();
      onSelect("all");
    });

    picker.append(thisWeekBtn, allWeeksBtn);
    anchorEl.append(picker);
    activeScopePicker = picker;
    triggerBtn.blur();
  };

  containerEl.innerHTML = "";
  checklistItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "checklist-item-row";
    li.dataset.itemId = item.id;
    li.addEventListener("mouseenter", () => {
      if (!activeScopePicker) return;
      if (!li.contains(activeScopePicker)) {
        closeScopePicker();
      }
    });
    li.addEventListener("focusin", () => {
      if (!activeScopePicker) return;
      if (!li.contains(activeScopePicker)) {
        closeScopePicker();
      }
    });

    const label = document.createElement("label");
    label.className = "check-item";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(item.done);
    input.addEventListener("change", () => {
      const state = loadChecklistItemsForPage(page, items);
      const updated = state.map((entry) => (
        entry.id === item.id ? { ...entry, done: input.checked } : entry
      ));
      let next = updated;
      if (input.checked) {
        const checkedIndex = updated.findIndex((entry) => entry.id === item.id);
        if (checkedIndex > 0) {
          next = moveItem(updated, checkedIndex, 0);
        }
      }
      saveChecklistItemsForPage(page, next);
      awardReward("peaches", input.checked ? 5 : -5, input);
      renderChecklist(containerEl, page, items);
    });

    const text = document.createElement("span");
    text.className = "check-item-text";
    text.textContent = item.text;

    const actionsEl = document.createElement("div");
    actionsEl.className = "check-item-actions";

    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "check-item-icon-btn check-drag-handle";
    dragHandle.title = "Drag to reorder";
    dragHandle.setAttribute("aria-label", "Drag to reorder checklist item");
    dragHandle.draggable = true;
    dragHandle.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">drag_indicator</span>";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "check-item-icon-btn";
    editBtn.title = "Edit";
    editBtn.setAttribute("aria-label", "Edit checklist item");
    editBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "check-item-icon-btn";
    deleteBtn.title = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete checklist item");
    deleteBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">delete</span>";

    editBtn.addEventListener("click", () => {
      showScopePicker(li, actionsEl, editBtn, (applyScope) => {
        li.classList.add("editing");
        const editor = document.createElement("input");
        editor.type = "text";
        editor.className = "check-item-editor";
        editor.value = item.text;
        text.replaceWith(editor);
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);

        let saved = false;
        let canceled = false;
        const cancelEdit = () => {
          if (saved || canceled) return;
          canceled = true;
          renderChecklist(containerEl, page, items);
        };
        const saveEdit = () => {
          if (saved || canceled) return;
          saved = true;
          const nextText = editor.value.trim() || "New checklist item";
          if (applyScope === "all") {
            applyGoalTextEditAcrossWeeks(item.text, nextText);
            refreshAllRenderedWeekChecklists();
          } else {
            const state = loadChecklistItemsForPage(page, items);
            const next = state.map((entry) => (
              entry.id === item.id
                ? { ...entry, text: nextText }
                : entry
            ));
            saveChecklistItemsForPage(page, next);
          }
          renderChecklist(containerEl, page, items);
        };

        editor.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            saveEdit();
          } else if (event.key === "Escape") {
            event.preventDefault();
            cancelEdit();
          }
        });
        editor.addEventListener("blur", saveEdit, { once: true });
      });
    });

    deleteBtn.addEventListener("click", () => {
      showScopePicker(li, actionsEl, deleteBtn, (applyScope) => {
        if (applyScope === "all") {
          deleteGoalAcrossWeeks(item.text);
          refreshAllRenderedWeekChecklists();
        } else {
          const state = loadChecklistItemsForPage(page, items);
          const next = state.filter((entry) => entry.id !== item.id);
          saveChecklistItemsForPage(page, next);
        }
        renderChecklist(containerEl, page, items);
      });
    });

    dragHandle.addEventListener("dragstart", (event) => {
      draggedId = item.id;
      li.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.id);
        setFullItemDragImage(event, li);
      }
    });

    li.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });

    li.addEventListener("drop", (event) => {
      event.preventDefault();
      const targetId = li.dataset.itemId;
      if (!draggedId || !targetId || draggedId === targetId) return;
      const state = loadChecklistItemsForPage(page, items);
      const fromIndex = state.findIndex((entry) => entry.id === draggedId);
      const toIndex = state.findIndex((entry) => entry.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return;
      const reordered = moveItem(state, fromIndex, toIndex);
      saveChecklistItemsForPage(page, reordered);
      renderChecklist(containerEl, page, items);
    });

    dragHandle.addEventListener("dragend", () => {
      draggedId = null;
      containerEl.querySelectorAll(".checklist-item-row.dragging").forEach((row) => {
        row.classList.remove("dragging");
      });
    });

    actionsEl.append(dragHandle, editBtn, deleteBtn);
    if (index % 2 === 0) {
      label.append(actionsEl, input, text);
    } else {
      label.append(input, text, actionsEl);
    }
    li.append(label);
    containerEl.append(li);
  });
}

const WEEK_DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ENTRIES = weeksData.flatMap((week) =>
  WEEK_DAY_ORDER.map((day, dayIndex) => ({ weekPage: week.page, day, dayIndex }))
);
const DEFAULT_DAY_INTENTS = {
  Mon: "Recovery / Reset",
  Tue: "Content / Editing",
  Wed: "Planning / Coding",
  Thu: "Paragliding",
  Fri: "Coaching Progression / Networking",
  Sat: "Skydiving",
  Sun: "Skydiving"
};
const DEFAULT_DAY_HOUR_TEMPLATE = {
  "08:00": "High Performance Morning Routine",
  "09:00": "Workout / Protein",
  "13:00": "Lunch",
  "19:00": "Dinner",
  "20:00": "High Performance Evening Routine"
};

function normalizeWeekDays(days) {
  const byDay = new Map(
    (Array.isArray(days) ? days : [])
      .filter((row) => row && typeof row.day === "string")
      .map((row) => [row.day, row])
  );

  return WEEK_DAY_ORDER.map((day) => {
    const existing = byDay.get(day);
    const intent = formatDayIntentTitleCase((existing?.intent || "").trim()) || DEFAULT_DAY_INTENTS[day];
    return { day, intent };
  });
}

function migrateDayIntentsToTitleCase() {
  const state = loadDayIntentState();
  let changed = false;

  for (const [pageKey, pageState] of Object.entries(state)) {
    if (!pageState || typeof pageState !== "object") continue;
    const nextPageState = { ...pageState };

    for (const [day, intent] of Object.entries(pageState)) {
      const formattedIntent = formatDayIntentTitleCase(intent);
      if (formattedIntent !== intent) {
        nextPageState[day] = formattedIntent;
        changed = true;
      }
    }

    state[pageKey] = nextPageState;
  }

  if (changed) {
    saveDayIntentState(state);
  }
}

function seedDefaultDayHours() {
  const state = loadDayHoursState();
  let changed = false;

  for (const week of weeksData) {
    const pageKey = String(week.page);
    const pageState = { ...(state[pageKey] || {}) };

    for (const day of WEEK_DAY_ORDER) {
      const dayState = { ...(pageState[day] || {}) };
      for (const [hour, text] of Object.entries(DEFAULT_DAY_HOUR_TEMPLATE)) {
        if (!Object.prototype.hasOwnProperty.call(dayState, hour)) {
          dayState[hour] = text;
          changed = true;
        }
      }
      pageState[day] = dayState;
    }

    state[pageKey] = pageState;
  }

  if (changed) {
    saveDayHoursState(state);
  }
}

function migrateWorkoutProteinEntries() {
  const state = loadDayHoursState();
  let changed = false;

  for (const week of weeksData) {
    const pageKey = String(week.page);
    const pageState = { ...(state[pageKey] || {}) };

    for (const day of WEEK_DAY_ORDER) {
      const dayState = { ...(pageState[day] || {}) };
      if (String(dayState["09:00"] || "").trim() === "Workout") {
        dayState["09:00"] = "Workout / Protein";
        changed = true;
      }
      if (String(dayState["10:00"] || "").trim() === "Protein") {
        delete dayState["10:00"];
        changed = true;
      }
      pageState[day] = dayState;
    }

    state[pageKey] = pageState;
  }

  if (changed) {
    saveDayHoursState(state);
  }
}

function renderDayTable(containerEl, page, days, onDaySelect = null) {
  const doneState = loadDayDoneState();
  const pageDoneState = doneState[String(page)] || {};
  const intentState = loadDayIntentState();
  const pageIntentState = intentState[String(page)] || {};
  const normalizedDays = normalizeWeekDays(days);
  const dayFallbackIntents = Object.fromEntries(
    normalizedDays.map((entry) => [entry.day, entry.intent])
  );
  let draggedDay = null;
  let activeScopePicker = null;
  const closeScopePicker = () => {
    if (activeScopePicker) {
      activeScopePicker.remove();
      activeScopePicker = null;
    }
  };

  containerEl.innerHTML = "";

  const table = document.createElement("table");
  table.className = "week-days-table";

  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>DAY</th><th>PRIMARY INTENT</th><th>DONE</th></tr>";

  const tbody = document.createElement("tbody");
  normalizedDays.forEach((row, idx) => {
    const tr = document.createElement("tr");
    const dayTd = document.createElement("td");
    dayTd.textContent = row.day;
    if (typeof onDaySelect === "function") {
      dayTd.tabIndex = 0;
      dayTd.setAttribute("role", "button");
      dayTd.setAttribute("aria-label", `Open ${row.day} details`);
      dayTd.addEventListener("click", () => onDaySelect(row.day, idx));
      dayTd.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDaySelect(row.day, idx);
        }
      });
    }

    const intentTd = document.createElement("td");
    intentTd.className = "week-day-intent-cell";
    const intentText = document.createElement("span");
    intentText.className = "week-day-intent-text";
    intentText.textContent = formatDayIntentTitleCase((pageIntentState[row.day] || "").trim()) || row.intent;

    const intentActions = document.createElement("div");
    intentActions.className = "week-day-intent-actions";
    const dragIntentBtn = document.createElement("button");
    dragIntentBtn.type = "button";
    dragIntentBtn.className = "check-item-icon-btn week-day-drag-handle";
    dragIntentBtn.title = "Drag to swap day intent";
    dragIntentBtn.setAttribute("aria-label", `Drag ${row.day} intent to swap with another day`);
    dragIntentBtn.draggable = true;
    dragIntentBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">drag_indicator</span>";

    const editIntentBtn = document.createElement("button");
    editIntentBtn.type = "button";
    editIntentBtn.className = "check-item-icon-btn week-day-intent-edit-btn";
    editIntentBtn.title = "Edit day intent";
    editIntentBtn.setAttribute("aria-label", `Edit ${row.day} primary intent`);
    editIntentBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";
    intentActions.append(dragIntentBtn, editIntentBtn);
    intentTd.append(intentText, intentActions);
    if (typeof onDaySelect === "function") {
      intentTd.tabIndex = 0;
      intentTd.setAttribute("role", "button");
      intentTd.setAttribute("aria-label", `Open ${row.day} details`);
      intentTd.addEventListener("click", (event) => {
        const targetEl = event.target instanceof Element ? event.target : null;
        if (targetEl && targetEl.closest("button, input")) return;
        if (isMobileActionsViewport() && !intentTd.classList.contains("mobile-actions-open")) {
          clearMobileActionPanels();
          intentTd.classList.add("mobile-actions-open");
          return;
        }
        onDaySelect(row.day, idx);
      });
      intentTd.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          const targetEl = event.target instanceof Element ? event.target : null;
          if (targetEl && targetEl.closest("button, input")) return;
          event.preventDefault();
          onDaySelect(row.day, idx);
        }
      });
    }

    const startEdit = (applyScope) => {
      closeScopePicker();
      const editor = document.createElement("input");
      editor.type = "text";
      editor.className = "check-item-editor week-day-intent-editor";
      editor.value = String(intentText.textContent || "").trim() || row.intent;
      intentText.replaceWith(editor);
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);

      let saved = false;
      const saveEdit = () => {
        if (saved) return;
        saved = true;
        const nextIntent = String(editor.value || "").trim() || row.intent;
        if (applyScope === "all") {
          saveDayIntentAcrossWeeks(row.day, nextIntent);
          refreshAllRenderedWeekDayTables();
        } else {
          saveDayIntentForPage(page, row.day, nextIntent);
          renderDayTable(containerEl, page, days);
        }
      };

      editor.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") saveEdit();
      });
      editor.addEventListener("blur", saveEdit, { once: true });
    };

    editIntentBtn.addEventListener("click", () => {
      closeScopePicker();
      const picker = document.createElement("div");
      picker.className = "check-scope-picker week-day-intent-scope-picker";

      const thisWeekBtn = document.createElement("button");
      thisWeekBtn.type = "button";
      thisWeekBtn.className = "check-scope-btn";
      thisWeekBtn.textContent = "This Week";

      const allWeeksBtn = document.createElement("button");
      allWeeksBtn.type = "button";
      allWeeksBtn.className = "check-scope-btn";
      allWeeksBtn.textContent = "All Weeks";

      thisWeekBtn.addEventListener("click", () => startEdit("this"));
      allWeeksBtn.addEventListener("click", () => startEdit("all"));

      picker.append(thisWeekBtn, allWeeksBtn);
      intentTd.append(picker);
      activeScopePicker = picker;
      editIntentBtn.blur();
    });

    dragIntentBtn.addEventListener("dragstart", (event) => {
      closeScopePicker();
      draggedDay = row.day;
      tr.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", row.day);
        setFullItemDragImage(event, tr);
      }
    });

    tr.addEventListener("dragover", (event) => {
      if (!draggedDay) return;
      event.preventDefault();
      tr.classList.add("is-drag-over");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    });

    tr.addEventListener("dragleave", () => {
      tr.classList.remove("is-drag-over");
    });

    tr.addEventListener("drop", (event) => {
      if (!draggedDay) return;
      event.preventDefault();
      tr.classList.remove("is-drag-over");
      const targetDay = row.day;
      if (!targetDay || draggedDay === targetDay) return;
      const sourceIntent = formatDayIntentTitleCase(String(pageIntentState[draggedDay] || "").trim()) || dayFallbackIntents[draggedDay];
      const targetIntent = formatDayIntentTitleCase(String(pageIntentState[targetDay] || "").trim()) || dayFallbackIntents[targetDay];
      saveDayIntentForPage(page, draggedDay, targetIntent);
      saveDayIntentForPage(page, targetDay, sourceIntent);
      renderDayTable(containerEl, page, days);
    });

    dragIntentBtn.addEventListener("dragend", () => {
      draggedDay = null;
      tbody.querySelectorAll("tr.dragging, tr.is-drag-over").forEach((dayRow) => {
        dayRow.classList.remove("dragging", "is-drag-over");
      });
    });

    const doneTd = document.createElement("td");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "day-done-checkbox";
    input.checked = readDayDoneValue(pageDoneState, row.day, idx);
    input.addEventListener("change", () => {
      const current = loadDayDoneState();
      const nextPageState = { ...(current[String(page)] || {}) };
      nextPageState[row.day] = input.checked;
      // Cleanup legacy index keys once this row is touched.
      delete nextPageState[idx];
      delete nextPageState[String(idx)];
      current[String(page)] = nextPageState;
      saveDayDoneState(current);
      awardReward("peaches", input.checked ? 5 : -5, input);
    });
    doneTd.append(input);

    tr.append(dayTd, intentTd, doneTd);
    tr.addEventListener("mouseenter", () => {
      if (activeScopePicker && activeScopePicker.parentElement !== intentTd) {
        closeScopePicker();
      }
    });
    tr.addEventListener("focusin", () => {
      if (activeScopePicker && activeScopePicker.parentElement !== intentTd) {
        closeScopePicker();
      }
    });
    tbody.append(tr);
  });

  table.append(thead, tbody);
  containerEl.append(table);
}

function getWeekCenteredOffset(slide) {
  if (!weekViewportEl || !slide) return 0;
  const viewportWidth = weekViewportEl.clientWidth;
  const activeCenter = slide.offsetLeft + (slide.offsetWidth / 2);
  const viewportCenter = viewportWidth / 2;
  return viewportCenter - activeCenter;
}

function renderWeekCarousel() {
  if (!weekCarouselTrackEl || !weekViewportEl) return;
  const slides = [...weekCarouselTrackEl.querySelectorAll(".week-panel")];
  if (!slides.length) return;

  slides.forEach((slide, idx) => {
    slide.classList.toggle("is-active", idx === weekSlideIndex);
  });

  const activeSlide = slides[weekSlideIndex];
  const offset = getWeekCenteredOffset(activeSlide);
  weekCarouselTrackEl.style.transform = `translateX(${offset}px)`;

  if (weekDotsEl) {
    const dots = weekDotsEl.querySelectorAll(".carousel-dot");
    dots.forEach((dot, idx) => {
      dot.classList.toggle("is-active", idx === weekSlideIndex);
    });
  }

  prevWeekBtnEl.disabled = weekSlideIndex <= 0;
  nextWeekBtnEl.disabled = weekSlideIndex >= slides.length - 1;
}

function pageToWeekIndex(page) {
  return Math.max(0, WEEK_PAGES.indexOf(page));
}

function setWeekSlideByPage(page) {
  const idx = pageToWeekIndex(page);
  weekSlideIndex = idx;
  renderWeekCarousel();
}

function stepWeekSlide(direction) {
  if (weekAnimating || !weekCarouselTrackEl || !weekViewportEl) return;
  const slides = [...weekCarouselTrackEl.querySelectorAll(".week-panel")];
  if (!slides.length) return;

  const nextIndex = weekSlideIndex + direction;
  if (nextIndex < 0 || nextIndex >= slides.length) return;

  const activeSlide = slides[weekSlideIndex];
  const trackStyles = window.getComputedStyle(weekCarouselTrackEl);
  const gap = Number.parseFloat(trackStyles.gap || "0") || 0;
  const step = activeSlide.offsetWidth + gap;
  const startOffset = getWeekCenteredOffset(activeSlide);
  const animatedOffset = startOffset + (direction > 0 ? -step : step);

  weekAnimating = true;
  weekCarouselTrackEl.style.transition = "transform 260ms ease";
  weekCarouselTrackEl.style.transform = `translateX(${startOffset}px)`;

  requestAnimationFrame(() => {
    weekCarouselTrackEl.style.transform = `translateX(${animatedOffset}px)`;
  });

  const onEnd = () => {
    weekCarouselTrackEl.removeEventListener("transitionend", onEnd);
    weekTransitionEndHandler = null;
    weekCarouselTrackEl.style.transition = "none";
    weekSlideIndex = nextIndex;
    const page = WEEK_PAGES[weekSlideIndex];
    renderPage(page);
    void weekCarouselTrackEl.offsetWidth;
    weekCarouselTrackEl.style.transition = "";
    weekAnimating = false;
  };

  weekTransitionEndHandler = onEnd;
  weekCarouselTrackEl.addEventListener("transitionend", onEnd, { once: true });
}

function resetWeekTransitionState() {
  if (!weekCarouselTrackEl) return;
  if (weekTransitionEndHandler) {
    weekCarouselTrackEl.removeEventListener("transitionend", weekTransitionEndHandler);
    weekTransitionEndHandler = null;
  }
  weekCarouselTrackEl.style.transition = "none";
  weekAnimating = false;
  renderWeekCarousel();
  void weekCarouselTrackEl.offsetWidth;
  weekCarouselTrackEl.style.transition = "";
}

function getDayEntryIndex(weekPage, dayIndex) {
  return DAY_ENTRIES.findIndex((entry) => entry.weekPage === weekPage && entry.dayIndex === dayIndex);
}

function getDayCenteredOffset(slide) {
  if (!dayViewportEl || !slide) return 0;
  const viewportWidth = dayViewportEl.clientWidth;
  const activeCenter = slide.offsetLeft + (slide.offsetWidth / 2);
  const viewportCenter = viewportWidth / 2;
  return viewportCenter - activeCenter;
}

function renderDayCarousel() {
  if (!dayCarouselTrackEl || !dayViewportEl) return;
  const slides = [...dayCarouselTrackEl.querySelectorAll(".day-panel")];
  if (!slides.length) return;

  slides.forEach((slide, idx) => {
    slide.classList.toggle("is-active", idx === daySlideIndex);
  });

  const activeSlide = slides[daySlideIndex];
  dayCarouselTrackEl.style.transform = `translateX(${getDayCenteredOffset(activeSlide)}px)`;
  prevDayBtnEl.disabled = daySlideIndex <= 0;
  nextDayBtnEl.disabled = daySlideIndex >= slides.length - 1;
  renderDayDots();
}

function renderDayDots() {
  if (!dayDotsEl) return;
  const activeEntry = DAY_ENTRIES[daySlideIndex];
  if (!activeEntry) return;
  dayDotsEl.innerHTML = "";
  for (let idx = 0; idx < WEEK_DAY_ORDER.length; idx += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.classList.toggle("is-active", idx === activeEntry.dayIndex);
    dot.setAttribute("aria-label", `Show ${WEEK_DAY_ORDER[idx]}`);
    dot.addEventListener("click", () => {
      renderDayPage(activeEntry.weekPage, idx);
    });
    dayDotsEl.append(dot);
  }
}

function stepDaySlide(direction) {
  if (dayAnimating || !dayCarouselTrackEl || !dayViewportEl) return;
  const slides = [...dayCarouselTrackEl.querySelectorAll(".day-panel")];
  if (!slides.length) return;
  const nextIndex = daySlideIndex + direction;
  if (nextIndex < 0 || nextIndex >= slides.length) return;

  const activeSlide = slides[daySlideIndex];
  const trackStyles = window.getComputedStyle(dayCarouselTrackEl);
  const gap = Number.parseFloat(trackStyles.gap || "0") || 0;
  const step = activeSlide.offsetWidth + gap;
  const startOffset = getDayCenteredOffset(activeSlide);
  const animatedOffset = startOffset + (direction > 0 ? -step : step);

  dayAnimating = true;
  dayCarouselTrackEl.style.transition = "transform 260ms ease";
  dayCarouselTrackEl.style.transform = `translateX(${startOffset}px)`;

  requestAnimationFrame(() => {
    dayCarouselTrackEl.style.transform = `translateX(${animatedOffset}px)`;
  });

  const onEnd = () => {
    dayCarouselTrackEl.removeEventListener("transitionend", onEnd);
    dayTransitionEndHandler = null;
    dayCarouselTrackEl.style.transition = "none";
    daySlideIndex = nextIndex;
    const entry = DAY_ENTRIES[daySlideIndex];
    if (entry) renderDayPage(entry.weekPage, entry.dayIndex);
    void dayCarouselTrackEl.offsetWidth;
    dayCarouselTrackEl.style.transition = "";
    dayAnimating = false;
  };

  dayTransitionEndHandler = onEnd;
  dayCarouselTrackEl.addEventListener("transitionend", onEnd, { once: true });
}

function resetDayTransitionState() {
  if (!dayCarouselTrackEl) return;
  if (dayTransitionEndHandler) {
    dayCarouselTrackEl.removeEventListener("transitionend", dayTransitionEndHandler);
    dayTransitionEndHandler = null;
  }
  dayCarouselTrackEl.style.transition = "none";
  dayAnimating = false;
  renderDayCarousel();
  void dayCarouselTrackEl.offsetWidth;
  dayCarouselTrackEl.style.transition = "";
}

function shouldIgnoreArrowNav(event) {
  if (event.defaultPrevented) return true;
  const target = event.target;
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, button, [contenteditable='true'], [contenteditable=''], [role='textbox']"
    )
  );
}

function handleGlobalCarouselArrowKeys(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (shouldIgnoreArrowNav(event)) return;

  const direction = event.key === "ArrowRight" ? 1 : -1;
  if (currentPage === 1) {
    stepOverviewSlide(direction);
    return;
  }
  if (currentView === "day") {
    stepDaySlide(direction);
    return;
  }

  stepWeekSlide(direction);
}

function bindSwipeNavigation(viewportEl, onPrev, onNext) {
  if (!viewportEl) return;
  let startX = 0;
  let startY = 0;
  let swiping = false;
  const threshold = 36;

  viewportEl.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    swiping = true;
  }, { passive: true });

  viewportEl.addEventListener("touchend", (event) => {
    if (!swiping || event.changedTouches.length !== 1) return;
    swiping = false;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    if (deltaX > 0) {
      onPrev();
    } else {
      onNext();
    }
  }, { passive: true });

  viewportEl.addEventListener("touchcancel", () => {
    swiping = false;
  }, { passive: true });
}

function createWeekSlide(week) {
  const slide = document.createElement("article");
  slide.className = "week-panel";
  slide.dataset.page = String(week.page);

  const top = document.createElement("div");
  top.className = "week-top";

  const dateRange = document.createElement("p");
  dateRange.className = "week-date-range";
  dateRange.textContent = week.dateRange || "-";

  const title = document.createElement("h2");
  title.className = "panel-title";
  const defaultWeekTitle = String(week.missionFocus || week.title || "-").trim() || "-";
  const legacyWeekLabel = String(week.title || "").trim();
  title.textContent = loadWeekTitleForPage(week.page, defaultWeekTitle, legacyWeekLabel);
  title.setAttribute("aria-label", `Week ${week.week || ""} title`.trim());

  const titleRow = document.createElement("div");
  titleRow.className = "week-title-row";

  let titleEl = title;
  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "check-item-icon-btn week-title-edit-btn";
  editBtn.title = "Edit week title";
  editBtn.setAttribute("aria-label", `Edit week ${week.week || ""} title`.trim());
  editBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";

  editBtn.addEventListener("click", () => {
    if (titleRow.classList.contains("editing")) return;
    titleRow.classList.add("editing");

    const editor = document.createElement("input");
    editor.type = "text";
    editor.className = "check-item-editor week-title-editor";
    editor.value = String(titleEl.textContent || "").trim() || defaultWeekTitle;
    titleEl.replaceWith(editor);
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);

    const finishEdit = (commit) => {
      if (!titleRow.classList.contains("editing")) return;
      const nextTitle = commit
        ? (String(editor.value || "").trim() || defaultWeekTitle)
        : (String(titleEl.textContent || "").trim() || defaultWeekTitle);
      if (commit) {
        saveWeekTitleForPage(week.page, nextTitle, defaultWeekTitle);
      }

      const nextTitleEl = document.createElement("h2");
      nextTitleEl.className = "panel-title";
      nextTitleEl.setAttribute("aria-label", `Week ${week.week || ""} title`.trim());
      nextTitleEl.textContent = nextTitle;
      editor.replaceWith(nextTitleEl);
      titleEl = nextTitleEl;
      titleRow.classList.remove("editing");
    };

    editor.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        finishEdit(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finishEdit(false);
      }
    });

    editor.addEventListener("blur", () => finishEdit(true), { once: true });
  });

  titleRow.append(titleEl, editBtn);
  top.append(dateRange, titleRow);

  const checklistCard = document.createElement("div");
  checklistCard.className = "week-checklist";
  const checklistHeading = document.createElement("h3");
  checklistHeading.textContent = "WEEKLY GOALS";
  const checklistList = document.createElement("ul");
  checklistList.setAttribute("data-week-page", String(week.page));
  renderChecklist(checklistList, week.page, week.checklist || []);
  const addGoalBtn = document.createElement("button");
  addGoalBtn.type = "button";
  addGoalBtn.className = "week-goal-add-btn";
  addGoalBtn.setAttribute("aria-label", "Add weekly goal");
  addGoalBtn.textContent = "+ Add Goal";

  const addGoalScopePicker = document.createElement("div");
  addGoalScopePicker.className = "check-scope-picker week-goal-scope-picker";
  addGoalScopePicker.hidden = true;

  const addThisWeekBtn = document.createElement("button");
  addThisWeekBtn.type = "button";
  addThisWeekBtn.className = "check-scope-btn";
  addThisWeekBtn.textContent = "This Week";
  addThisWeekBtn.addEventListener("click", () => {
    addChecklistGoalForWeek(week.page);
    renderChecklist(checklistList, week.page, week.checklist || []);
    addGoalScopePicker.hidden = true;
  });

  const addAllWeeksBtn = document.createElement("button");
  addAllWeeksBtn.type = "button";
  addAllWeeksBtn.className = "check-scope-btn";
  addAllWeeksBtn.textContent = "All Weeks";
  addAllWeeksBtn.addEventListener("click", () => {
    addChecklistGoalAcrossWeeks();
    refreshAllRenderedWeekChecklists();
    addGoalScopePicker.hidden = true;
  });

  addGoalScopePicker.append(addThisWeekBtn, addAllWeeksBtn);
  const closeAddScopePicker = () => {
    addGoalScopePicker.hidden = true;
  };

  addGoalBtn.addEventListener("click", () => {
    addGoalScopePicker.hidden = !addGoalScopePicker.hidden;
  });
  checklistCard.addEventListener("mouseleave", closeAddScopePicker);
  checklistCard.addEventListener("focusout", () => {
    setTimeout(() => {
      if (!checklistCard.contains(document.activeElement)) {
        closeAddScopePicker();
      }
    }, 0);
  });
  checklistCard.append(checklistHeading, checklistList, addGoalBtn, addGoalScopePicker);

  const daysCard = document.createElement("div");
  daysCard.className = "week-days";
  daysCard.setAttribute("data-week-page", String(week.page));
  renderDayTable(daysCard, week.page, week.days || [], (_, dayIndex) => {
    renderDayPage(week.page, dayIndex);
  });

  const notesCard = document.createElement("div");
  notesCard.className = "week-notes";
  const notesHeading = document.createElement("h3");
  notesHeading.textContent = "NOTES / WINS / OPERATIONAL CHAOS";
  const notesEditor = document.createElement("textarea");
  notesEditor.className = "week-notes-editor";
  notesEditor.placeholder = "What happened this week?";
  notesEditor.setAttribute("aria-label", `Week ${week.week || ""} notes`.trim());
  notesEditor.value = loadWeekNotesForPage(week.page, week.notes || "");
  notesEditor.addEventListener("input", () => {
    saveWeekNotesForPage(week.page, notesEditor.value);
  });
  notesCard.append(notesHeading, notesEditor);

  slide.append(top, checklistCard, daysCard, notesCard);
  return slide;
}

function getDayIntentForPage(week, day) {
  const state = loadDayIntentState();
  const pageState = state[String(week.page)] || {};
  const fromState = formatDayIntentTitleCase(String(pageState[day] || "").trim());
  if (fromState) return fromState;
  const fromWeek = (week.days || []).find((row) => row.day === day);
  return formatDayIntentTitleCase(String(fromWeek?.intent || DEFAULT_DAY_INTENTS[day] || "-").trim()) || "-";
}

function formatDayDateForEntry(entry) {
  const week = getWeekByPage(entry.weekPage);
  const range = parseRangeToDates(week?.dateRange || "");
  if (!range?.start) return `${entry.day}`;
  const date = new Date(range.start);
  date.setDate(date.getDate() + entry.dayIndex);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function createDayHourRows(tableBodyEl, weekPage, day) {
  let draggedHourLabel = null;
  const expandedEmptyBlocks = new Set();

  const createHourRow = (dayState, hourLabel, options = {}) => {
    const { collapseBlockKey = "" } = options;
    const tr = document.createElement("tr");
    tr.dataset.hourLabel = hourLabel;

    const hourTd = document.createElement("td");
    hourTd.classList.add("day-hour-time-cell");
    const hourText = document.createElement("span");
    hourText.className = "day-hour-time-text";
    hourText.textContent = hourLabel;
    hourTd.append(hourText);

    if (collapseBlockKey) {
      const collapseBtn = document.createElement("button");
      collapseBtn.type = "button";
      collapseBtn.className = "day-hours-collapse-btn";
      collapseBtn.title = "Collapse empty time block";
      collapseBtn.setAttribute("aria-label", "Collapse empty time block");
      collapseBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">unfold_less</span>";
      collapseBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        expandedEmptyBlocks.delete(collapseBlockKey);
        render();
      });
      hourTd.append(collapseBtn);
    }

    const detailTd = document.createElement("td");
    detailTd.className = "day-hour-detail-cell";
    const textEl = document.createElement("p");
    textEl.className = "day-hour-text";
    const detailText = String(dayState[hourLabel] || "").trim();
    textEl.textContent = detailText;
    const doneTd = document.createElement("td");
    doneTd.className = "day-hour-done-cell";
    if (detailText) {
      const doneInput = document.createElement("input");
      doneInput.type = "checkbox";
      doneInput.className = "day-hour-done-checkbox";
      doneInput.setAttribute("aria-label", `Mark ${day} ${hourLabel} done`);
      const doneState = loadDayHourDoneState();
      doneInput.checked = Boolean(
        ((doneState[String(weekPage)] || {})[day] || {})[hourLabel]
      );
      doneInput.addEventListener("change", () => {
        saveDayHourDoneValue(weekPage, day, hourLabel, doneInput.checked);
        awardReward("cherries", doneInput.checked ? 10 : -10, doneInput);
      });
      doneTd.append(doneInput);
    }
    const routineType = getRoutineTypeByText(detailText);
    if (routineType) {
      detailTd.classList.add("day-hour-detail-routine-cell");
      detailTd.setAttribute("role", "button");
      detailTd.tabIndex = 0;
      detailTd.setAttribute("aria-label", `Open ${ROUTINE_MODAL_COPY[routineType].title} questions`);
      const openRoutine = () => openRoutineOverlay({
        page: weekPage,
        day,
        hour: hourLabel,
        routineType
      });
      detailTd.addEventListener("click", (event) => {
        const insideActions = event.target instanceof Element && Boolean(event.target.closest(".day-hour-actions"));
        if (insideActions) return;
        if (isMobileActionsViewport() && !detailTd.classList.contains("mobile-actions-open")) {
          clearMobileActionPanels();
          detailTd.classList.add("mobile-actions-open");
          return;
        }
        openRoutine();
      });
      detailTd.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const insideActions = event.target instanceof Element && Boolean(event.target.closest(".day-hour-actions"));
        if (insideActions) return;
        event.preventDefault();
        openRoutine();
      });
    }

    const actionsEl = document.createElement("div");
    actionsEl.className = "day-hour-actions";

    const dragBtn = document.createElement("button");
    dragBtn.type = "button";
    dragBtn.className = "check-item-icon-btn day-hour-drag-handle";
    dragBtn.title = "Drag to swap details";
    dragBtn.setAttribute("aria-label", `Drag ${day} ${hourLabel} details to swap with another hour`);
    dragBtn.draggable = true;
    dragBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">drag_indicator</span>";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "check-item-icon-btn";
    editBtn.title = "Edit";
    editBtn.setAttribute("aria-label", `Edit ${day} ${hourLabel} details`);
    editBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">edit</span>";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "check-item-icon-btn";
    deleteBtn.title = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete ${day} ${hourLabel} details`);
    deleteBtn.innerHTML = "<span class=\"material-symbols-outlined\" aria-hidden=\"true\">delete</span>";

    const startEditing = () => {
      detailTd.classList.remove("day-hour-detail-routine-cell");
      detailTd.removeAttribute("role");
      detailTd.removeAttribute("aria-label");
      detailTd.tabIndex = -1;
      detailTd.classList.add("editing");
      const editor = document.createElement("textarea");
      editor.className = "day-hour-input";
      editor.rows = 2;
      editor.placeholder = "Plan / focus / notes";
      editor.value = String(dayState[hourLabel] || "");
      editor.setAttribute("aria-label", `${day} ${hourLabel} details`);
      textEl.replaceWith(editor);
      editor.focus();
      editor.setSelectionRange(editor.value.length, editor.value.length);

      let saved = false;
      const saveEdit = () => {
        if (saved) return;
        saved = true;
        saveDayHourValue(weekPage, day, hourLabel, editor.value);
        render();
      };

      editor.addEventListener("keydown", (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          saveEdit();
        }
      });
      editor.addEventListener("blur", saveEdit, { once: true });
    };

    editBtn.addEventListener("click", startEditing);

    deleteBtn.addEventListener("click", () => {
      saveDayHourValue(weekPage, day, hourLabel, "");
      saveDayHourDoneValue(weekPage, day, hourLabel, false);
      render();
    });

    dragBtn.addEventListener("dragstart", (event) => {
      draggedHourLabel = hourLabel;
      tr.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", hourLabel);
        setFullItemDragImage(event, tr);
      }
    });

    tr.addEventListener("dragover", (event) => {
      if (!draggedHourLabel) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      tr.classList.add("is-drag-over");
    });

    tr.addEventListener("dragleave", () => {
      tr.classList.remove("is-drag-over");
    });

    tr.addEventListener("drop", (event) => {
      if (!draggedHourLabel) return;
      event.preventDefault();
      tr.classList.remove("is-drag-over");
      const targetHourLabel = hourLabel;
      if (!targetHourLabel || draggedHourLabel === targetHourLabel) return;

      const latestState = loadDayHoursState();
      const latestDoneState = loadDayHourDoneState();
      const pageKey = String(weekPage);
      const pageState = { ...(latestState[pageKey] || {}) };
      const latestDayState = { ...(pageState[day] || {}) };
      const donePageState = { ...(latestDoneState[pageKey] || {}) };
      const latestDayDoneState = { ...(donePageState[day] || {}) };
      const sourceValue = String(latestDayState[draggedHourLabel] || "");
      const targetValue = String(latestDayState[targetHourLabel] || "");
      const sourceDone = Boolean(latestDayDoneState[draggedHourLabel]);
      const targetDone = Boolean(latestDayDoneState[targetHourLabel]);

      if (targetValue.trim()) {
        latestDayState[draggedHourLabel] = targetValue;
      } else {
        delete latestDayState[draggedHourLabel];
      }

      if (sourceValue.trim()) {
        latestDayState[targetHourLabel] = sourceValue;
      } else {
        delete latestDayState[targetHourLabel];
      }
      if (targetDone) {
        latestDayDoneState[draggedHourLabel] = true;
      } else {
        delete latestDayDoneState[draggedHourLabel];
      }
      if (sourceDone) {
        latestDayDoneState[targetHourLabel] = true;
      } else {
        delete latestDayDoneState[targetHourLabel];
      }

      if (Object.keys(latestDayState).length) {
        pageState[day] = latestDayState;
      } else {
        delete pageState[day];
      }

      if (Object.keys(pageState).length) {
        latestState[pageKey] = pageState;
      } else {
        delete latestState[pageKey];
      }
      if (Object.keys(latestDayDoneState).length) {
        donePageState[day] = latestDayDoneState;
      } else {
        delete donePageState[day];
      }
      if (Object.keys(donePageState).length) {
        latestDoneState[pageKey] = donePageState;
      } else {
        delete latestDoneState[pageKey];
      }

      saveDayHoursState(latestState);
      saveDayHourDoneState(latestDoneState);
      render();
    });

    dragBtn.addEventListener("dragend", () => {
      draggedHourLabel = null;
      tableBodyEl.querySelectorAll("tr.dragging, tr.is-drag-over").forEach((hourRow) => {
        hourRow.classList.remove("dragging", "is-drag-over");
      });
    });

    actionsEl.append(dragBtn, editBtn, deleteBtn);
    detailTd.append(textEl, actionsEl);
    tr.append(hourTd, detailTd, doneTd);
    return tr;
  };

  const createCollapsedRow = (startHourLabel, endHourLabel, hiddenCount, blockKey) => {
    const tr = document.createElement("tr");
    tr.className = "day-hours-collapsed-row";

    const spacerTd = document.createElement("td");
    spacerTd.className = "day-hours-collapsed-time";
    spacerTd.tabIndex = 0;
    spacerTd.setAttribute("role", "button");
    spacerTd.setAttribute("aria-label", `Expand collapsed hours from ${startHourLabel} to ${endHourLabel}`);

    const collapsedInfo = document.createElement("div");
    collapsedInfo.className = "day-hours-collapsed-info";
    collapsedInfo.innerHTML = `
      <span class="material-symbols-outlined" aria-hidden="true">unfold_more</span>
      <span>${startHourLabel} - ${endHourLabel}</span>
    `;
    spacerTd.append(collapsedInfo);

    const expandBlock = () => {
      expandedEmptyBlocks.add(blockKey);
      render();
    };
    tr.addEventListener("click", expandBlock);
    spacerTd.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        expandBlock();
      }
    });

    const detailTd = document.createElement("td");
    detailTd.className = "day-hours-collapsed-cell";
    const doneTd = document.createElement("td");
    doneTd.className = "day-hours-collapsed-cell day-hours-collapsed-done-cell";
    tr.append(spacerTd, detailTd, doneTd);
    return tr;
  };

  const render = () => {
    const hoursState = loadDayHoursState();
    const dayState = (hoursState[String(weekPage)] || {})[day] || {};
    tableBodyEl.innerHTML = "";

    const hourEntries = [];
    for (let hour = 7; hour <= 23; hour += 1) {
      const hourLabel = `${String(hour).padStart(2, "0")}:00`;
      const value = String(dayState[hourLabel] || "").trim();
      hourEntries.push({ hourLabel, empty: !value });
    }

    let idx = 0;
    while (idx < hourEntries.length) {
      if (!hourEntries[idx].empty) {
        tableBodyEl.append(createHourRow(dayState, hourEntries[idx].hourLabel));
        idx += 1;
        continue;
      }

      let blockEnd = idx;
      while (blockEnd + 1 < hourEntries.length && hourEntries[blockEnd + 1].empty) {
        blockEnd += 1;
      }

      const blockLength = blockEnd - idx + 1;
      const blockKey = `${hourEntries[idx].hourLabel}-${hourEntries[blockEnd].hourLabel}`;
      const isExpanded = expandedEmptyBlocks.has(blockKey);

      if (blockLength <= 1 || isExpanded) {
        for (let rowIdx = idx; rowIdx <= blockEnd; rowIdx += 1) {
          const options = isExpanded && rowIdx === idx ? { collapseBlockKey: blockKey } : {};
          tableBodyEl.append(createHourRow(dayState, hourEntries[rowIdx].hourLabel, options));
        }
      } else {
        const hiddenStart = hourEntries[idx].hourLabel;
        const hiddenEnd = hourEntries[blockEnd].hourLabel;
        const hiddenCount = blockLength;
        tableBodyEl.append(createCollapsedRow(hiddenStart, hiddenEnd, hiddenCount, blockKey));
      }

      idx = blockEnd + 1;
    }
  };

  render();
}

function createDaySlide(entry) {
  const week = getWeekByPage(entry.weekPage);
  if (!week) return document.createElement("article");

  const slide = document.createElement("article");
  slide.className = "week-panel day-panel";

  const weekFocusBanner = document.createElement("h2");
  weekFocusBanner.className = "panel-title day-week-focus-banner";
  weekFocusBanner.textContent = loadWeekTitleForPage(
    week.page,
    String(week.missionFocus || week.title || "-").trim() || "-"
  );
  weekFocusBanner.setAttribute("role", "button");
  weekFocusBanner.tabIndex = 0;
  weekFocusBanner.setAttribute("aria-label", "Back to week");
  weekFocusBanner.addEventListener("click", () => {
    renderPage(week.page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  weekFocusBanner.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    renderPage(week.page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const dayDate = document.createElement("p");
  dayDate.className = "week-date-range day-date-line";
  const dayIntentValue = getDayIntentForPage(week, entry.day);
  const formattedDayDate = formatDayDateForEntry(entry);
  const formattedDayIntent = formatDayIntentTitleCase(String(dayIntentValue || "").trim());
  dayDate.textContent = formattedDayIntent ? `${formattedDayDate}: ${formattedDayIntent}` : formattedDayDate;

  const hoursCard = document.createElement("div");
  hoursCard.className = "week-days";
  const table = document.createElement("table");
  table.className = "week-days-table day-hours-table";
  table.innerHTML = "<thead><tr><th>TIME</th><th>DETAILS</th><th>DONE</th></tr></thead>";
  const tbody = document.createElement("tbody");
  createDayHourRows(tbody, week.page, entry.day);
  table.append(tbody);
  hoursCard.append(table);

  slide.append(weekFocusBanner, dayDate, hoursCard);
  return slide;
}

function initDayCarousel() {
  if (!dayCarouselTrackEl) return;
  dayCarouselTrackEl.innerHTML = "";
  DAY_ENTRIES.forEach((entry) => {
    dayCarouselTrackEl.append(createDaySlide(entry));
  });
  renderDayCarousel();
}

function initWeekCarousel() {
  if (!weekCarouselTrackEl || !weekDotsEl) return;
  weekCarouselTrackEl.innerHTML = "";
  weekDotsEl.innerHTML = "";

  weeksData.forEach((week, idx) => {
    const slide = createWeekSlide(week);
    weekCarouselTrackEl.append(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Show week ${week.week || idx + 1}`);
    dot.addEventListener("click", () => renderPage(week.page));
    weekDotsEl.append(dot);
  });

  renderWeekCarousel();
}

function renderDayPage(weekPage, dayIndex, opts = {}) {
  const { updateUrl = true, replaceUrl = false } = opts;
  const safePage = Math.max(2, Math.min(TOTAL_PAGES, Number(weekPage) || 2));
  const safeDayIndex = Math.max(0, Math.min(WEEK_DAY_ORDER.length - 1, Number(dayIndex) || 0));
  const dayEntryIndex = getDayEntryIndex(safePage, safeDayIndex);
  if (dayEntryIndex < 0) {
    renderPage(safePage, opts);
    return;
  }

  currentPage = safePage;
  currentView = "day";
  daySlideIndex = dayEntryIndex;
  const activeEntry = DAY_ENTRIES[dayEntryIndex];
  const currentSlide = dayCarouselTrackEl?.children?.[dayEntryIndex];
  if (activeEntry && currentSlide) {
    currentSlide.replaceWith(createDaySlide(activeEntry));
  }
  if (updateUrl) {
    setUrlForState(safePage, safeDayIndex, replaceUrl);
  }

  overviewCarouselEl.hidden = true;
  overviewCtaEl.hidden = true;
  weekPanelEl.hidden = true;
  dayPanelEl.hidden = false;

  resetDayTransitionState();
  renderDayCarousel();
}

function renderPage(page, opts = {}) {
  const { updateUrl = true, replaceUrl = false } = opts;
  currentPage = Math.max(1, Math.min(TOTAL_PAGES, page));
  currentView = currentPage === 1 ? "overview" : "week";
  if (updateUrl) {
    setUrlForState(currentPage, null, replaceUrl);
  }

  const onOverview = currentPage === 1;
  overviewCarouselEl.hidden = !onOverview;
  overviewCtaEl.hidden = !onOverview;
  weekPanelEl.hidden = onOverview;
  dayPanelEl.hidden = true;

  if (onOverview) {
    resetOverviewTransitionState();
  } else {
    resetWeekTransitionState();
    setWeekSlideByPage(currentPage);
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

document.addEventListener("click", (event) => {
  toggleMobileActionPanelFromTarget(event.target);
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
  stepWeekSlide(-1);
});

nextWeekBtnEl.addEventListener("click", () => {
  stepWeekSlide(1);
});
prevDayBtnEl.addEventListener("click", () => {
  stepDaySlide(-1);
});
nextDayBtnEl.addEventListener("click", () => {
  stepDaySlide(1);
});

document.addEventListener("keydown", handleGlobalCarouselArrowKeys);
bindSwipeNavigation(overviewViewportEl, () => stepOverviewSlide(-1), () => stepOverviewSlide(1));
bindSwipeNavigation(weekViewportEl, () => stepWeekSlide(-1), () => stepWeekSlide(1));
bindSwipeNavigation(dayViewportEl, () => stepDaySlide(-1), () => stepDaySlide(1));

homeBtnEl.addEventListener("click", () => {
  renderPage(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
dayHomeBtnEl.addEventListener("click", () => {
  renderPage(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});
dayWeekBtnEl.addEventListener("click", () => {
  renderPage(currentPage);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

if (dayCarouselTrackEl) {
  dayCarouselTrackEl.addEventListener("click", (event) => {
    const banner = event.target instanceof Element
      ? event.target.closest(".day-week-focus-banner")
      : null;
    if (!banner) return;
    const activeEntry = DAY_ENTRIES[daySlideIndex];
    if (!activeEntry) return;
    renderPage(activeEntry.weekPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  dayCarouselTrackEl.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const targetEl = event.target instanceof Element
      ? event.target.closest(".day-week-focus-banner")
      : null;
    if (!targetEl) return;
    event.preventDefault();
    const activeEntry = DAY_ENTRIES[daySlideIndex];
    if (!activeEntry) return;
    renderPage(activeEntry.weekPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

window.addEventListener("popstate", () => {
  const state = pageStateFromUrl();
  if (state.dayIndex !== null) {
    renderDayPage(state.page, state.dayIndex, { updateUrl: false });
  } else {
    renderPage(state.page, { updateUrl: false });
  }
});

window.addEventListener("resize", () => {
  if (!isMobileActionsViewport()) {
    clearMobileActionPanels();
  }
  syncOverviewSlideHeights();
  renderWeekCarousel();
  renderDayCarousel();
});

async function bootApp() {
  createRewardHud();
  window.seedRewardsFromCheckedItems = rebuildRewardsFromCheckedItems;
  await initSupabaseStateSync();
  initWeekCarousel();
  migrateDayIntentsToTitleCase();
  migrateWorkoutProteinEntries();
  seedDefaultDayHours();
  initDayCarousel();
  const initialState = pageStateFromUrl();
  if (initialState.dayIndex !== null) {
    renderDayPage(initialState.page, initialState.dayIndex, { replaceUrl: true });
  } else {
    renderPage(initialState.page, { replaceUrl: true });
  }
  renderMission();
  renderOps();
  renderReminder();
  initOverviewCarousel();
}

bootApp();
