# Sport Strength

A rugged, offline-first training app (installable PWA) that builds a
**sport-specific strength & power program** tailored to you, then logs your
workouts on your phone. No backend, no build step, no dependencies — just
static files.

> **Disclaimer:** Sport Strength provides general training information only. It
> is **not** medical, physiotherapy, or professional coaching advice.
> Plyometric and explosive work carries injury risk. Consult a qualified
> professional before starting any program. You train at your own risk.

## How it personalizes

On first run you pick your **sport**, **training focus**, **age**,
**bodyweight**, **available equipment**, days/week and time per session. The app
generates a full program from those inputs:

- **Sport** (Tennis, Baseball, Softball, Basketball, Soccer, Cross Country,
  Golf, General Athlete) — drives the signature power/skill movement that leads
  every session (e.g. rotational throws for tennis/golf/baseball, jumps for
  basketball, sprints/tempo for soccer/XC).
- **Focus** — Explosive Power & Speed, Lean Bulk / Hypertrophy, Max Strength,
  or Endurance & Durability. Sets the rep schemes and weekly structure.
- **Equipment** — free weights, cables, machines, kettlebell/med-ball/plyo.
  Exercises are filtered to what you have; bodyweight/plyo always available.
- **Age & bodyweight** — light auto-scaling: accessory volume trims with age
  (with a warm-up reminder for 40+), and bodyweight gives a rough
  starting-load suggestion on the main lifts.

## Features

- **Adaptive sessions** — `buildSession()` fits each workout to your time
  budget; the sport power work is protected and done first while you're fresh,
  with lower-priority accessories trimmed before being dropped. A per-session
  "time today" override regenerates the workout instantly.
- **Exercise guidance** — every movement has a short form cue and a one-tap
  link to a video demo.
- **Fast logging** — repeat-last-session prefill, big +/- steppers, one-tap
  set-done, rest timer, sticky save bar, edit/delete history.
- **Progress** — estimated 1RM trend (Epley/Brzycki) and weekly volume split
  by power vs strength/volume, drawn with a built-in canvas renderer (offline).
- **iPhone-tuned UI** — large tap targets, 16px form controls and a locked
  viewport so taps never trigger page zoom; rugged Grundéns-inspired look.
- **Your data** — `localStorage`; JSON export/import for backup. Existing
  Gym-Buddy logs are migrated automatically (you re-onboard for the new
  profile).

## Run locally

```
python3 -m http.server 8080   # then visit http://localhost:8080
```

(The service worker needs `http(s)://` or `localhost`; `file://` runs the app
but skips offline caching.)

## Deploy (GitHub Pages)

Merge to `main`, then **Settings → Pages → Deploy from a branch → `main`,
`/ (root)`**. Live at `https://<user>.github.io/gym-buddy/`. All paths are
relative so it works from the sub-path. On a phone, open the URL and **Add to
Home Screen** to install.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell, iOS viewport/meta |
| `app.js` | State, scheduler, logging UI, charts, persistence, migration |
| `data.js` | Exercise library, sports, goals, plan generator |
| `styles.css` | Rugged mobile-first design |
| `manifest.webmanifest`, `sw.js` | PWA install + offline cache |
| `icons/`, `.nojekyll` | App icons, Pages config |

## Backups

Settings → **Export Backup (JSON)** downloads your full log. **Import Backup**
restores it on any device. Export periodically — clearing browser data wipes
`localStorage`.
