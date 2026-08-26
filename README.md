# Dosage Calc Practice

An accessible, browser-based practice generator for medication dosage
calculations. Each visit (or reload) produces a fresh, randomized problem with
semi-random numbers that make sense for the question type, a configurable number
of attempts, and a fully worked, step-by-step solution that appears once you
answer correctly or run out of attempts.

Built with **React + Vite**, deployable to **GitHub Pages**, and also packageable
as a desktop app with **Electron**.

## Features

- **22 problem types across 6 categories** (see below), drawn from real dosage
  worksheets plus common clinical calculations.
- **Worked solutions** — every problem shows numbered steps and the final answer.
- **Configurable attempts** — 1–10 or unlimited. The solution is revealed on a
  correct answer or when attempts run out; a "Reveal solution" button lets you
  give up early.
- **New problem on every reload**, plus "New problem" and "Skip" buttons.
- **Forgiving answer checking** that accepts sensible rounding without accepting
  the wrong method.
- **Light and dark themes**, including **Dracula** and **Nord** (dark) and
  **Daylight**, **Solarized Light**, and **GitHub Light** (light), with a
  Solarized Dark bonus. Follows the OS light/dark preference by default and
  remembers your choice.
- **Session scoring** — solved count, accuracy, and streaks.
- **Accessibility first** (see below).

### Problem types

| Category | Types |
| --- | --- |
| Conversions | kg → lb, lb → kg |
| Concentration & dosing | units/mL → volume, weight-based dose (units/kg), weight-based dose (mg/kg) |
| Percentage strength | g in mL → %, mg/mL → %, mg in mL → %, ratio → %, mg of drug in a % solution, mg of drug in a ratio solution |
| Ratios | mg in mL → ratio, reduce a ratio, % → ratio, ratio → mg/mL, mL of a ratio to deliver a dose |
| Dilution (V₁C₁ = V₂C₂) | final % after dilution, diluent needed to reach a target % |
| Clinical calculations | tablets (Desired ÷ Have), liquid dose (D ÷ H × Q), IV rate (mL/hr), IV drip rate (gtt/min) |

## Accessibility

Designed to meet **WCAG 2.1 AA** / **Section 508** expectations for colleges
and universities:

- Semantic landmarks (`header`/`main`/`footer`), a "skip to problem" link, and a
  logical heading order.
- Every control has a programmatic label; the answer field describes its
  expected unit for screen readers.
- Results and feedback are announced through an ARIA live region.
- Correct/incorrect states use an icon **and** text, never color alone.
- Visible keyboard focus indicators on all interactive elements; the entire app
  is keyboard operable.
- All theme palettes meet AA text-contrast ratios.
- Honors `prefers-reduced-motion` and `prefers-color-scheme`.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server (http://localhost:5173)
```

### Build

```bash
npm run build    # outputs static files to dist/
npm run preview  # preview the production build locally
```

### Tests

Unit tests validate the generator math and answer checking:

```bash
npm test
```

## Deploying to GitHub Pages

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the app and
publishes `dist/` to GitHub Pages.

1. In your repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to the `main` branch (or run the workflow manually from the **Actions**
   tab). The site publishes to `https://<user>.github.io/<repo>/`.

The Vite `base` is set to `./` (relative), so the build works from any Pages
subpath without further configuration.

## Desktop app (Electron)

```bash
npm run electron:dev     # run the app in an Electron window (dev)
npm run electron:build   # build the web app and package a desktop binary
```

> The Electron binary is skipped during `npm install` in CI. To run Electron
> locally, install without `ELECTRON_SKIP_BINARY_DOWNLOAD` set.

## Project structure

```
index.html                 App shell + no-flash theme bootstrap
vite.config.js             Vite config (relative base for Pages/Electron)
electron/                  Electron main & preload
src/
  main.jsx                 React entry point
  App.jsx                  Layout + session scoring
  context/                 Settings (theme, attempts, enabled types) + persistence
  hooks/useProblem.js      Current problem, attempts, reveal state
  components/              Header, ProblemCard, AnswerInput, SolutionSteps, SettingsPanel, ...
  themes/                  Theme catalogue
  styles/                  Global layout + per-theme CSS variables
  lib/
    random.js, format.js   Number helpers
    checkAnswer.js         Tolerant answer grading
    generators/            One module per problem category + a registry
test/                      Generator + answer-checking unit tests
```

## Disclaimer

This is an educational practice tool. Always verify medication calculations
against your institution's policies and a licensed professional.

## License

MIT — see [LICENSE](LICENSE).
