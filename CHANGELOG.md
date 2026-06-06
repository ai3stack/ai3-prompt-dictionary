# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [SemVer](https://semver.org/) once we hit v1.0.

Dates are in `YYYY-MM-DD` (China Standard Time).

---

## [Unreleased]

### Added
- Split prompt data into per-section files under `content/{locale}/prompts/`, making individual-prompt PRs much easier to review.
- `scripts/merge_content.py` — source-of-truth merger: reads `content/` and produces runtime JSON bundles in `locales/{code}/`.
- Full open-source governance scaffold: `CONTRIBUTING.md`, `TRANSLATION_GUIDE.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `ROADMAP.md`, `docs/*`.
- Issue templates: translation fix / prompt suggestion / bug report / feature request.
- `manualCopyTip` string in `content/{zh-CN,en-US}/ui.json` — used by the consumer website as a fallback when Clipboard API + execCommand both fail (typical in WeChat / Alipay in-app browsers).
- **(2026-04-25)** OSS launch readiness — Round 1: `CONTRIBUTORS.md`, `SECURITY.md`, `SUPPORT.md`, `docs/DECISIONS.md` (with D-0001 through D-0004 backfilled), `.github/workflows/build-preview.yml` (PR diff summary + merged-locales artifact), `.github/workflows/deploy.yml` (tag → GitHub Release with bundle.zip + SHA256SUMS), `.github/CODEOWNERS`, `.github/FUNDING.yml` (commented until ≥500 stars), `.github/dependabot.yml`.
- **(2026-04-25)** Round 2 hardening: D-0005 added — explicit two-stage gate (merge ≠ ship; release tag is the only deploy trigger). PR template gained "first-time contributor: add yourself to CONTRIBUTORS.md" check. `validate_prompts.py` now enforces all 9 schema-required top-level fields (was 5), `category_path` prefix consistency, and `translation_quality` enum values.

### Changed
- README rewritten for a developer/contributor audience (English primary, Chinese section). The website remains fully consumer-focused and does **not** expose open-source terminology to end users.
- `backup/v5.*` snapshot directories retired in favor of annotated git tags + this changelog.
- **Repository split** (2026-04-23): this repo now contains only the dictionary (data + tools). The consumer website lives in a separate, currently private repository, which consumes `content/` as its upstream data source. ROADMAP now covers only developer-facing items (NPM / CLI / browser-extension / third language); consumer UX roadmap lives in the website repo.
- **(2026-04-25)** `docs/DEPLOYMENT.md` rewritten from "how to ship to two aliyun servers" to "how releases are packaged and how downstream consumers pull from them" — server deployment is the consumer-website repo's concern, not this one.
- **(2026-04-25)** `docs/ARCHITECTURE.md` rewritten to drop all consumer-website internals (SPA, `app.js`, `build_static.py`, nginx, `service-worker.js`, `dist-en/`, `/p/` static pages). This repo's surface is now: data + Python tooling + governance.
- **(2026-04-25)** `merge_content.py` output layout standardized to `locales/{code}/{prompts_index,categories_index,ui}.json` (was: flat root with dual-named files). All downstream readers updated.
- **(2026-04-25)** `validate_prompts.py` now reads from `content/{locale}/prompts/*.json` directly, no longer dependent on a prior `merge_content.py` run.

### Removed
- **(2026-04-25)** `scripts/backup.sh`, `scripts/safe-commit.sh` — referenced files that no longer live in this repo (`app.js`, `index.html`, `service-worker.js`, root-level `prompts_index.json`, etc.).
- **(2026-04-25)** `scripts/translate_prompts.py` — read the pre-split `prompts_index.json` that no longer exists. ROADMAP tracks the rebuild for the sharded `content/` structure.
- **(2026-04-26)** `README.zh-CN.md` — single-language English-only stance going forward; English README is the canonical entry point for all readers.

### Fixed (2026-04-26 deep audit)
- `LICENSE` copyright holder now reads `Copyright (c) 2026 ai3stack and AI³ Prompt Dictionary contributors` (was: project name in Chinese, which is not standard MIT-license practice).
- `ROADMAP.md` v1.0 entry on translation_quality re-stated to match reality: 0/930 EN records currently carry an explicit stamp; all are treated as `draft` per the default rule. Backfill is the v1.0 deliverable.
- `docs/PROMPT_SCHEMA.md` documents the `style` asymmetry: `zh-CN` records carry it, `en-US` records omit it by convention.
- `CHANGELOG` no longer claims a specific GitHub URL for the consumer-website repo (which has not been pushed under a confirmed name). Wording softened to "a separate, currently private repository."
- `README.md` and `CONTRIBUTING.md` quick-start examples no longer require `jq`; pure Python fallbacks added.

---

## [🚀 v1.0 Launch Day] · 2026-04-23

The consumer website ([www.ai3stack.com](https://www.ai3stack.com)) went live on this date.

This dictionary repo wasn't yet pushed to the public GitHub (`ai-prompt-dictionary`) — work continued in private on `ai3stack/ai-prompt-dictionary` while we:
- Backfill `translation_quality` metadata on all 930 EN prompts
- Review EN role authenticity (real named authorities, not generic templates)
- Close residual launch-blockers from audit (CONTRIBUTORS.md, good-first-issue seed, LICENSE copyright adjustment, CoC contact email)

Target public-repo push: when the audit blockers are cleared and a demo GIF exists.

---

## [v5.17] · 2026-04-23 — Bilingual two-server architecture

First shippable English edition.

### Added
- `locales/{zh-CN,en-US}.json` runtime i18n bundles; `locales/loader.js` synchronous loader (~10 ms blocking, zero async restructure).
- `index.en.html` — English SPA entry pointed at `www.ai3stack.com` with US-only Umami analytics (no Baidu).
- `content/en-US/prompts/*` seeded with 15 hand-localized prompts (deep cultural adaptation — not machine translation).
- `scripts/build_static.py --locale {zh-CN|en-US}` — single command emits either CN build (at repo root) or EN build (to `dist-en/`).
- `scripts/build-all.sh` — one-shot builder for both locales.
- `scripts/translate_prompts.py` — incremental AI-assisted translation pipeline (Anthropic or OpenAI backends).
- `deploy/nginx.en.conf.example` — Silicon Valley server config (mirrors `nginx.cn.conf.example`).
- Three-way `hreflang` (zh-CN / en / x-default) on every page; `og:locale:alternate` included.

### Changed
- `app.js` fully i18n-aware: all hardcoded Chinese constants (`CATEGORY_META`, `TYPE_OVERRIDES`, `SECTION_NAMES`, toast text, search labels, theme names…) now pulled from `window.__AI3_LOCALE__` via a `t()` helper.
- `build_static.py`: all user-facing template strings moved to `B()` / `L()` lookups in locale JSON.
- Regex rule tables (`nameFormatOverrides`, `styleOverrides`) are now locale-specific — CN patterns match Chinese prompt names, EN patterns match English prompt names.

---

## [v5.16] · 2026-04-22 — 22-item audit wrap-up (items 11–22)

### Added
- `LICENSE` — standard MIT text (Copyright © 2026 AI³ Prompt Dictionary).
- `/privacy/` and `/terms/` legal pages (~150-word TL;DR versions, generated by build script).
- `assets/favicon.svg` — inline AI³ mark (dark navy + accent 3) shared across SPA + 930 static pages.
- `theme-color` meta tags for mobile browser chrome (dark + light media queries).
- `iconify-icon:not(:defined)` CSS placeholder — keeps layout stable if both iconify CDNs fail.
- Slug collision check in `validate_prompts.py`.

### Changed
- Iconify script now has an `onerror` fallback to jsDelivr mirror.
- `/p/` index gets a "Browse by category" back-link; `/c/` index gets a "Browse all 930+" CTA.
- Nginx config hardened with `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy`, and `HSTS includeSubDomains`.
- `robots.txt` now blocks `/deploy/` and `/.git/`. `sitemap.xml` now lists `/privacy/` + `/terms/`.

### Deliberately Skipped (not over-engineered)
- **Item 14 · app.js refactor** — 1175-line single class is fine for a small vanilla-JS project with a single maintainer.
- **Item 15 · static-page content differentiation** — each prompt already carries a unique role / task / framework; no SEO cannibalization observed.
- **Item 17 · bookmarks / history feature** — browser bookmarks + note-taking apps cover it; adding it would drift from the "prompt dictionary" identity.

---

## [v5.15] · 2026-04-22 — OG social cards + live-edit search + mobile touch targets

### Added
- 5 × 1200×630 PNG OG covers (`assets/og/og-cover*.png`) generated via `scripts/build_og_images.py` (PIL + Noto Sans CJK). One global, four with per-section accent colors.
- `SEARCH_FIELDS` now includes `input` (weight 1, label "已编辑") — user edits are indexed and searchable; default placeholder content is filtered out.
- `persistEdits()` rebuilds the search index on every save (400 ms debounced), so user edits become searchable immediately.

### Changed
- Platform button target size bumped to 44×44 px on mobile (meets iOS HIG + WCAG 2.2 AAA).
- `#copyFullPrompt` and `.btn-icon` enforce `min 44×44` on touch devices.
- Search placeholder hides on focus (`::placeholder { color: transparent }` on `:focus`).

### Fixed
- Live edits in the I/O input area now propagate to the search index (were only persisting to localStorage).

---

## [v5.14] · 2026-04-22 — First-paint experience parity (audit item 7)

**Context**: search-engine visitors landed on `/p/ai3-XXXXX/` (200 ms first paint); clicking "Back to app" hit `/` which had to fetch 820 KB JSON → 500–800 ms of white screen.

### Added
- **Plan A — Static page self-service**: new `static-page.js` (~3 KB) adds a "📋 Copy full prompt" button, intercepts platform clicks to copy + open, and emits `static_copy` / `static_platform_go` / `static_prompt_view` analytics events. Users complete their task on the static page without bouncing through the SPA.
- **Plan B — SPA first-paint splash**: `<div id="spa-boot">` shows immediately on `/` with 10 featured prompts + navigation; `body.spa-ready` fades it out once `init()` finishes. Covers the JS-off / slow-network case too.

**Result**: regardless of entry point, the first frame is always usable content.

---

## [v5.13] · 2026-04-22 — Aliyun Lightweight deployment (audit item 6)

### Added
- `deploy/nginx.conf.example` — production-ready nginx config with path-specific Cache-Control, gzip, HSTS, directory-index fallback.
- Service Worker version **auto-bumps** to `ai3-YYYYMMDDHHMM` on every build (via `scripts/build_static.py`). Old caches clear automatically on user's next visit.
- Per-path Cache-Control policy:
  - `/service-worker.js` → `no-cache`
  - `/` + `*.html` → 5 min
  - `*.json` → 10 min (pairs with SW stale-while-revalidate)
  - `*.js` / `*.css` → 1 hour
  - Images / SVG / fonts → 1 year `immutable`
- `Disallow: /backup/ /scripts/` in robots.txt.

---

## [v5.12] · 2026-04-22 — Two-layer backup mechanism

### Added
- `scripts/backup.sh` — local timestamped snapshot (`backup/auto_YYYY-MM-DD_HHMMSS/`), source files only (skips rebuild-able artifacts).
- `scripts/safe-commit.sh` — unified workflow: `validate → snapshot → commit → push`. Data validation failure aborts before git touches anything.

Rationale: one prior incident where a batch edit corrupted data; this trio makes data loss near-impossible.

---

## [v5.11] · 2026-04-22 — Analytics + multi-region architecture

### Added
- **Baidu Analytics** (`f7768a2296bb3888b36538d493566361`) for mainland China metrics.
- **Umami Cloud** (`5d582d65-806e-4091-b696-eb0a52940842`) for global, privacy-friendly metrics with custom-event support.
- Unified `track(event, props)` helper in `app.js`. Six canonical events: `prompt_view`, `copy`, `copy_failed`, `platform_go`, `search`, `theme_switch`.
- `window.__AI3_CONFIG__` configuration block (single source of truth for region / locale / analytics IDs) — swap per deployment target.
- `data_load_failed` event with abort reason (timeout_10s / HTTP status / network) for first-load diagnostics.
- `AbortController` timeout (10 s) on data fetch; enhanced `renderLoadError()` updates sidebar + right panel with a retry button.

---

## [v5.10] · 2026-04-22 — SEO static site (L1 + L2 + L3)

### Added
- 930 independent HTML pages at `/p/ai3-00001/` … `/p/ai3-00930/`, each with full Open Graph, Twitter Card, and JSON-LD (BreadcrumbList + Article + HowTo).
- 47 aggregation pages: `/c/{section-code}/` (4 sections) + `/c/{section-category}/` (42 categories) + `/c/index.html` + `/p/index.html`.
- `sitemap.xml` with 979 URLs, `robots.txt`, and category-aware OG image selection via the `section_code` field.
- `skip-link` (a11y) and `itemprop` microdata on prompt articles.

---

## [v5.9] · 2026-04-22 — Remove unused `example` field

### Removed
- `ai_instructions.example` field — empty across all 930 prompts since schema inception. Cleaned from `app.js` `AI_LAYOUT`, `scripts/export_dictionary.py`, and `scripts/validate_prompts.py`.

Empty schema fields are tech debt. If a future need for examples emerges, add a fresh field.

---

## [v5.8] · 2026-04-22 — Role deep-polish (methodology founder replacements)

### Changed
- Three role upgrades using a unified `{cognitive anchor} {function} {name}` format:
  - `AI³-00006 工作日志`: "GTD time-management product owner" → **"GTD creator David Allen"**
  - `AI³-00007 周工作计划`: "Google OKR PMO lead" → **"OKR methodology inventor, former Intel CEO Andy Grove"**
  - `AI³-00197 OKR目标制定`: same as above

Principle: methodology-level prompts should carry the actual creator/inventor as their role, not a secondary practitioner or evangelist.

### Deliberately Unchanged
- `AI³-00019 请假申请` role ("资深工作摸鱼策略师") — for the delicate art of requesting time off, seasoned practice outranks formal credentials.

---

## [v5.7] · 2026-04-22 — Role differentiation (9 prompts)

14 roles were shared by multiple prompts. 5 were legitimate (one expert, multiple adjacent tasks); 9 were hiding distinct intents behind the same label.

### Changed
| Prompt | Before | After |
|---|---|---|
| AI³-00028 会议发言稿 | US Presidential Chief Speechwriter | TED Speech Trainer (business context fits better) |
| AI³-00099 用户增长策略 | Facebook early growth lead | Dropbox growth lead Sean Ellis (mature-product growth) |
| AI³-00146 客户需求挖掘话术 | Challenger Sale co-creator | SPIN Selling creator Neil Rackham (SPIN is purpose-built for discovery) |
| AI³-00148 产品价格异议话术 | Value-pricing method founder | FBI negotiator Chris Voss |
| AI³-00161 客服退货换货话术 | Amazon returns process designer | Zappos Customer Service Excellence lead |
| AI³-00190 员工培训课件制作 | Khan Academy curriculum director | GE Crotonville curriculum director (enterprise learning) |
| AI³-00271 企业对外声明 | Apple PR director | Johnson & Johnson VP Corporate Affairs (handled the Tylenol crisis) |
| AI³-00646 营养搭配方案 | Mayo Clinic nutrition chief | Harvard T.H. Chan School of Public Health nutrition professor |
| AI³-00685 学术文献综述 | Cochrane systematic-review expert | Nature senior editor (broader academic scope) |

**Result**: shared roles dropped from 14 → 6 (all remaining cases are legitimate).

---

## [v5.6] · 2026-04-22 — Type reclassification (28 prompts)

Fixed `type` field mismatches via 7 high-confidence rules:

| Rule | Moved From → To | Count | Example |
|---|---|---:|---|
| Sales scripts | Standard / Analytical / Creative → **Collaborative Communication** | 15 | Sales scripts, support scripts, live-commerce scripts |
| Plans (weekly/monthly/quarterly) | Routine Report → **Specialized Report** | 5 | Weekly plan, production plan report |
| Translation | Standard Operation → **Process Execution** | 4 | General translation, travel-phrase list |
| Slides / speeches / addresses | Analytical / Creative → **External Presentation** | 3 | Market pitch deck, executive speech |
| Posters / visuals | Standard Operation → **Creative Expression** | 1 | Poster generation |

Downstream benefit: these 28 prompts now inherit more fitting `limits` / `style` / `format` / `check` overrides from the new type.

---

## [v5.5] · 2026-04-22 — Style rule coverage

After v5.4, 90 prompts still fell back to the three generic style templates. Fixed by:

- Added "Casual, conversational, short sentences" to `GENERIC_STYLES`.
- Added 4 Creative Expression sub-rules for speeches / slides / scripts / fallback.
- Added fallback rules for Specialized Report and Routine Report.

**Result**: generic-style count 90 → 0; most-common style share 28.4% → 15.5%; distinct styles 454 → 466.

---

## [v5.4] · 2026-04-22 — Type-based smart overrides (Plan A)

Introduced runtime override of 5 template fields based on the `type` field (10 types):

| Override | Rule | Prompts Affected |
|---|---|---:|
| `limits` | Creative → allow imagination; Crisis → no empty talk; External → no false ads; Self-doc → objective | ~261 |
| `format` | Name-regex for speech / story / poem / email / post → plain text | ~80 |
| `search` | Creative / Self-doc → no web search; Analytical / Specialized → recommend web verify | ~502 |
| `check` | Creative / Crisis / Analytical each get type-specific check items | ~440 |
| `style` | Type + name regex smart inference (only replaces empty or generic values) | ~340 |

Implementation: `TYPE_OVERRIDES` / `NAME_FORMAT_OVERRIDES` / `STYLE_OVERRIDES` constants + `_typeOverrides(inst, name)` method in `app.js`.

**Merge order**: `DEFAULT < per-prompt data < TYPE_OVERRIDES`. Data file is never modified; overrides merge at render time.

---

## [v5.3] · 2026-04-22 — Global default extraction (Plan B)

### Changed
- Five always-identical fields (`limits` / `interaction` / `check` / `search` / `format`) moved from every per-prompt record to a global `DEFAULT_AI_INSTRUCTIONS` constant in `app.js`.
- **Data file size: 1.6 MB → 820 KB (−43%)**.
- `_mergeInstructions()` merges default with per-prompt data at render/copy time. UI and copy behavior unchanged.

Future per-prompt overrides are additive: simply add `limits` / `interaction` / … to a specific record.

---

## [v5.2] · Final multi-dimensional audit

### Fixed
- Removed dead `setStorageStatus()` method (its target DOM element had been removed).
- Cleaned up ESC handler residue referencing deleted `dropdownMenu`.
- Platform buttons enlarged from 34×34 → 40×40 on mobile (WCAG touch-target compliance).
- Search suggestion overlay got `max-width: 100vw` + `overflow-x: hidden` to prevent narrow-screen horizontal overflow.
- Colored platform logo focus ring switched from `accent-soft` to `2px solid var(--accent)` for contrast compliance.
- Paste now forces `text/plain` — rich formats from Word / web pages no longer leak into the I/O area.

---

## [v5.1] and earlier

Initial prototype → 930 prompts across 4 sections / 42 categories → dark-navy palette / graphite dark theme → Service Worker offline support → `app/logo/` SVG pack for 7 AI platforms → category tree with lazy prompt rendering → keyboard shortcuts (`/`, `⌘K`, `⌘↵`, `⌘↑↓`, ↑↓↵, ESC) → copy feedback toast → dark/light theme toggle → data-load retry UX → mobile drawer sidebar.

See git history (pre-v5.3) for per-commit detail.

---

## Historical snapshot folders

Through v5.16 the project kept manual milestone folders at `backup/v5.3_*/` … `backup/v5.9_*/`. Those are retired in favor of this file plus annotated git tags. The snapshot folders can be safely deleted once the corresponding tags exist.
