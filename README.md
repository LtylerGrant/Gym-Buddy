# Gym-Buddy

A lightweight, offline-first gym assistant (installable PWA) for logging
workouts on your phone. It runs one **blended weekly program** that builds
**fast-twitch / explosive power for tennis** *and* a **lean bulk** in the same
week, and it **adapts the routine** to how many days per week you train and how
much time you have each session.

No backend, no build step, no dependencies — just static files.

> **Disclaimer:** Gym-Buddy provides general training information only. It is
> **not** medical, physiotherapy, or professional coaching advice. Plyometric
> and explosive work carries injury risk. Consult a qualified professional
> before starting any program. You train at your own risk.

## Features

- **Adaptive routine** — set days/week (2–6) and minutes/session (30–90).
  Explosive *power* work is always protected and done first while you're fresh;
  hypertrophy volume fills the rest of the time budget, trimming low-priority
  accessories before dropping them. A per-session "time today" override
  regenerates the workout instantly.
- **Fast logging** — repeat-last-session prefill, +/- steppers, one-tap "set
  done", built-in rest timer, sticky save bar.
- **Progress** — estimated 1RM trend (Epley/Brzycki) and weekly volume split by
  power vs hypertrophy so you can see both goals are being served.
- **Offline** — cache-first service worker; works with no signal at the gym.
  Charts are rendered with a tiny built-in canvas renderer (no CDN).
- **Your data** — stored in `localStorage`; JSON export/import for backup.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8080   # then visit http://localhost:8080
```

(The service worker needs `http(s)://` or `localhost` — opening via `file://`
works for the app but skips offline caching.)

## Deploy (GitHub Pages)

1. Merge this branch to `main`.
2. Repo → **Settings → Pages → Deploy from a branch** → `main`, folder `/ (root)`.
3. Live at `https://<user>.github.io/gym-buddy/`. All asset and service-worker
   paths are relative, so it works from the `/gym-buddy/` sub-path.
4. On your phone, open the URL and use **Add to Home Screen** to install it.

## Files

| File | Purpose |
|---|---|
| `index.html` | App shell |
| `app.js` | State, adaptive scheduler, logging UI, charts, persistence |
| `data.js` | Exercise library + the blended plan template |
| `styles.css` | Mobile-first styling |
| `manifest.webmanifest`, `sw.js` | PWA install + offline cache |
| `icons/` | App icons |

## Backups

Settings → **Export backup (JSON)** downloads your full log. **Import backup**
restores it on any device. Export periodically — clearing browser data wipes
`localStorage`.
