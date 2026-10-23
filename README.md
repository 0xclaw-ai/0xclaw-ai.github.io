<div align="center">
  <img src="assets/0xClaw_combine.png" alt="0xClaw" width="480" />
  <br /><br />
  <a href="https://0xclaw-ai.github.io"><img src="https://img.shields.io/badge/Live-0xclaw--ai.github.io-7c3aed?style=flat-square" alt="Live site" /></a>
  &nbsp;
  <a href="https://github.com/0xclaw-ai/0xClaw"><img src="https://img.shields.io/badge/GitHub-0xclaw--ai%2F0xClaw-24292e?style=flat-square&logo=github" alt="GitHub" /></a>
  &nbsp;
  <a href="https://github.com/0xclaw-ai/0xClaw/blob/master/LICENSE"><img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" /></a>
</div>

---

**🏆 1st Place Winner – Z.ai Bounty @ UK AI Agent Hackathon × OpenClaw 🦞.**

**🏆 Finalist Winner – Anyway Bounty @ UK AI Agent Hackathon × OpenClaw 🦞.**

Landing page for [0xClaw](https://github.com/0xclaw-ai/0xClaw) — Autonomous AI Hackathon Agent.

## Development

Static site with no build step required. The current homepage stays in `index.html`; the project-gallery preview is isolated in `showcase.html`.

```bash
# Serve locally
npx serve .
# or
python3 -m http.server 8080
```

Then open:

- Homepage: <http://localhost:8080/>
- Project showcase preview: <http://localhost:8080/showcase.html>

The seven showcase demos run entirely in the browser. External wallets, chains, databases, model APIs, news feeds, and literature services are represented by deterministic sample data and are labelled inside each demo.

## Deploy

Push to `main`. GitHub Pages auto-deploys from repository root.

> Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`

## Structure

```
.
├── index.html            # Existing public homepage (unchanged)
├── showcase.html         # Local project-gallery preview
├── showcase.css
├── showcase.js
├── demos/                # Seven self-contained interactive previews
│   ├── shared.css
│   ├── clarify/
│   ├── token/
│   ├── aigent/
│   ├── semantic/
│   ├── steward/
│   ├── litverify/
│   └── signal/
├── assets/
│   ├── 0xclaw_logo.png
│   └── 0xClaw_combine.png
└── README.md
```

## License

📜 [MIT License](LICENSE)
