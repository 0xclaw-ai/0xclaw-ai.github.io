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

Landing page for [0xClaw](https://github.com/0xclaw-ai/0xClaw) — Autonomous AI Hackathon Agent.

## Development

Single-file static site. No build step required.

```bash
# Serve locally
npx serve .
# or
python3 -m http.server 8080
```

## Deploy

Push to `main`. GitHub Pages auto-deploys from repository root.

> Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`

## Structure

```
.
├── index.html            # Single page
├── assets/
│   ├── 0xclaw_logo.png
│   └── 0xClaw_combine.png
└── README.md
```

## License

📜 [MIT License](LICENSE)