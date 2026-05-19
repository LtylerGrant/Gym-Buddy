"use strict";
// Sport Strength data: exercise library, sports, goals, and plan generator.
// General training information only — NOT medical or coaching advice.

// equip groups: free | cable | machine | kbmp (kettlebell/medball/plyo) | bw (always available)
// patterns: squat hinge lunge hpush vpush hpull vpull rotation antirotation
//           jump sprint carry calf core conditioning
const LIB = [
  // ---- Squat ----
  { id: "back-squat", name: "Back Squat", equip: "free", patterns: ["squat"], power: false, cue: "Bar on traps, brace, sit between hips, drive through midfoot." },
  { id: "front-squat", name: "Front Squat", equip: "free", patterns: ["squat"], power: false, cue: "Elbows high, upright torso, full-depth, knees track toes." },
  { id: "jump-squat", name: "Jump Squat (light)", equip: "kbmp", patterns: ["squat", "jump"], power: true, cue: "~30% load, dip quick, explode up, land soft." },
  { id: "goblet-squat", name: "Goblet Squat", equip: "free", patterns: ["squat"], power: false, cue: "Hold DB/KB at chest, sit tall, elbows inside knees." },
  { id: "leg-press", name: "Leg Press", equip: "machine", patterns: ["squat"], power: false, cue: "Feet shoulder-width, control down, don't lock knees hard." },
  { id: "bw-squat", name: "Bodyweight Squat", equip: "bw", patterns: ["squat"], power: false, cue: "Full depth, chest up, controlled tempo." },

  // ---- Hinge ----
  { id: "deadlift", name: "Deadlift", equip: "free", patterns: ["hinge"], power: false, cue: "Bar over midfoot, flat back, push floor away, lock hips." },
  { id: "rdl", name: "Romanian Deadlift", equip: "free", patterns: ["hinge"], power: false, cue: "Soft knees, hips back, bar close, feel hamstrings, neutral spine." },
  { id: "hip-thrust", name: "Hip Thrust", equip: "free", patterns: ["hinge"], power: false, cue: "Shoulders on bench, chin tucked, drive hips, squeeze glutes." },
  { id: "kb-swing", name: "Kettlebell Swing", equip: "kbmp", patterns: ["hinge"], power: true, cue: "Hike, snap hips hard, float to chest height, brace core." },
  { id: "cable-pullthrough", name: "Cable Pull-Through", equip: "cable", patterns: ["hinge"], power: false, cue: "Face away from stack, hinge back, snap hips to stand tall." },
  { id: "hamstring-curl", name: "Lying/Seated Leg Curl", equip: "machine", patterns: ["hinge"], power: false, cue: "Control eccentric, full range, no hip cheat." },
  { id: "single-leg-rdl", name: "Single-Leg RDL", equip: "bw", patterns: ["hinge", "lunge"], power: false, cue: "Hinge on one leg, hips square, slow control, balance." },

  // ---- Lunge / single-leg ----
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", equip: "free", patterns: ["lunge"], power: false, cue: "Rear foot elevated, vertical shin front, drive front heel." },
  { id: "walking-lunge", name: "Walking Lunge", equip: "free", patterns: ["lunge"], power: false, cue: "Long step, both knees ~90°, torso tall, push to next." },
  { id: "step-up", name: "Box Step-Up", equip: "free", patterns: ["lunge"], power: false, cue: "Knee-height box, drive through top leg, minimal push-off." },
  { id: "reverse-lunge-bw", name: "Reverse Lunge", equip: "bw", patterns: ["lunge"], power: false, cue: "Step back, drop rear knee, drive front heel to stand." },
  { id: "skater-bound", name: "Lateral Skater Bound", equip: "kbmp", patterns: ["lunge", "jump"], power: true, cue: "Push laterally, stick the landing on outside leg, repeat." },

  // ---- Horizontal push ----
  { id: "bench-press", name: "Bench Press", equip: "free", patterns: ["hpush"], power: false, cue: "Shoulder blades pinned, bar to lower chest, drive feet." },
  { id: "incline-db-press", name: "Incline DB Press", equip: "free", patterns: ["hpush"], power: false, cue: "30–45° bench, press up and slightly in, control down." },
  { id: "cable-chest-press", name: "Cable Chest Press", equip: "cable", patterns: ["hpush"], power: false, cue: "Split stance, press through chest, slight forward lean." },
  { id: "machine-chest-press", name: "Machine Chest Press", equip: "machine", patterns: ["hpush"], power: false, cue: "Handles at mid-chest, full press, controlled return." },
  { id: "plyo-pushup", name: "Plyo Push-up", equip: "bw", patterns: ["hpush"], power: true, cue: "Explode hands off floor, land soft, reset each rep." },
  { id: "pushup", name: "Push-up", equip: "bw", patterns: ["hpush"], power: false, cue: "Rigid plank, elbows ~45°, chest to floor, full lockout." },

  // ---- Vertical push ----
  { id: "ohp", name: "Overhead Press", equip: "free", patterns: ["vpush"], power: false, cue: "Brace ribs down, press bar to overhead, head through." },
  { id: "db-shoulder-press", name: "DB Shoulder Press", equip: "free", patterns: ["vpush"], power: false, cue: "Neutral wrists, press to lockout, no excess arch." },
  { id: "push-press", name: "Push Press", equip: "free", patterns: ["vpush"], power: true, cue: "Short dip, drive legs, accelerate bar overhead." },
  { id: "machine-shoulder-press", name: "Machine Shoulder Press", equip: "machine", patterns: ["vpush"], power: false, cue: "Handles at ear height, press up, control down." },
  { id: "pike-pushup", name: "Pike Push-up", equip: "bw", patterns: ["vpush"], power: false, cue: "Hips high, head between hands, press up vertically." },

  // ---- Horizontal pull ----
  { id: "barbell-row", name: "Barbell Row", equip: "free", patterns: ["hpull"], power: false, cue: "Hinge ~45°, pull to lower ribs, squeeze, no jerk." },
  { id: "db-row", name: "1-Arm DB Row", equip: "free", patterns: ["hpull"], power: false, cue: "Flat back, drive elbow to hip, full stretch." },
  { id: "seated-cable-row", name: "Seated Cable Row", equip: "cable", patterns: ["hpull"], power: false, cue: "Tall chest, pull to navel, shoulders down/back." },
  { id: "chest-supported-row", name: "Chest-Supported Row", equip: "machine", patterns: ["hpull"], power: false, cue: "Pad on chest, row to ribs, pause, control." },
  { id: "inverted-row", name: "Inverted Row", equip: "bw", patterns: ["hpull"], power: false, cue: "Body rigid, pull chest to bar, full hang stretch." },

  // ---- Vertical pull ----
  { id: "pullup", name: "Pull-up", equip: "bw", patterns: ["vpull"], power: false, cue: "Full hang, drive elbows down, chin over bar." },
  { id: "explosive-pullup", name: "Explosive Pull-up", equip: "bw", patterns: ["vpull"], power: true, cue: "Pull as fast as possible, control the descent." },
  { id: "lat-pulldown", name: "Lat Pulldown", equip: "cable", patterns: ["vpull"], power: false, cue: "Slight lean back, bar to upper chest, lats lead." },
  { id: "assisted-pullup", name: "Assisted Pull-up", equip: "machine", patterns: ["vpull"], power: false, cue: "Full range, drive elbows down, slow lower." },

  // ---- Rotation / power-transfer ----
  { id: "mb-rotational-throw", name: "Med-Ball Rotational Throw", equip: "kbmp", patterns: ["rotation"], power: true, sports: ["tennis", "golf", "baseball", "softball"], cue: "Load back hip, explosively rotate, throw through the wall." },
  { id: "mb-scoop-toss", name: "Med-Ball Side Scoop Toss", equip: "kbmp", patterns: ["rotation"], power: true, sports: ["golf", "baseball", "softball"], cue: "Athletic stance, scoop low to high, full hip turn." },
  { id: "cable-woodchop", name: "Cable Woodchop", equip: "cable", patterns: ["rotation"], power: false, sports: ["tennis", "golf", "baseball"], cue: "Pivot back foot, rotate through hips/core, arms follow." },
  { id: "landmine-rotation", name: "Landmine Rotation", equip: "free", patterns: ["rotation"], power: false, sports: ["tennis", "golf", "baseball"], cue: "Arms long, sweep bar hip to hip with trunk rotation." },
  { id: "russian-twist", name: "Russian Twist", equip: "bw", patterns: ["rotation"], power: false, cue: "Tall spine, rotate from ribs, controlled, feet light." },

  // ---- Anti-rotation / core ----
  { id: "pallof-press", name: "Pallof Press", equip: "cable", patterns: ["antirotation", "core"], power: false, cue: "Resist the twist, press straight out, brace hard." },
  { id: "plank", name: "Front/Side Plank", equip: "bw", patterns: ["antirotation", "core"], power: false, cue: "Glutes/abs tight, straight line, breathe, no sag." },
  { id: "deadbug", name: "Dead Bug", equip: "bw", patterns: ["core"], power: false, cue: "Low back glued down, slow opposite arm/leg." },
  { id: "hanging-knee-raise", name: "Hanging Knee Raise", equip: "bw", patterns: ["core"], power: false, cue: "No swing, curl pelvis up, control down." },

  // ---- Jump / plyo ----
  { id: "box-jump", name: "Box Jump", equip: "kbmp", patterns: ["jump"], power: true, sports: ["basketball", "tennis"], cue: "Max-intent jump, soft quiet landing, step down (don't bounce)." },
  { id: "broad-jump", name: "Broad Jump", equip: "bw", patterns: ["jump"], power: true, sports: ["basketball", "soccer"], cue: "Big arm swing, jump far, stick the landing." },
  { id: "depth-jump", name: "Depth Jump", equip: "kbmp", patterns: ["jump"], power: true, sports: ["basketball"], cue: "ADVANCED. Drop off low box, minimal ground time, jump up." },
  { id: "pogo-hops", name: "Pogo Hops", equip: "bw", patterns: ["jump", "calf"], power: true, cue: "Stiff ankles, fast repeated hops, minimal knee bend." },

  // ---- Sprint / speed ----
  { id: "accel-sprint", name: "Acceleration Sprint (20m)", equip: "bw", patterns: ["sprint"], power: true, sports: ["soccer", "baseball", "softball", "basketball", "tennis"], cue: "Aggressive arm drive, lean, push the ground back." },
  { id: "tempo-run", name: "Tempo Run Intervals", equip: "bw", patterns: ["sprint", "conditioning"], power: false, sports: ["soccer", "xc"], cue: "~70–80% pace, relaxed form, controlled breathing." },
  { id: "shuttle-run", name: "Shuttle / 5-10-5", equip: "bw", patterns: ["sprint"], power: true, sports: ["tennis", "basketball", "soccer"], cue: "Low hips on cuts, plant hard, explode the change of direction." },

  // ---- Carry / calf / conditioning ----
  { id: "farmer-carry", name: "Farmer Carry", equip: "free", patterns: ["carry", "core"], power: false, cue: "Tall posture, ribs down, brace, walk controlled." },
  { id: "standing-calf-raise", name: "Standing Calf Raise", equip: "machine", patterns: ["calf"], power: false, cue: "Full stretch to full plantarflexion, pause top." },
  { id: "bw-calf-raise", name: "Bodyweight Calf Raise", equip: "bw", patterns: ["calf"], power: false, cue: "Full range, slow, single-leg if too easy." },
  { id: "bike-intervals", name: "Bike / Row Intervals", equip: "machine", patterns: ["conditioning"], power: false, cue: "Hard work bouts, easy recovery, keep form crisp." },
  { id: "burpee", name: "Burpee", equip: "bw", patterns: ["conditioning"], power: false, cue: "Smooth chest-to-floor, snap up, jump tall." },
];

const SPORTS = [
  { id: "tennis", name: "Tennis", signature: ["rotation", "jump", "sprint"] },
  { id: "baseball", name: "Baseball", signature: ["rotation", "sprint", "jump"] },
  { id: "softball", name: "Softball", signature: ["rotation", "sprint", "jump"] },
  { id: "basketball", name: "Basketball", signature: ["jump", "sprint", "lunge"] },
  { id: "soccer", name: "Soccer", signature: ["sprint", "lunge", "conditioning"] },
  { id: "xc", name: "Cross Country", signature: ["conditioning", "lunge", "hinge"] },
  { id: "golf", name: "Golf", signature: ["rotation", "antirotation", "hinge"] },
  { id: "general", name: "General Athlete", signature: ["jump", "rotation", "sprint"] },
];

const EQUIPMENT = [
  { id: "free", name: "Free weights (barbell/DB)" },
  { id: "cable", name: "Cable machines" },
  { id: "machine", name: "Selectorized machines" },
  { id: "kbmp", name: "Kettlebell / Med ball / Plyo" },
];

// Slot.want: "sport" (resolved from sport.signature) or a pattern token.
// phase power|hypertrophy|strength|conditioning. priority 1 (protect) .. 4 (drop first).
const GOALS = [
  {
    id: "power", name: "Explosive Power & Speed",
    days: [
      { role: "Lower Power", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 5, reps: 3, restSec: 120 },
        { want: "squat", phase: "power", priority: 2, sets: 4, reps: 3, restSec: 150, note: "Accelerate the way up" },
        { want: "hinge", phase: "strength", priority: 3, sets: 3, reps: 5, restSec: 120 },
        { want: "lunge", phase: "accessory", priority: 3, sets: 3, reps: 8, restSec: 75 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 12, restSec: 45 } ] },
      { role: "Upper Power", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 5, reps: 4, restSec: 120 },
        { want: "hpush", phase: "power", priority: 2, sets: 4, reps: 3, restSec: 150 },
        { want: "vpull", phase: "power", priority: 2, sets: 4, reps: 4, restSec: 120 },
        { want: "hpull", phase: "strength", priority: 3, sets: 3, reps: 6, restSec: 90 },
        { want: "antirotation", phase: "accessory", priority: 4, sets: 3, reps: 10, restSec: 45 } ] },
      { role: "Speed & Plyo", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 6, reps: 3, restSec: 120 },
        { want: "jump", phase: "power", priority: 2, sets: 4, reps: 3, restSec: 120 },
        { want: "lunge", phase: "strength", priority: 3, sets: 3, reps: 6, restSec: 90 },
        { want: "conditioning", phase: "conditioning", priority: 3, sets: 4, reps: 1, restSec: 90, note: "~20–30s hard efforts" },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 12, restSec: 45 } ] },
      { role: "Total-Body Power", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 5, reps: 3, restSec: 120 },
        { want: "hinge", phase: "power", priority: 2, sets: 5, reps: 3, restSec: 150 },
        { want: "vpush", phase: "power", priority: 2, sets: 4, reps: 3, restSec: 120 },
        { want: "squat", phase: "strength", priority: 3, sets: 3, reps: 5, restSec: 120 },
        { want: "carry", phase: "accessory", priority: 4, sets: 3, reps: 1, restSec: 60, note: "~30–40m" } ] },
    ],
  },
  {
    id: "leanbulk", name: "Lean Bulk / Hypertrophy",
    days: [
      { role: "Lower", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 3, restSec: 120 },
        { want: "squat", phase: "hypertrophy", priority: 2, sets: 4, reps: 7, repRange: [6, 8], restSec: 120 },
        { want: "hinge", phase: "hypertrophy", priority: 3, sets: 3, reps: 9, repRange: [8, 10], restSec: 90 },
        { want: "lunge", phase: "hypertrophy", priority: 3, sets: 3, reps: 11, repRange: [10, 12], restSec: 75 },
        { want: "calf", phase: "accessory", priority: 4, sets: 4, reps: 13, repRange: [12, 15], restSec: 45 } ] },
      { role: "Push", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 4, restSec: 120 },
        { want: "hpush", phase: "hypertrophy", priority: 2, sets: 4, reps: 7, repRange: [6, 8], restSec: 120 },
        { want: "vpush", phase: "hypertrophy", priority: 3, sets: 3, reps: 9, repRange: [8, 10], restSec: 90 },
        { want: "hpush", phase: "hypertrophy", priority: 3, sets: 3, reps: 11, repRange: [10, 12], restSec: 60 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 12, restSec: 45 } ] },
      { role: "Pull", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 4, restSec: 120 },
        { want: "vpull", phase: "hypertrophy", priority: 2, sets: 4, reps: 7, repRange: [6, 8], restSec: 120 },
        { want: "hpull", phase: "hypertrophy", priority: 3, sets: 4, reps: 9, repRange: [8, 10], restSec: 90 },
        { want: "hpull", phase: "hypertrophy", priority: 3, sets: 3, reps: 11, repRange: [10, 12], restSec: 60 },
        { want: "rotation", phase: "accessory", priority: 4, sets: 3, reps: 12, restSec: 45 } ] },
      { role: "Lower & Core", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 3, restSec: 120 },
        { want: "squat", phase: "hypertrophy", priority: 2, sets: 3, reps: 9, repRange: [8, 10], restSec: 120 },
        { want: "lunge", phase: "hypertrophy", priority: 3, sets: 3, reps: 10, repRange: [8, 12], restSec: 75 },
        { want: "hinge", phase: "hypertrophy", priority: 3, sets: 3, reps: 11, repRange: [10, 12], restSec: 75 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 14, restSec: 45 } ] },
    ],
  },
  {
    id: "strength", name: "Max Strength",
    days: [
      { role: "Squat Focus", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 3, restSec: 120 },
        { want: "squat", phase: "strength", priority: 2, sets: 5, reps: 4, repRange: [3, 5], restSec: 180 },
        { want: "hinge", phase: "strength", priority: 3, sets: 3, reps: 5, restSec: 150 },
        { want: "lunge", phase: "accessory", priority: 3, sets: 3, reps: 6, restSec: 90 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 10, restSec: 60 } ] },
      { role: "Bench Focus", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 4, restSec: 120 },
        { want: "hpush", phase: "strength", priority: 2, sets: 5, reps: 4, repRange: [3, 5], restSec: 180 },
        { want: "vpull", phase: "strength", priority: 3, sets: 4, reps: 5, restSec: 120 },
        { want: "hpush", phase: "accessory", priority: 3, sets: 3, reps: 6, restSec: 90 },
        { want: "antirotation", phase: "accessory", priority: 4, sets: 3, reps: 10, restSec: 45 } ] },
      { role: "Deadlift Focus", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 3, restSec: 120 },
        { want: "hinge", phase: "strength", priority: 2, sets: 5, reps: 3, restSec: 210 },
        { want: "squat", phase: "strength", priority: 3, sets: 3, reps: 5, restSec: 150 },
        { want: "hpull", phase: "accessory", priority: 3, sets: 4, reps: 6, restSec: 90 },
        { want: "carry", phase: "accessory", priority: 4, sets: 3, reps: 1, restSec: 75, note: "Heavy ~30m" } ] },
      { role: "Press Focus", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 4, restSec: 120 },
        { want: "vpush", phase: "strength", priority: 2, sets: 5, reps: 4, repRange: [3, 5], restSec: 180 },
        { want: "hpull", phase: "strength", priority: 3, sets: 4, reps: 5, restSec: 120 },
        { want: "vpull", phase: "accessory", priority: 3, sets: 3, reps: 6, restSec: 90 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 10, restSec: 60 } ] },
    ],
  },
  {
    id: "endurance", name: "Endurance & Durability",
    days: [
      { role: "Full-Body Circuit", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 3, reps: 4, restSec: 90 },
        { want: "squat", phase: "conditioning", priority: 2, sets: 3, reps: 15, restSec: 45 },
        { want: "hpush", phase: "conditioning", priority: 2, sets: 3, reps: 15, restSec: 45 },
        { want: "hpull", phase: "conditioning", priority: 3, sets: 3, reps: 15, restSec: 45 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 20, restSec: 30 } ] },
      { role: "Conditioning", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 4, reps: 3, restSec: 90 },
        { want: "conditioning", phase: "conditioning", priority: 2, sets: 6, reps: 1, restSec: 60, note: "Intervals: hard / easy" },
        { want: "lunge", phase: "conditioning", priority: 3, sets: 3, reps: 12, restSec: 45 },
        { want: "hinge", phase: "conditioning", priority: 3, sets: 3, reps: 12, restSec: 45 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 18, restSec: 30 } ] },
      { role: "Durability / Prehab", slots: [
        { want: "lunge", phase: "accessory", priority: 2, sets: 3, reps: 12, restSec: 45 },
        { want: "antirotation", phase: "accessory", priority: 2, sets: 3, reps: 12, restSec: 45 },
        { want: "vpull", phase: "accessory", priority: 3, sets: 3, reps: 12, restSec: 45 },
        { want: "calf", phase: "accessory", priority: 3, sets: 3, reps: 20, restSec: 30 },
        { want: "core", phase: "accessory", priority: 4, sets: 3, reps: 20, restSec: 30 } ] },
      { role: "Mixed", slots: [
        { want: "sport", phase: "power", priority: 1, sets: 3, reps: 4, restSec: 90 },
        { want: "hinge", phase: "conditioning", priority: 2, sets: 3, reps: 12, restSec: 45 },
        { want: "hpush", phase: "conditioning", priority: 2, sets: 3, reps: 12, restSec: 45 },
        { want: "lunge", phase: "conditioning", priority: 3, sets: 3, reps: 12, restSec: 45 },
        { want: "conditioning", phase: "conditioning", priority: 3, sets: 4, reps: 1, restSec: 60, note: "Finisher intervals" } ] },
    ],
  },
];

function videoUrl(name) {
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercise proper form");
}
const exMeta = (id) => LIB.find((e) => e.id === id);

// Light age scaling: volume multiplier on non-priority-1 sets.
function ageVolumeFactor(age) {
  if (!age) return 1;
  if (age < 18) return 1;
  if (age < 35) return 1;
  if (age < 45) return 0.9;
  if (age < 55) return 0.85;
  return 0.75;
}

// Rough starting-load anchors as a fraction of bodyweight (very approximate).
const LOAD_ANCHOR = { squat: 0.75, hinge: 1.0, hpush: 0.5, vpush: 0.4, hpull: 0.5, vpull: 0 };
function startingLoadHint(patterns, bodyweight) {
  if (!bodyweight) return null;
  for (const p of patterns) {
    if (LOAD_ANCHOR[p] != null && LOAD_ANCHOR[p] > 0) {
      return Math.round((bodyweight * LOAD_ANCHOR[p]) / 5) * 5;
    }
  }
  return null;
}

// Deterministic exercise pick for a slot, biased to sport + filtered by equipment.
function pickExercise(want, sport, availSet, phase, dayIdx, used) {
  let pats;
  if (want === "sport") pats = sport.signature;
  else pats = [want];

  const ok = (e) =>
    (e.equip === "bw" || availSet.has(e.equip)) &&
    e.patterns.some((p) => pats.includes(p)) &&
    !used.has(e.id);

  let cands = LIB.filter(ok);
  if (!cands.length) {
    // fall back to bodyweight-only for this pattern, ignoring "used"
    cands = LIB.filter((e) => e.equip === "bw" && e.patterns.some((p) => pats.includes(p)));
  }
  if (!cands.length) return null;

  const score = (e) => {
    let s = 0;
    if (e.sports && e.sports.includes(sport.id)) s += 4;
    if (phase === "power" && e.power) s += 3;
    if (phase !== "power" && !e.power) s += 1;
    // honor signature order for the sport slot
    if (want === "sport") {
      const idx = pats.findIndex((p) => e.patterns.includes(p));
      s += (pats.length - idx);
    }
    return s;
  };
  cands.sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id));
  // rotate among the top picks across days for variety
  const top = cands.filter((c) => score(c) === score(cands[0]));
  return top[dayIdx % top.length] || cands[0];
}

// Build a full plan object from the user profile.
function buildPlan(profile) {
  const sport = SPORTS.find((s) => s.id === profile.sport) || SPORTS[SPORTS.length - 1];
  const goal = GOALS.find((g) => g.id === profile.goal) || GOALS[0];
  const availSet = new Set(profile.equipment && profile.equipment.length ? profile.equipment : ["free"]);
  const vf = ageVolumeFactor(profile.age);

  const days = goal.days.map((d, di) => {
    const used = new Set();
    const blocks = [];
    d.slots.forEach((slot) => {
      const ex = pickExercise(slot.want, sport, availSet, slot.phase, di, used);
      if (!ex) return;
      used.add(ex.id);
      let sets = slot.sets;
      if (slot.priority > 1) sets = Math.max(2, Math.round(sets * vf));
      const phase = slot.phase === "power" ? "power" : (slot.phase === "hypertrophy" ? "hypertrophy" : slot.phase);
      blocks.push({
        exerciseId: ex.id,
        phase: slot.phase === "power" ? "power" : "hypertrophy", // scheduler groups on these two
        trainType: slot.phase,
        priority: slot.priority,
        scheme: { sets, reps: slot.reps, repRange: slot.repRange || null, restSec: slot.restSec, note: slot.note || null },
      });
    });
    return { dayId: "d" + (di + 1), name: "Day " + (di + 1) + " — " + d.role, role: d.role, blocks };
  });

  return {
    id: "gen",
    name: sport.name + " · " + goal.name,
    sport: sport.id,
    goal: goal.id,
    builtIn: true,
    days,
  };
}
