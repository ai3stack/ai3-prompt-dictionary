# AI³ Prompt Dictionary

A **MIT-licensed, structured** dataset of 930+ English AI prompts. Fork it. Build on it. Ship something.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Prompts: 930+](https://img.shields.io/badge/prompts-930%2B-brightgreen)]()
[![Language: en-US](https://img.shields.io/badge/language-en--US-orange)]()
[![Validate](https://github.com/ai3stack/ai-prompt-dictionary/actions/workflows/validate.yml/badge.svg)](https://github.com/ai3stack/ai-prompt-dictionary/actions/workflows/validate.yml)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4)](CONTRIBUTING.md)

## What this is

A curated, machine-readable catalog of prompts covering office work, industry tasks, daily life, and public affairs. Each prompt is:

- **Structured** — not free-text; every entry has a `role`, `task`, `framework`, `type`, `name`, plus AI-instruction fields (`limits`, `search`, `format`, `check`, …). See [docs/PROMPT_SCHEMA.md](docs/PROMPT_SCHEMA.md).
- **English** — all 930+ prompts live under `content/en-US/`.
- **Classified** — 4 sections × 42 categories × 10 types, navigable by any axis.

## What this is NOT

Not a website. Not a consumer product. Not a browser extension.

If you're looking for the end-user site to copy-paste prompts into ChatGPT, visit [www.ai3stack.com](https://www.ai3stack.com). That's a separate product built on top of this dictionary.

## Why this over Awesome-ChatGPT-Prompts?

| | Awesome-Prompts | AI³ Dictionary |
|---|---|---|
| Format | free-text Markdown | structured JSON |
| Schema | none | documented, validated, versioned |
| Build-on-able | fork the README | `import "@ai3stack/prompt-dictionary"` (coming) |
| Type classification | none | 10 canonical types |

## Quick start

```bash
git clone https://github.com/ai3stack/ai-prompt-dictionary.git
cd ai-prompt-dictionary

# Peek at the first prompt (Python only — no extra deps required)
python3 -c "import json; print(json.dumps(json.load(open('content/en-US/prompts/01-core.json'))[0], ensure_ascii=False, indent=2))"

# Validate the whole dataset
python3 scripts/validate_prompts.py

# Merge into runtime JSON bundles
python3 scripts/merge_content.py
```

## Data layout

```
content/
└── en-US/
    ├── prompts/
    │   ├── 01-core.json         # office / general prompts
    │   ├── 02-industry.json     # industry-specific
    │   ├── 03-lifestyle.json    # daily life
    │   └── 04-public.json       # public affairs
    ├── categories.json          # 42 category definitions
    └── ui.json                  # UI strings
```

## Contributing

Start here: [CONTRIBUTING.md](CONTRIBUTING.md). The most valuable PRs:

1. **New prompts** — fill gaps in under-populated categories.
2. **Quality fixes** — sharpen unclear `role`/`task`/`framework` fields.
3. **Tool-building** — a `v2.0` [ROADMAP.md](ROADMAP.md) entry waiting for an owner (NPM, CLI, browser extension, VS Code …).

First-time contributors: look for [`good-first-issue`](https://github.com/ai3stack/ai-prompt-dictionary/labels/good-first-issue).

## Governance

Benevolent dictator model currently ([GOVERNANCE.md](GOVERNANCE.md)). Graduates to Committer model after 3 stable contributors.

## License

[MIT](LICENSE). Attribution appreciated but not required.

---

*For the consumer website, see [www.ai3stack.com](https://www.ai3stack.com). For the project timeline, see [ROADMAP.md](ROADMAP.md). For everything else, open a [Discussion](https://github.com/ai3stack/ai-prompt-dictionary/discussions).*
