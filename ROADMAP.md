# Roadmap — AI³ Prompt Dictionary (Developer Edition)

This is a living document for **the open-source dictionary itself** — the data, the schema, the tooling, and the ecosystem around it. Dates are guidance, not commitments. PRs that pull the future closer are always welcome.

Note: the consumer website (`www.ai3stack.com`) has its own separate roadmap and does not share this file. This repo is for developers, researchers, and tool builders.

---

## v1.0 — Public Release (target: 2026-06)

**Theme**: a stable dataset and contribution pipeline that anyone can clone and build with.

- [x] 930 English prompts across 4 sections / 42 categories
- [x] Content / code separation: `content/` for prompts, `scripts/` for tooling
- [x] Full OSS scaffolding: CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE
- [x] Schema documentation (`docs/PROMPT_SCHEMA.md`)
- [x] Architecture overview (`docs/ARCHITECTURE.md`)
- [ ] **Quality review of all 930 prompts** — records carry an optional `translation_quality` stamp; absent it they default to `draft` (see [DECISIONS.md D-0003](docs/DECISIONS.md)). Backfill `community-reviewed` / `expert-reviewed` per the [style guide](TRANSLATION_GUIDE.md) before v1.0.
- [ ] `translation_quality` field populated on every record (`draft` | `community-reviewed` | `expert-reviewed`)
- [ ] CI on every PR (validate data schema + link integrity + naming uniqueness)
- [ ] `requirements.txt` + reproducible Python 3.11 build environment
- [ ] Contributor recognition: `CONTRIBUTORS.md` auto-updated on first merge
- [ ] 5+ `good-first-issue` tasks seeded and waiting

---

## v1.x — Contributor Onboarding (target: 2026-07 → 2026-12)

**Theme**: make the first PR from a stranger land within 7 days.

- [ ] Monthly "PR throughput" report in Discussions (automated)
- [ ] Quality dashboard: count of `draft` / `community-reviewed` / `expert-reviewed` per section
- [ ] RFC process documented with one real closed example
- [ ] Schema versioning policy (when the schema changes, how is it announced?)
- [ ] **At ≥500 stars: activate sponsor funnels.** Open GitHub Sponsors (`ai3stack`), uncomment the matching lines in `.github/FUNDING.yml`, add a sponsor badge to README. Stay silent on funding until then — see [GOVERNANCE.md §funding](GOVERNANCE.md).

---

## v2.0 — The Ecosystem (target: 2027-Q1 → Q2)

**Theme**: AI³ becomes a dataset and a toolkit, not just a single consumer website.

Each sub-project below is an invitation for contributors to own something visible. First credible PR takes the lead.

### 🔌 Browser Extension (Chrome + Firefox)
One-click "paste a prompt from AI³" button inside chat.openai.com, claude.ai, gemini.google.com, etc. Built on the public JSON data; no server needed. **Owner: TBD.** Estimated scope: 2 weekends for a solid v0.

### 📦 NPM Package — `@ai3stack/prompt-dictionary`
Ships the full JSON plus TypeScript typings for apps that want to embed the dictionary. **Owner: TBD.** Estimated scope: 1 weekend.

### 🖥️ CLI Tool — `npx ai3 <slug>`
Print a prompt to stdout, optionally pipe into an LLM API. Example: `npx ai3 weekly-report --en | claude`. **Owner: TBD.**

### 🧩 VS Code Extension
Type `/ai3 ` in any file → fuzzy-finds prompts → inserts as a comment block. Useful for Cursor / Copilot Chat users. **Owner: TBD.**

### 📜 HTTP API (on demand)
Currently the JSON files are static fetches, so there is effectively already an API. If demand warrants, we add a tiny edge function for filtered / paginated responses.

### 🔗 Embed Widget
A `<script src="…">` drop-in that renders a searchable prompt picker inside any webpage. **Owner: TBD.**

### 🌐 Additional Languages (ja-JP / ko-KR / es-ES / fr-FR / de-DE …)
The dataset is currently English-only. The `content/{locale}/` layout is ready for any language. Adding one: (1) translate `ui.json`, (2) translate prompts with cultural adaptation, (3) merge. **First language with a willing maintainer ships next.**

---

## v3.0 — Ideas We Are Holding Open

Not committed. 👍 reactions on Discussions inform priority.

- **Prompt versioning** — keep older iterations browsable
- **Community output gallery** — moderated gallery of what users got back
- **Domain-specific packs** — curated starter sets ("Teacher's Toolkit", "Founder Essentials")
- **AI-assisted prompt quality scoring** — automated style-guide checker

---

## Non-goals (this repo actively will not do)

- Paid tiers, premium features, freemium model
- User accounts / profiles / login (that is a *product* concern, not a *dictionary* concern)
- AI-generated prompts that haven't been human-reviewed
- Tracking of developers (the repo has no analytics; only the consumer website does)

---

## How to propose an addition

Open a **Discussion** titled `[Roadmap] <proposal>`. Include:

1. Which developer need does this serve?
2. What's the smallest shippable version?
3. Would you be willing to own it?

If there's interest and an owner, it moves onto the roadmap. If no owner, it lands in "Ideas we are holding open".

---

*Last updated: 2026-04-23*
