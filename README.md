# O-Level A Math Flashcards

An interactive study app for Singapore GCE O-Level Additional Mathematics students. It focuses on formulas, identities and results that students should be ready to recall, organised into the chapters of syllabus 4049.

Published site: **https://banagget.github.io/Os-Flashcards/**

## Features

- 31 page-tagged A-Math flashcard sets and a combined Master All mode
- KaTeX-rendered memorisation cards with concise answers and mathematical conditions
- Continue Learning and Review Memorised modes
- Persistent progress, position, shuffle preference and theme using `localStorage`
- Fresh shuffle order without changing memorisation progress
- Responsive light and dark interfaces
- Keyboard controls and reduced-motion support
- GitHub Pages deployment on every push to `main`

## Technology

React, Vite, TypeScript, KaTeX and plain CSS. The application is entirely client-side and uses no backend, account or paid service.

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Type-check and build

```bash
npm run typecheck
npm run build
```

The production files are written to `dist`. Vite uses the `/Os-Flashcards/` base path so assets work from the repository’s GitHub Pages URL.

## Deployment

The workflow in `.github/workflows/deploy.yml` builds and publishes `dist` with the official GitHub Pages actions whenever `main` is updated. In the repository settings, **Pages → Build and deployment → Source** must be set to **GitHub Actions**.

## Add or edit a flashcard

Flashcards live in `src/data/flashcards.ts`. Each has:

- a unique `id`
- page/topic tags through `chapter`, `chapterSlug` and `tags`
- a `title` and front-side `question`
- a KaTeX `formula`
- an `explanation`
- optional mathematical `conditions`

Add new chapter metadata to the exported `chapters` array, then add cards using the matching slug. Use a stable ID because saved progress refers to card IDs.

## Saved progress

The browser stores memorised IDs, last selected chapter, saved positions, shuffle preference, latest study date and selected theme under `amath-flashcards-progress-v1` in `localStorage`. Progress stays on that browser and device. The dashboard’s reset action clears it after confirmation.

## Syllabus scope

The card set follows the official 2026 Singapore-Cambridge GCE O-Level Additional Mathematics syllabus 4049. Product and quotient differentiation rules are included. General area-between-two-curves and volume-of-revolution formulas are deliberately excluded because they are not listed in the current syllabus.
