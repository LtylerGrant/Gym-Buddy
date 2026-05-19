// Gym-Buddy built-in data: exercise library + blended plan template.
// General training information only — NOT medical or coaching advice.

const EXERCISES = [
  // ---- Power / explosive ----
  { id: "box-jump", name: "Box Jump", category: "plyo", primaryMuscles: ["quads", "glutes"], tags: ["power", "lower"], unilateral: false, isCustom: false },
  { id: "jump-squat", name: "Jump Squat (light)", category: "plyo", primaryMuscles: ["quads", "glutes"], tags: ["power", "lower"], unilateral: false, isCustom: false },
  { id: "broad-jump", name: "Broad Jump", category: "plyo", primaryMuscles: ["glutes", "hamstrings"], tags: ["power", "lower"], unilateral: false, isCustom: false },
  { id: "single-leg-bound", name: "Single-Leg Bound", category: "plyo", primaryMuscles: ["glutes", "calves"], tags: ["power", "lower"], unilateral: true, isCustom: false },
  { id: "lateral-skater-bound", name: "Lateral Skater Bound", category: "plyo", primaryMuscles: ["glutes", "adductors"], tags: ["power", "lower", "lateral"], unilateral: true, isCustom: false },
  { id: "depth-jump", name: "Depth Jump", category: "plyo", primaryMuscles: ["quads", "calves"], tags: ["power", "lower", "advanced"], unilateral: false, isCustom: false },
  { id: "mb-rotational-throw", name: "Med-Ball Rotational Throw", category: "plyo", primaryMuscles: ["obliques", "core"], tags: ["power", "rotational"], unilateral: true, isCustom: false },
  { id: "plyo-pushup", name: "Plyo Push-up", category: "plyo", primaryMuscles: ["chest", "triceps"], tags: ["power", "push"], unilateral: false, isCustom: false },
  { id: "hang-power-clean", name: "Hang Power Clean", category: "olympic", primaryMuscles: ["posterior-chain"], tags: ["power", "full"], unilateral: false, isCustom: false },
  { id: "kb-swing", name: "Kettlebell Swing", category: "compound", primaryMuscles: ["glutes", "hamstrings"], tags: ["power", "full"], unilateral: false, isCustom: false },
  { id: "explosive-pullup", name: "Explosive Pull-up", category: "compound", primaryMuscles: ["lats", "biceps"], tags: ["power", "pull"], unilateral: false, isCustom: false },

  // ---- Strength / hypertrophy compounds ----
  { id: "back-squat", name: "Back Squat", category: "compound", primaryMuscles: ["quads", "glutes"], tags: ["power", "hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "front-squat", name: "Front Squat", category: "compound", primaryMuscles: ["quads", "core"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "rdl", name: "Romanian Deadlift", category: "compound", primaryMuscles: ["hamstrings", "glutes"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "bench-press", name: "Bench Press", category: "compound", primaryMuscles: ["chest", "triceps"], tags: ["power", "hypertrophy", "push"], unilateral: false, isCustom: false },
  { id: "ohp", name: "Overhead Press", category: "compound", primaryMuscles: ["shoulders", "triceps"], tags: ["hypertrophy", "push"], unilateral: false, isCustom: false },
  { id: "barbell-row", name: "Barbell Row", category: "compound", primaryMuscles: ["lats", "upper-back"], tags: ["hypertrophy", "pull"], unilateral: false, isCustom: false },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", category: "compound", primaryMuscles: ["quads", "glutes"], tags: ["hypertrophy", "lower"], unilateral: true, isCustom: false },

  // ---- Accessories / isolation ----
  { id: "incline-db-press", name: "Incline DB Press", category: "compound", primaryMuscles: ["chest"], tags: ["hypertrophy", "push"], unilateral: false, isCustom: false },
  { id: "leg-press", name: "Leg Press", category: "machine", primaryMuscles: ["quads"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "leg-curl", name: "Leg Curl", category: "machine", primaryMuscles: ["hamstrings"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "leg-extension", name: "Leg Extension", category: "machine", primaryMuscles: ["quads"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "calf-raise", name: "Standing Calf Raise", category: "machine", primaryMuscles: ["calves"], tags: ["hypertrophy", "lower"], unilateral: false, isCustom: false },
  { id: "chest-supported-row", name: "Chest-Supported Row", category: "machine", primaryMuscles: ["upper-back"], tags: ["hypertrophy", "pull"], unilateral: false, isCustom: false },
  { id: "lateral-raise", name: "Lateral Raise", category: "isolation", primaryMuscles: ["shoulders"], tags: ["hypertrophy", "push"], unilateral: false, isCustom: false },
  { id: "triceps-pushdown", name: "Triceps Pushdown", category: "isolation", primaryMuscles: ["triceps"], tags: ["hypertrophy", "push"], unilateral: false, isCustom: false },
  { id: "barbell-curl", name: "Barbell Curl", category: "isolation", primaryMuscles: ["biceps"], tags: ["hypertrophy", "pull"], unilateral: false, isCustom: false },
  { id: "face-pull", name: "Face Pull", category: "isolation", primaryMuscles: ["rear-delts"], tags: ["hypertrophy", "pull"], unilateral: false, isCustom: false },
  { id: "pallof-press", name: "Pallof Press", category: "isolation", primaryMuscles: ["core"], tags: ["hypertrophy", "core", "rotational"], unilateral: true, isCustom: false },
];

// Each block: exerciseId, phase (power|hypertrophy), priority (1 protect..4 drop first),
// scheme {sets, reps, restSec, note}. repRange present on hypertrophy for overload hints.
const BLENDED_PLAN = {
  id: "tennis-leanbulk",
  name: "Tennis Power + Lean Bulk",
  focus: "blended",
  builtIn: true,
  days: [
    {
      dayId: "d1",
      name: "Day 1 — Lower: Power + Hypertrophy",
      role: "lower",
      blocks: [
        { exerciseId: "box-jump", phase: "power", priority: 1, scheme: { sets: 5, reps: 3, restSec: 120, note: "Max intent, full rest" } },
        { exerciseId: "jump-squat", phase: "power", priority: 2, scheme: { sets: 4, reps: 3, restSec: 90, note: "~30% 1RM, explosive" } },
        { exerciseId: "back-squat", phase: "power", priority: 2, scheme: { sets: 4, reps: 3, restSec: 150, note: "~80% 1RM, accelerate up" } },
        { exerciseId: "rdl", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 9, repRange: [8, 10], restSec: 90 } },
        { exerciseId: "leg-press", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 11, repRange: [10, 12], restSec: 75 } },
        { exerciseId: "leg-curl", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 12, repRange: [10, 12], restSec: 60 } },
        { exerciseId: "calf-raise", phase: "hypertrophy", priority: 4, scheme: { sets: 4, reps: 13, repRange: [12, 15], restSec: 45 } },
      ],
    },
    {
      dayId: "d2",
      name: "Day 2 — Upper Push: Power + Hypertrophy",
      role: "push",
      blocks: [
        { exerciseId: "mb-rotational-throw", phase: "power", priority: 1, scheme: { sets: 5, reps: 4, restSec: 90, note: "Per side, tennis transfer" } },
        { exerciseId: "plyo-pushup", phase: "power", priority: 2, scheme: { sets: 5, reps: 4, restSec: 90 } },
        { exerciseId: "bench-press", phase: "power", priority: 2, scheme: { sets: 4, reps: 3, restSec: 150, note: "~80% 1RM, explosive" } },
        { exerciseId: "incline-db-press", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 9, repRange: [8, 10], restSec: 90 } },
        { exerciseId: "ohp", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 9, repRange: [8, 10], restSec: 90 } },
        { exerciseId: "lateral-raise", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 13, repRange: [12, 15], restSec: 45 } },
        { exerciseId: "triceps-pushdown", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 11, repRange: [10, 12], restSec: 45 } },
      ],
    },
    {
      dayId: "d3",
      name: "Day 3 — Full-Body Speed + Pull Hypertrophy",
      role: "pull",
      blocks: [
        { exerciseId: "hang-power-clean", phase: "power", priority: 1, scheme: { sets: 5, reps: 3, restSec: 150, note: "Or KB Swing if no barbell" } },
        { exerciseId: "lateral-skater-bound", phase: "power", priority: 2, scheme: { sets: 3, reps: 6, restSec: 90, note: "Per side, court lateral power" } },
        { exerciseId: "explosive-pullup", phase: "power", priority: 2, scheme: { sets: 4, reps: 4, restSec: 120 } },
        { exerciseId: "barbell-row", phase: "hypertrophy", priority: 3, scheme: { sets: 4, reps: 9, repRange: [8, 10], restSec: 90 } },
        { exerciseId: "chest-supported-row", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 11, repRange: [10, 12], restSec: 75 } },
        { exerciseId: "face-pull", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 15, repRange: [12, 15], restSec: 45 } },
        { exerciseId: "barbell-curl", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 11, repRange: [10, 12], restSec: 45 } },
      ],
    },
    {
      dayId: "d4",
      name: "Day 4 — Lower/Core + Power Maintenance",
      role: "lower",
      blocks: [
        { exerciseId: "broad-jump", phase: "power", priority: 1, scheme: { sets: 4, reps: 3, restSec: 120 } },
        { exerciseId: "single-leg-bound", phase: "power", priority: 2, scheme: { sets: 4, reps: 4, restSec: 90, note: "Per side" } },
        { exerciseId: "front-squat", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 9, repRange: [8, 10], restSec: 120 } },
        { exerciseId: "bulgarian-split-squat", phase: "hypertrophy", priority: 3, scheme: { sets: 3, reps: 10, repRange: [8, 12], restSec: 75, note: "Per side" } },
        { exerciseId: "leg-extension", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 13, repRange: [12, 15], restSec: 45 } },
        { exerciseId: "pallof-press", phase: "hypertrophy", priority: 4, scheme: { sets: 3, reps: 10, restSec: 45, note: "Per side, anti-rotation" } },
      ],
    },
  ],
};

// Day-split presets keyed by daysPerWeek. Values are dayIds from BLENDED_PLAN.
// 2-day merges into full-body; lower numbers prioritise the most transferable work.
const DAY_SPLITS = {
  2: ["d1", "d2"],            // full-body-ish: lower power+hyp, push power+hyp
  3: ["d1", "d2", "d3"],
  4: ["d1", "d2", "d3", "d4"],
  5: ["d1", "d2", "d3", "d4", "d1"],
  6: ["d1", "d2", "d3", "d4", "d1", "d3"],
};
