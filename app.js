"use strict";
// Sport Strength: profile-driven plan generation, logging, charts, persistence.

const STORE_KEY = "sportstrength.v1";
const OLD_KEY = "gymbuddy.v1";
const SCHEMA_VERSION = 2;
const BRAND = "SPORT STRENGTH";

function defaultState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      units: "lb",
      bodyweight: 175,
      estimator: "epley",
      disclaimerAck: false,
      onboarded: false,
      daysPerWeek: 4,
      sessionMinutes: 60,
      profile: { sport: "tennis", goal: "power", age: 30, equipment: ["free", "cable"] },
    },
    sessions: [],
  };
}

let state = loadState();
let plan = null;
regeneratePlan();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.schemaVersion === SCHEMA_VERSION) return p;
      return migrate(p);
    }
    const old = localStorage.getItem(OLD_KEY);
    if (old) return migrate(JSON.parse(old)); // port Gym-Buddy data
    return defaultState();
  } catch (_) {
    return defaultState();
  }
}

function migrate(old) {
  const fresh = defaultState();
  if (old && Array.isArray(old.sessions)) fresh.sessions = old.sessions;
  if (old && old.settings) {
    fresh.settings.bodyweight = old.settings.bodyweight || fresh.settings.bodyweight;
    fresh.settings.estimator = old.settings.estimator || fresh.settings.estimator;
    fresh.settings.disclaimerAck = !!old.settings.disclaimerAck;
    fresh.settings.daysPerWeek = old.settings.daysPerWeek || 4;
    fresh.settings.sessionMinutes = old.settings.sessionMinutes || 60;
  }
  fresh.settings.onboarded = false; // collect new sport/goal/age/equipment profile
  return fresh;
}

function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function regeneratePlan() { plan = buildPlan(state.settings.profile); }

// ---------------- Helpers ----------------
const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, kids = []) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  (Array.isArray(kids) ? kids : [kids]).forEach((c) => {
    if (c == null) return;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return n;
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const round1 = (n) => Math.round(n * 10) / 10;

function e1rm(weight, reps) {
  if (!weight || !reps) return 0;
  if (state.settings.estimator === "brzycki") return reps >= 37 ? weight : weight * 36 / (37 - reps);
  return weight * (1 + reps / 30);
}

// ---------------- Scheduler ----------------
function blockSeconds(block) {
  const s = block.scheme;
  const perRep = block.phase === "power" ? 2 : 3.5;
  const work = s.sets * (s.reps * perRep);
  const rest = s.sets * (s.restSec || 60);
  return work + rest + 45;
}

function buildSession(day, settings) {
  const budget = (settings.sessionMinutes || 60) * 60;
  const ordered = day.blocks.map((b, i) => ({ ...b, _i: i }));
  const mandatory = ordered.filter((b) => b.phase === "power" && b.priority === 1);
  const optional = ordered
    .filter((b) => !(b.phase === "power" && b.priority === 1))
    .sort((a, b) => a.priority - b.priority || a._i - b._i);

  let total = mandatory.reduce((t, b) => t + blockSeconds(b), 0);
  const chosen = new Map();
  mandatory.forEach((b) => chosen.set(b._i, b));
  const overPowerOnly = total > budget;

  for (const b of optional) {
    const full = blockSeconds(b);
    if (total + full <= budget) { chosen.set(b._i, b); total += full; continue; }
    if (b.scheme.sets > 2) {
      const trimmed = { ...b, scheme: { ...b.scheme, sets: 2 }, _trimmed: true };
      const cost = blockSeconds(trimmed);
      if (total + cost <= budget) { chosen.set(b._i, trimmed); total += cost; }
    }
  }
  const blocks = ordered.filter((b) => chosen.has(b._i)).map((b) => chosen.get(b._i));
  return { blocks, estSeconds: total, overPowerOnly };
}

function rotation() {
  const d = plan.days.length;
  const n = Math.max(2, Math.min(state.settings.daysPerWeek || d, d));
  return plan.days.slice(0, n).map((x) => x.dayId);
}
function nextDayId() {
  const rot = rotation();
  const last = state.sessions.filter((s) => s.planId === plan.id).sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
  if (!last) return rot[0];
  const i = rot.indexOf(last.dayId);
  return rot[(i + 1) % rot.length];
}
function lastSessionFor(dayId) {
  return state.sessions.filter((s) => s.planId === plan.id && s.dayId === dayId).sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
}

// ---------------- Routing ----------------
let route = "today";
let workingSession = null;
let restTimer = null;
function navigate(r) { route = r; render(); }

function render() {
  const root = $("#app");
  root.innerHTML = "";
  if (!state.settings.disclaimerAck) return root.appendChild(disclaimerView());
  if (!state.settings.onboarded) return root.appendChild(onboardingView());
  root.appendChild(header());
  const view = { today: todayView, history: historyView, progress: progressView, settings: settingsView }[route] || todayView;
  root.appendChild(view());
  root.appendChild(navBar());
}

// ---------------- Views ----------------
function disclaimerView() {
  return el("div", { class: "card disclaimer" }, [
    el("h2", {}, "Before you start"),
    el("p", {}, BRAND + " provides general training information only. It is NOT medical, physiotherapy, or professional coaching advice. Plyometric and explosive work carries injury risk."),
    el("p", {}, "Consult a qualified professional before beginning any program. Stop if you feel pain. You train at your own risk."),
    el("button", { class: "primary big", onclick: () => { state.settings.disclaimerAck = true; save(); render(); } }, "I Understand"),
  ]);
}

function onboardingView() {
  const s = state.settings, pr = s.profile;
  return el("div", { class: "card" }, [
    el("h2", {}, "Build Your Program"),
    el("p", { class: "muted" }, "We tailor every workout to your sport, goal, equipment, age and bodyweight."),
    fieldSelect("Sport", pr.sport, SPORTS.map((x) => [x.id, x.name]), (v) => (pr.sport = v)),
    fieldSelect("Training focus", pr.goal, GOALS.map((x) => [x.id, x.name]), (v) => (pr.goal = v)),
    fieldNumber("Age", pr.age, 12, 90, (v) => (pr.age = v)),
    fieldNumber("Bodyweight (" + s.units + ")", s.bodyweight, 50, 500, (v) => (s.bodyweight = v)),
    equipmentField(pr),
    fieldNumber("Days per week", s.daysPerWeek, 2, 6, (v) => (s.daysPerWeek = v)),
    fieldSelect("Time per session", String(s.sessionMinutes), ["30", "45", "60", "75", "90"].map((m) => [m, m + " min"]), (v) => (s.sessionMinutes = +v)),
    el("button", { class: "primary big", onclick: () => {
      if (!pr.equipment.length) pr.equipment = ["free"];
      s.onboarded = true; regeneratePlan(); save(); navigate("today");
    } }, "Start Training"),
  ]);
}

function header() {
  return el("header", {}, [
    el("h1", {}, BRAND),
    el("span", { class: "muted small" }, plan.name),
  ]);
}

function navBar() {
  const tabs = [["today", "Today"], ["history", "History"], ["progress", "Progress"], ["settings", "Settings"]];
  return el("nav", {}, tabs.map(([r, label]) =>
    el("button", { class: route === r ? "active" : "", onclick: () => navigate(r) }, label)));
}

function fieldNumber(label, val, min, max, onChange) {
  let cur = val;
  const out = el("span", { class: "stepval" }, String(cur));
  const set = (v) => { cur = Math.max(min, Math.min(max, v)); out.textContent = String(cur); onChange(cur); };
  return el("div", { class: "field" }, [
    el("label", {}, label),
    el("div", { class: "stepper" }, [
      el("button", { type: "button", class: "step", onclick: () => set(cur - 1) }, "−"),
      out,
      el("button", { type: "button", class: "step", onclick: () => set(cur + 1) }, "+"),
    ]),
  ]);
}

function fieldSelect(label, val, pairs, onChange) {
  const sel = el("select", { onchange: (e) => onChange(e.target.value) },
    pairs.map(([v, t]) => el("option", { value: v, ...(String(v) === String(val) ? { selected: "selected" } : {}) }, t)));
  return el("div", { class: "field" }, [el("label", {}, label), sel]);
}

function equipmentField(pr) {
  return el("div", { class: "field" }, [
    el("label", {}, "Available equipment"),
    el("div", { class: "chips" }, EQUIPMENT.map((eq) => {
      const on = pr.equipment.includes(eq.id);
      return el("button", {
        type: "button", class: "chip" + (on ? " on" : ""),
        onclick: (e) => {
          const i = pr.equipment.indexOf(eq.id);
          if (i >= 0) pr.equipment.splice(i, 1); else pr.equipment.push(eq.id);
          e.target.className = "chip" + (pr.equipment.includes(eq.id) ? " on" : "");
        },
      }, eq.name);
    })),
    el("p", { class: "muted small" }, "Bodyweight & plyometrics are always included."),
  ]);
}

// ---- Today / logging ----
function ensureWorkingSession(dayId, fromSession) {
  const day = plan.days.find((d) => d.dayId === dayId);
  if (fromSession) { workingSession = JSON.parse(JSON.stringify(fromSession)); return day; }
  const built = buildSession(day, state.settings);
  const prev = lastSessionFor(dayId);
  workingSession = {
    id: "sess-" + Date.now(),
    date: todayISO(),
    planId: plan.id,
    dayId,
    startedAt: new Date().toISOString(),
    completedAt: null,
    bodyweight: state.settings.bodyweight,
    notes: "",
    _estSeconds: built.estSeconds,
    _overPowerOnly: built.overPowerOnly,
    entries: built.blocks.map((b) => {
      const pe = prev && prev.entries.find((e) => e.exerciseId === b.exerciseId);
      const sets = [];
      for (let i = 0; i < b.scheme.sets; i++) {
        const p = pe && pe.sets[i];
        sets.push({ reps: p ? p.reps : b.scheme.reps, weight: p ? p.weight : 0, rpe: p ? p.rpe : null, done: false });
      }
      return { exerciseId: b.exerciseId, phase: b.phase, scheme: b.scheme, sets };
    }),
  };
  return day;
}

function todayView() {
  if (!workingSession || workingSession.planId !== plan.id) ensureWorkingSession(nextDayId());
  const wrap = el("div", {});
  const rot = rotation();

  wrap.appendChild(el("div", { class: "card compact" }, [
    el("div", { class: "field" }, [
      el("label", {}, "Workout"),
      el("select", { onchange: (e) => { ensureWorkingSession(e.target.value); render(); } },
        rot.map((id) => {
          const d = plan.days.find((x) => x.dayId === id);
          return el("option", { value: id, ...(id === workingSession.dayId ? { selected: "selected" } : {}) }, d.name);
        })),
    ]),
    el("div", { class: "field" }, [
      el("label", {}, "Time today"),
      el("select", { onchange: (e) => {
          const prevMin = state.settings.sessionMinutes;
          state.settings.sessionMinutes = +e.target.value;
          ensureWorkingSession(workingSession.dayId);
          state.settings.sessionMinutes = prevMin;
          render();
        } },
        ["30", "45", "60", "75", "90"].map((m) =>
          el("option", { value: m, ...(+m === state.settings.sessionMinutes ? { selected: "selected" } : {}) }, m + " min"))),
    ]),
    el("p", { class: "muted small" }, "Est. ~" + Math.round(workingSession._estSeconds / 60) + " min · " + workingSession.entries.length + " exercises"),
  ]));

  if (workingSession._overPowerOnly)
    wrap.appendChild(el("div", { class: "card warn" }, "Short session: only the core power work fits. Add time for the rest."));
  if (state.settings.profile.age >= 40)
    wrap.appendChild(el("div", { class: "card note small" }, "Age-scaled: volume trimmed and a thorough warm-up is recommended before explosive work."));

  let lastPhase = null;
  workingSession.entries.forEach((entry, ei) => {
    if (entry.phase !== lastPhase) {
      lastPhase = entry.phase;
      wrap.appendChild(el("div", { class: "phase-label " + entry.phase },
        entry.phase === "power" ? "POWER — EXPLOSIVE · FULL REST · NOT TO FAILURE" : "STRENGTH / VOLUME — CONTROLLED · PROGRESSIVE OVERLOAD"));
    }
    wrap.appendChild(exerciseCard(entry, ei));
  });

  const notes = el("textarea", { class: "notes", placeholder: "Session notes…", oninput: (e) => (workingSession.notes = e.target.value) });
  notes.value = workingSession.notes || "";
  wrap.appendChild(el("div", { class: "card" }, [el("label", {}, "Notes"), notes]));

  wrap.appendChild(el("div", { class: "savebar" }, [
    el("button", { class: "primary big", onclick: saveWorkout }, workingSession.completedAt ? "Update Workout" : "Finish & Save"),
  ]));
  return wrap;
}

function exerciseCard(entry, ei) {
  const ex = exMeta(entry.exerciseId);
  const sc = entry.scheme;
  const target = sc.repRange ? sc.repRange[0] + "–" + sc.repRange[1] + " reps" : sc.sets + "×" + sc.reps;
  const card = el("div", { class: "card exercise" });
  card.appendChild(el("div", { class: "ex-head" }, [
    el("strong", {}, ex ? ex.name : entry.exerciseId),
    el("span", { class: "muted small" }, target + (sc.note ? " · " + sc.note : "")),
  ]));

  if (ex) {
    const adv = ex.cue.startsWith("ADVANCED");
    card.appendChild(el("details", { class: "howto" }, [
      el("summary", { class: "small" }, "How to perform"),
      el("p", { class: "small" }, ex.cue),
      el("a", { class: "vidlink small", href: videoUrl(ex.name), target: "_blank", rel: "noopener" }, "▶ Watch demo (YouTube)"),
    ]));
    if (adv) card.appendChild(el("div", { class: "caution small" }, "⚠ Advanced movement — progress carefully."));
    const hint = startingLoadHint(ex.patterns, state.settings.bodyweight);
    const allZero = entry.sets.every((s) => !s.weight);
    if (hint && allZero && !ex.power)
      card.appendChild(el("div", { class: "hint small" }, "Rough starting point ~" + hint + " " + state.settings.units + " — adjust to feel."));
  }

  if (entry.phase === "hypertrophy" && sc.repRange) {
    const pe = lastSessionFor(workingSession.dayId);
    const m = pe && pe.entries.find((e) => e.exerciseId === entry.exerciseId);
    if (m && m.sets.length && m.sets.every((s) => s.done && s.reps >= sc.repRange[1] && (s.rpe == null || s.rpe <= 8)))
      card.appendChild(el("div", { class: "hint small" }, "You topped the rep range last time — add a little weight."));
  }

  entry.sets.forEach((set, si) => card.appendChild(setRow(entry, set, si)));
  card.appendChild(el("button", { type: "button", class: "ghost small", onclick: () => { entry.sets.push({ reps: sc.reps, weight: 0, rpe: null, done: false }); render(); } }, "+ Add set"));
  return card;
}

function setRow(entry, set, si) {
  const numField = (val, step, onCh) => {
    const v = el("span", { class: "stepval" }, String(val));
    const mk = (d) => el("button", { type: "button", class: "mini", onclick: () => { const nv = Math.max(0, (+v.textContent || 0) + d); v.textContent = String(round1(nv)); onCh(round1(nv)); } }, d > 0 ? "+" : "−");
    return el("div", { class: "numfield" }, [mk(-step), v, mk(step)]);
  };
  return el("div", { class: "setrow" + (set.done ? " done" : "") }, [
    el("span", { class: "setno" }, "S" + (si + 1)),
    el("div", { class: "lbl" }, [el("small", {}, "reps"), numField(set.reps, 1, (n) => (set.reps = n))]),
    el("div", { class: "lbl" }, [el("small", {}, state.settings.units), numField(set.weight, 5, (n) => (set.weight = n))]),
    el("div", { class: "lbl" }, [el("small", {}, "RPE"), numField(set.rpe || 0, 1, (n) => (set.rpe = n || null))]),
    el("button", {
      type: "button", class: "donebtn " + (set.done ? "on" : ""),
      onclick: () => { set.done = !set.done; if (set.done && entry.scheme.restSec) startRest(entry.scheme.restSec); render(); },
    }, set.done ? "✓" : "○"),
  ]);
}

function startRest(sec) {
  clearInterval(restTimer);
  let left = sec;
  let bar = $("#resttimer");
  if (!bar) { bar = el("div", { id: "resttimer", class: "resttimer" }); document.body.appendChild(bar); }
  const tick = () => {
    bar.textContent = "REST " + Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
    bar.style.display = "block";
    if (left <= 0) { clearInterval(restTimer); bar.textContent = "GO"; setTimeout(() => (bar.style.display = "none"), 4000); }
    left--;
  };
  tick();
  restTimer = setInterval(tick, 1000);
}

function saveWorkout() {
  workingSession.completedAt = new Date().toISOString();
  const idx = state.sessions.findIndex((s) => s.id === workingSession.id);
  const clean = JSON.parse(JSON.stringify(workingSession));
  delete clean._estSeconds; delete clean._overPowerOnly;
  if (idx >= 0) state.sessions[idx] = clean; else state.sessions.push(clean);
  state.settings.bodyweight = workingSession.bodyweight;
  save();
  workingSession = null;
  clearInterval(restTimer);
  const rt = $("#resttimer"); if (rt) rt.style.display = "none";
  backupNudge();
  navigate("history");
}

let sessionsSinceBackup = 0;
function backupNudge() {
  if (++sessionsSinceBackup >= 3) { alert("Tip: export a JSON backup from Settings so you don't lose your log."); sessionsSinceBackup = 0; }
}

// ---- History ----
function historyView() {
  const wrap = el("div", {});
  if (!state.sessions.length) { wrap.appendChild(el("div", { class: "card muted" }, "No workouts logged yet.")); return wrap; }
  [...state.sessions].sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1)).forEach((s) => {
    const day = plan.days.find((d) => d.dayId === s.dayId);
    const tonnage = s.entries.reduce((t, e) => t + e.sets.reduce((x, st) => x + (st.done ? st.reps * st.weight : 0), 0), 0);
    wrap.appendChild(el("div", { class: "card" }, [
      el("div", { class: "ex-head" }, [el("strong", {}, s.date), el("span", { class: "muted small" }, day ? day.name : s.dayId)]),
      el("p", { class: "muted small" }, "Tonnage " + Math.round(tonnage) + " " + state.settings.units + " · " + s.entries.length + " exercises"),
      el("div", { class: "row" }, [
        el("button", { type: "button", class: "ghost small", onclick: () => { ensureWorkingSession(s.dayId, s); navigate("today"); } }, "Edit"),
        el("button", { type: "button", class: "ghost small danger", onclick: () => { if (confirm("Delete this workout?")) { state.sessions = state.sessions.filter((x) => x.id !== s.id); save(); render(); } } }, "Delete"),
      ]),
      sessionDetail(s),
    ]));
  });
  return wrap;
}

function sessionDetail(s) {
  return el("details", {}, [
    el("summary", { class: "small muted" }, "Details"),
    ...s.entries.map((e) => {
      const ex = exMeta(e.exerciseId);
      const best = e.sets.filter((x) => x.done).reduce((m, x) => Math.max(m, e1rm(x.weight, x.reps)), 0);
      return el("div", { class: "small" }, [
        el("strong", {}, (ex ? ex.name : e.exerciseId) + ": "),
        e.sets.map((x) => x.reps + "×" + x.weight + (x.rpe ? "@" + x.rpe : "")).join(", "),
        best ? el("span", { class: "muted" }, "  ~1RM " + round1(best)) : null,
      ]);
    }),
  ]);
}

// ---- Progress ----
function progressView() {
  const wrap = el("div", {});
  if (!state.sessions.length) { wrap.appendChild(el("div", { class: "card muted" }, "Log a workout to see progress.")); return wrap; }

  const logged = [...new Set(state.sessions.flatMap((s) => s.entries.map((e) => e.exerciseId)))];
  const pick = progressView._pick && logged.includes(progressView._pick) ? progressView._pick : logged[0];
  progressView._pick = pick;
  const sel = el("select", { onchange: (e) => { progressView._pick = e.target.value; render(); } },
    logged.map((id) => el("option", { value: id, ...(id === pick ? { selected: "selected" } : {}) }, exMeta(id) ? exMeta(id).name : id)));

  const pts = [...state.sessions].sort((a, b) => (a.date < b.date ? -1 : 1)).map((s) => {
    const e = s.entries.find((x) => x.exerciseId === pick);
    if (!e) return null;
    const best = e.sets.filter((x) => x.done).reduce((m, x) => Math.max(m, e1rm(x.weight, x.reps)), 0);
    return best ? { label: s.date.slice(5), value: round1(best) } : null;
  }).filter(Boolean);

  const c1 = el("canvas", { width: 600, height: 240, class: "chart" });
  wrap.appendChild(el("div", { class: "card" }, [el("label", {}, "Estimated 1RM trend"), sel, c1]));

  const weeks = {};
  state.sessions.forEach((s) => {
    const wk = weekKey(s.date);
    weeks[wk] = weeks[wk] || { power: 0, hyp: 0 };
    s.entries.forEach((e) => e.sets.forEach((st) => {
      if (!st.done) return;
      const v = st.reps * st.weight;
      if (e.phase === "power") weeks[wk].power += v; else weeks[wk].hyp += v;
    }));
  });
  const wk = Object.keys(weeks).sort().slice(-8);
  const c2 = el("canvas", { width: 600, height: 240, class: "chart" });
  wrap.appendChild(el("div", { class: "card" }, [el("label", {}, "Weekly volume — power vs strength/volume"), c2]));

  setTimeout(() => {
    drawLineChart(c1, pts);
    drawGroupedBars(c2, wk.map((k) => k.slice(5)), wk.map((k) => weeks[k].power), wk.map((k) => weeks[k].hyp), "power", "vol");
  }, 0);
  return wrap;
}

function weekKey(iso) {
  const d = new Date(iso + "T00:00:00");
  const j = new Date(d.getFullYear(), 0, 1);
  const w = Math.ceil(((d - j) / 86400000 + j.getDay() + 1) / 7);
  return d.getFullYear() + "-W" + String(w).padStart(2, "0");
}

// ---- Settings ----
function settingsView() {
  const s = state.settings, pr = s.profile;
  const regen = () => { regeneratePlan(); workingSession = null; save(); };
  return el("div", {}, [
    el("div", { class: "card" }, [
      el("h3", {}, "Program"),
      fieldSelect("Sport", pr.sport, SPORTS.map((x) => [x.id, x.name]), (v) => { pr.sport = v; regen(); }),
      fieldSelect("Training focus", pr.goal, GOALS.map((x) => [x.id, x.name]), (v) => { pr.goal = v; regen(); }),
      fieldNumber("Age", pr.age, 12, 90, (v) => { pr.age = v; regen(); }),
      fieldNumber("Bodyweight (" + s.units + ")", s.bodyweight, 50, 500, (v) => { s.bodyweight = v; save(); }),
      equipmentField(pr),
      el("button", { type: "button", class: "ghost small", onclick: () => { if (!pr.equipment.length) pr.equipment = ["free"]; regen(); render(); } }, "Apply equipment changes"),
    ]),
    el("div", { class: "card" }, [
      el("h3", {}, "Schedule"),
      fieldNumber("Days per week", s.daysPerWeek, 2, 6, (v) => { s.daysPerWeek = v; save(); }),
      fieldSelect("Time per session", String(s.sessionMinutes), ["30", "45", "60", "75", "90"].map((m) => [m, m + " min"]), (v) => { s.sessionMinutes = +v; save(); }),
      fieldSelect("1RM estimator", s.estimator, [["epley", "Epley"], ["brzycki", "Brzycki"]], (v) => { s.estimator = v; save(); }),
    ]),
    el("div", { class: "card" }, [
      el("h3", {}, "Data"),
      el("button", { type: "button", class: "primary", onclick: exportData }, "Export Backup (JSON)"),
      el("label", { class: "ghost filelabel" }, ["Import Backup", el("input", { type: "file", accept: "application/json", style: "display:none", onchange: importData })]),
      el("button", { type: "button", class: "ghost danger", onclick: () => { if (confirm("Erase ALL data?")) { localStorage.removeItem(STORE_KEY); state = defaultState(); regeneratePlan(); save(); render(); } } }, "Reset All Data"),
    ]),
    el("div", { class: "card muted small" }, BRAND + " is general training information, not medical advice. Train at your own risk."),
  ]);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = el("a", { href: URL.createObjectURL(blob), download: "sportstrength-backup-" + todayISO() + ".json" });
  document.body.appendChild(a); a.click(); a.remove();
  sessionsSinceBackup = 0;
}
function importData(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      if (!data || !Array.isArray(data.sessions)) throw 0;
      state = data.schemaVersion === SCHEMA_VERSION ? data : migrate(data);
      regeneratePlan(); save(); alert("Backup imported."); render();
    } catch (_) { alert("Could not import: invalid backup file."); }
  };
  r.readAsText(f);
}

// ---------------- Minimal canvas charts ----------------
function chartBase(canvas) {
  const ctx = canvas.getContext && canvas.getContext("2d");
  if (!ctx) return null;
  const W = canvas.width, H = canvas.height, pad = 40;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = "#3a3f46"; ctx.fillStyle = "#9a958b"; ctx.font = "12px system-ui";
  ctx.beginPath(); ctx.moveTo(pad, 10); ctx.lineTo(pad, H - pad); ctx.lineTo(W - 10, H - pad); ctx.stroke();
  return { ctx, W, H, pad };
}
function drawLineChart(canvas, pts) {
  const b = chartBase(canvas); if (!b) return;
  const { ctx, W, H, pad } = b;
  if (!pts.length) { ctx.fillText("No data", W / 2 - 20, H / 2); return; }
  const max = Math.max(...pts.map((p) => p.value)) * 1.1 || 1;
  const x = (i) => pad + (i * (W - pad - 20)) / Math.max(1, pts.length - 1);
  const y = (v) => H - pad - (v / max) * (H - pad - 15);
  ctx.fillText(Math.round(max), 4, y(max) + 4); ctx.fillText("0", 24, H - pad + 4);
  ctx.strokeStyle = "#F2820D"; ctx.lineWidth = 2; ctx.beginPath();
  pts.forEach((p, i) => { i ? ctx.lineTo(x(i), y(p.value)) : ctx.moveTo(x(i), y(p.value)); });
  ctx.stroke(); ctx.fillStyle = "#F2820D";
  pts.forEach((p, i) => { ctx.beginPath(); ctx.arc(x(i), y(p.value), 3, 0, 7); ctx.fill(); });
  ctx.fillStyle = "#9a958b";
  pts.forEach((p, i) => { if (i % Math.ceil(pts.length / 6 || 1) === 0) ctx.fillText(p.label, x(i) - 12, H - pad + 16); });
}
function drawGroupedBars(canvas, labels, a, c, la, lb) {
  const b = chartBase(canvas); if (!b) return;
  const { ctx, W, H, pad } = b;
  if (!labels.length) { ctx.fillText("No data", W / 2 - 20, H / 2); return; }
  const max = Math.max(1, ...a, ...c) * 1.1;
  const slot = (W - pad - 20) / labels.length, bw = slot * 0.35;
  ctx.fillText(Math.round(max), 2, 16);
  labels.forEach((lab, i) => {
    const x0 = pad + i * slot + slot * 0.1;
    const ha = (a[i] / max) * (H - pad - 15), hb = (c[i] / max) * (H - pad - 15);
    ctx.fillStyle = "#F2820D"; ctx.fillRect(x0, H - pad - ha, bw, ha);
    ctx.fillStyle = "#5b9bd5"; ctx.fillRect(x0 + bw + 3, H - pad - hb, bw, hb);
    ctx.fillStyle = "#9a958b"; ctx.fillText(lab, x0, H - pad + 14);
  });
  ctx.fillStyle = "#F2820D"; ctx.fillRect(pad, 6, 10, 10); ctx.fillStyle = "#9a958b"; ctx.fillText(la, pad + 14, 15);
  ctx.fillStyle = "#5b9bd5"; ctx.fillRect(pad + 60, 6, 10, 10); ctx.fillStyle = "#9a958b"; ctx.fillText(lb, pad + 74, 15);
}

// ---------------- Boot ----------------
if ("serviceWorker" in navigator)
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {}));
render();
