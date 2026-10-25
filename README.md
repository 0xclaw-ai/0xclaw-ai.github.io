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

Static site with no build step required. The homepage lives in `index.html`. `redesign.css` and `redesign.js` provide the layout and media interactions; `brand.css` and `brand.js` add the plum palette, pixel lettering, ASCII backdrop, and workflow styling.

```bash
# Serve locally
PORT=8080 node tools/preview-server.mjs
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
├── index.html            # Public homepage
├── brand.css             # Plum theme and display typography
├── brand.js              # ASCII backdrop and responsive lettering
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

## Previous homepage

The light editorial homepage is preserved at commit [`35ca654337cd1cb14eb973f3b94692e88a893085`](https://github.com/0xclaw-ai/0xclaw-ai.github.io/tree/35ca654337cd1cb14eb973f3b94692e88a893085), deployed on October 23, 2026. To preview it without changing the current branch:

```bash
git worktree add --detach ../0xclaw-light-preview 35ca654337cd1cb14eb973f3b94692e88a893085
cd ../0xclaw-light-preview
PORT=8081 node tools/preview-server.mjs
```

GitHub Pages publishes `main`; pushing a design branch does not replace the live site. Historical commits retain the source, but do not automatically receive separate public preview URLs.

## License

📜 [MIT License](LICENSE)
