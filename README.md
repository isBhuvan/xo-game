# Tic-Tac-Toe (XO) — Series Edition

[![CI](https://github.com/isbhuvan/xo-game/actions/workflows/ci.yml/badge.svg)](https://github.com/isbhuvan/xo-game/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A two-player Tic-Tac-Toe game for desktop and mobile, with a **best-of-N series** so you can crown an overall winner instead of arguing about who won the last one.

## Why this exists

I built this because my daughter loves playing XO and I wanted to make something with her, together. There are plenty of Tic-Tac-Toe games online, but none let us set a **maximum number of games** and declare a **series winner** — so I made one that does.

## Features

- **Series mode** — pick 1, 3, 5, 7 or 10 games; scores for X, O and draws are tracked until the series ends.
- **Series winner celebration** — trophy and confetti for the winner (or a friendly "tied" result).
- **Fair play** — the opening player alternates every game.
- **Light and dark themes** — follows your system, with a manual toggle that is remembered.
- **Accessible** — keyboard play with arrow keys, screen-reader labels, live status updates, and reduced-motion support.
- **Mobile friendly** — responsive layout with instant touch feedback.
- **No dependencies, no build step** — plain HTML, CSS and ES modules.

## Play

Hosted on GitHub Pages via the included workflow (once Pages is enabled for the repo, see [Deployment](#deployment)).

Or run it locally:

```sh
make serve          # http://localhost:8080
make serve PORT=3000
```

Opening `src/index.html` directly from disk won't work, because browsers block ES modules on `file://`. Use `make serve` (needs Python 3) or any static server.

## How a series works

1. Choose the number of games (default 3). It locks after the first game finishes.
2. Play. Each result updates the scoreboard and "Game *n* of *N*" counter.
3. After the last game the player with more wins takes the series. Equal wins means the series is tied.
4. **Play again** or **New series** starts fresh.

## Development

```sh
make help     # list targets
make test     # unit tests (Node 20+)
make check    # syntax check + tests (what CI runs)
```

Project layout:

```
src/
  index.html      page markup
  favicon.svg
  css/style.css   styles and themes
  js/game.js      board rules (pure, no DOM)
  js/series.js    series scoring (pure, no DOM)
  js/theme.js     light/dark theme handling
  js/dom.js       wires the logic to the page
test/             node:test unit tests for game.js and series.js
.github/          CI and GitHub Pages deploy workflows
```

The game and series logic have no DOM access, which keeps them easy to test. See [CONTRIBUTING.md](CONTRIBUTING.md) if you'd like to help.

## Deployment

`.github/workflows/deploy.yml` runs the checks and publishes `src/` to GitHub Pages on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

The page loads the Fredoka font from Google Fonts; it falls back to system fonts if offline.

## License

[MIT](LICENSE) — free to use, modify and share. Have fun!
