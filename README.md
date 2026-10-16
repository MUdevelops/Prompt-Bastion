<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=A33757&height=230&section=header&text=Prompt%20Bastion&fontColor=FFBB94&fontSize=64&animation=fadeIn&fontAlignY=38&desc=Build%20Defenses.%20Survive%20the%20Injection.&descAlignY=60&descSize=20" alt="Prompt Bastion banner" width="100%"/>

<a href="https://github.com/MUdevelops/Prompt-Bastion">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1200&color=FFBB94&center=true&vCenter=true&width=720&lines=A+simulated+AI+security+escape+room;Learn+prompt+injection+by+defending+against+it;8+missions.+Zero+backend.+Zero+API+keys." alt="Typing animation" />
</a>

<br/>

![React](https://img.shields.io/badge/React-18-FFBB94?style=for-the-badge&logo=react&logoColor=4C1D3D&labelColor=4C1D3D)
![Vite](https://img.shields.io/badge/Vite-5-FB9590?style=for-the-badge&logo=vite&logoColor=4C1D3D&labelColor=4C1D3D)
![No Backend](https://img.shields.io/badge/Backend-None-DC586D?style=for-the-badge&labelColor=4C1D3D)
![No API](https://img.shields.io/badge/AI%20API-None-A33757?style=for-the-badge&labelColor=4C1D3D)
![Netlify](https://img.shields.io/badge/Deploy-Netlify-852E4E?style=for-the-badge&logo=netlify&logoColor=FFBB94&labelColor=4C1D3D)

<br/>

[![Watch the video](https://img.youtube.com/vi/PBmdfTQ0wVM/maxresdefault.jpg)](https://youtu.be/PBmdfTQ0wVM)

**[▶ Watch the walkthrough on YouTube](https://youtu.be/PBmdfTQ0wVM)**

</div>

---

## 🛡️ What is Prompt Bastion?

Prompt Bastion is an **educational AI security game**. You play the defender: you get a simulated AI assistant with a job to protect, write defensive instructions, and test them against prompt-injection attacks. Every result tells you *why* a check passed or failed, and how to fix it.

> ⚠️ **Simulation mode.** No live AI model or API is connected. Scores come from transparent, deterministic rules running in your browser. Passing a mission does **not** prove a real AI system is secure.

## 🎯 What you will learn

| Concept | What the game teaches |
|---|---|
| 🧱 Instruction hierarchy | Application rules must outrank user text |
| 🔐 Protecting secrets | Block direct, translated, encoded and hinted leaks |
| 📄 Untrusted documents | Treat file content as data, never as commands |
| 🎭 Role confusion | A claimed identity or role-play grants no authority |
| 🧾 Output format lock | Keep a required JSON structure under pressure |
| 🚧 Data boundaries | Allow-list actions and protect other users' data |
| ⚖️ Conflicting commands | Write a precedence policy that resolves conflicts |
| 🏰 Defense in depth | Layer many simple rules in one defense |

## 🗺️ The 8 missions

| # | Mission | Level |
|---|---|---|
| 1 | The Instruction Override | 🟢 Beginner |
| 2 | The Secret Vault | 🟢 Beginner |
| 3 | The Untrusted Document | 🟡 Intermediate |
| 4 | The Role Confusion Trap | 🟡 Intermediate |
| 5 | The Format Lock | 🟡 Intermediate |
| 6 | The Data Boundary | 🔴 Advanced |
| 7 | The Conflicting Commands | 🔴 Advanced |
| 8 | The Defense Gauntlet | 🔴 Advanced |

Missions unlock in order, and you can replay any of them to beat your best score.

## ⚙️ How it works

```mermaid
flowchart LR
    A[Untrusted input] --> B[Your defense rules]
    B --> C[Simulated decision]
    C --> D{Result}
    D -->|All required rules present| E[✓ Defended]
    D -->|Some rules present| F[! Needs review]
    D -->|Rules missing| G[✕ Failed]
```

- A rule counts only when its key ideas appear **together in one sentence**, so keyword stuffing does not work.
- Each test case lists the rules it needs: all present means full points, some means half, none means zero.
- Wording that gives users or documents authority over system rules costs **15 points**.
- Every hint costs **5 points**. XP is awarded once, on first completion of a mission.
- Scores are fully deterministic: the same text always gives the same score.

## 🏅 Ranks

| Score | Rank |
|---|---|
| 0–39 | Exposed |
| 40–59 | Apprentice Defender |
| 60–79 | Security Analyst |
| 80–94 | Defense Architect |
| 95–100 | Bastion Master |

Ranks reflect performance in this simulation only, not real expertise or certification.

## ✨ Features

- 🧪 Deterministic local rules engine with per-check explanations and fixes
- ⚔️ Attack-versus-defense view for every test case
- 💡 Three progressive hints per mission, plus a sample solution with explanations
- 🏆 Scores, XP, streaks, ranks and 7 achievements
- 📊 Final Security Report: **JSON**, **standalone HTML**, or **print**
- 💾 Progress and drafts autosaved in your browser
- 📱 Responsive layout with keyboard focus and reduced-motion support

## 🧰 Tech stack

React 18 · Vite 5 · plain JavaScript (JSX) · plain CSS · browser localStorage

## 🚀 Run locally

```bash
git clone https://github.com/MUdevelops/Prompt-Bastion.git
cd Prompt-Bastion
npm install
npm run dev
```

## 📦 Build

```bash
npm run build
npm run preview
```

The static site is generated in `dist/`.

## ☁️ Deploy to Netlify

1. Push the repository to GitHub.
2. In Netlify choose **Add new site → Import an existing project** and select the repo.
3. Netlify reads `netlify.toml` (build `npm run build`, publish `dist`, Node 20) and deploys.

Manual deploy: run `npm run build`, then drag the `dist` folder into Netlify's deploy area.

## 🔒 Privacy

Progress, drafts and hint counts live in your browser's localStorage under `prompt-bastion-v1`. Nothing is sent anywhere. Storage is not encrypted, and clearing site data removes your progress.

## 📁 Project structure

```
Prompt-Bastion/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx        # screens, game state, reports
    ├── engine.js      # missions and the local evaluator
    └── styles.css
```

## ⚠️ Limitations

- Results come from keyword-group rules, not a real AI model.
- The scoring rules ship in the browser bundle and can be inspected. They are not secret.
- Real AI security also needs least privilege, output validation and monitoring. Prompts are one layer, not the whole defense.

---

<div align="center">

**Built by [MUdevelops](https://github.com/MUdevelops)** · If this helped you, ⭐ star the repo

<img src="https://capsule-render.vercel.app/api?type=waving&color=4C1D3D&height=120&section=footer" alt="footer" width="100%"/>

</div>
