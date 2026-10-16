# Prompt Bastion

**Build Defenses. Survive the Injection.**

Prompt Bastion is a **simulated AI security training game**. You write defensive instructions for a pretend AI assistant, run them against prompt-injection scenarios, read why each check passed or failed, and improve. No live AI model, backend, database or API key is involved.

## Features
- 8 progressive missions (Beginner, Intermediate, Advanced) that unlock in order and can be replayed
- Defense Workbench with autosaved drafts, copy, clear, reset, character count
- Deterministic local rules engine with per-check explanations and fixes
- Attack-versus-defense visualization for every test case
- 3 progressive hints per mission (each costs 5 points) and a sample solution with explanations
- Scores, ranks, XP (first completion only), streaks and 7 achievements
- Final Security Report: JSON download, standalone HTML download (escaped), print
- Mission Control dashboard, About Simulation and Privacy sections

## Technologies
React 18, Vite 5, plain JavaScript (JSX), plain CSS, browser localStorage.

## Files
`index.html`, `package.json`, `vite.config.js`, `netlify.toml`, `README.md`, `src/main.jsx`, `src/App.jsx`, `src/engine.js` (challenges and evaluator), `src/styles.css`

## Run locally
```
npm install
npm run dev
```

## Build
```
npm run build
npm run preview
```
The static site is generated in `dist/`.

## Deploy to Netlify
1. Push this project to GitHub.
2. In Netlify choose **Add new site, Import an existing project**, and pick the repository.
3. Netlify reads `netlify.toml` (build `npm run build`, publish `dist`, Node 20). Click **Deploy**.

Manual deploy: run `npm run build`, then drag the `dist` folder into Netlify's manual deploy area.

## Where progress is saved
In your browser's localStorage under the key `prompt-bastion-v1`. It is never sent anywhere, is not encrypted, and is removed by the in-app reset or by clearing site data.

## Limitations
- Results come from keyword-group rules, not a real AI model, so they do not prove any real system is secure.
- The scoring rules ship in the browser bundle and can be inspected. They are not secret.
- Ranks reflect performance in this simulation only, not real expertise or certification.
