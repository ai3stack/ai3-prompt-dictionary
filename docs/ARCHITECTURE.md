# Architecture

> A 10-minute tour of what's inside this repository. Read before opening anything outside `content/`.

## What this repo is — and isn't

This repo is **a versioned, structured, English JSON dataset** with thin Python tooling to validate, merge, and release it. That's it.

It is **not** a website, an SPA, a static-site generator, an MCP server, a browser extension, a plugin, or a deployment system. Those concerns live outside this repository, and the extension/plugin surfaces are canceled for the current product by [DECISIONS.md D-0007](DECISIONS.md). Downstream consumers treat this repo as their **upstream source of truth** — they pull from a release tag, they don't build from `main`.

```
                  Contributor PR  →  CI validates  →  BDFL merges
                                                          │
                                  content/ (source of truth)
                                                          │
                                       scripts/merge_content.py
                                                          ▼
                                       locales/{lang}/prompts_index.json
                                                          │
                              ┌───────────────────────────┼─────────────────────────┐
                              ▼                           ▼                         ▼
                  GitHub Release tarball    Consumer website repo       Third-party tools
                  (deploy.yml on tag)       (pulls release on demand)   (NPM, CLI, apps)
```

## Directory layout

```
ai-prompt-dictionary/
│
├── content/                    ← source of truth (90% of PRs land here)
│   └── en-US/
│       ├── prompts/
│       │   ├── 01-core.json        core / general prompts
│       │   ├── 02-industry.json    industry-specific
│       │   ├── 03-lifestyle.json   daily life
│       │   └── 04-public.json      public affairs
│       ├── categories.json         42 category definitions
│       └── ui.json                 UI strings + i18n config
│
├── scripts/
│   ├── validate_prompts.py     ← schema + consistency checker (run by CI)
│   ├── merge_content.py        ← content/ → flat runtime JSON bundles in locales/
│   └── export_dictionary.py    ← export merged dataset to a single Markdown file
│
├── docs/
│   ├── ARCHITECTURE.md         ← you are here
│   ├── PROMPT_SCHEMA.md        ← canonical record schema (the contract)
│   ├── DEPLOYMENT.md           ← how releases happen + how consumers pull
│   └── DECISIONS.md            ← decision log (D-0001 onward)
│
├── .github/
│   ├── workflows/
│   │   ├── validate.yml            on PR: schema + consistency
│   │   ├── build-preview.yml       on PR: diff summary in PR comment
│   │   ├── deploy.yml              on tag: package + GitHub Release
│   │   └── secrets-scan.yml        on PR: secret-leak guard
│   ├── ISSUE_TEMPLATE/             4 templates (wording / prompt / bug / feature)
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   ├── FUNDING.yml                 (sponsor entries — gated until ≥500 stars)
│   └── dependabot.yml              weekly Actions-version updates
│
└── (root docs)
    README.md
    LICENSE (MIT)
    CONTRIBUTING.md / TRANSLATION_GUIDE.md
    GOVERNANCE.md / CODE_OF_CONDUCT.md
    SECURITY.md / SUPPORT.md
    CHANGELOG.md / ROADMAP.md
    CONTRIBUTORS.md
```

Everything else (SPA `app.js`, `build_static.py`, nginx configs, OG image generator, `dist-en/`, `service-worker.js`) lives in the **consumer-website repository** — not here.

## Core flows

### 1. The validation flow (every PR)

```
PR opens  →  validate.yml (paths-filtered to content/ + scripts/)
              │
              ├── python3 scripts/merge_content.py    (build runtime JSON in /tmp)
              └── python3 scripts/validate_prompts.py
                    ├── required fields present
                    ├── id format + uniqueness
                    ├── section_code / category_code consistency
                    ├── ai_instructions field types
                    ├── name ↔ content semantic check (catches copy-paste bugs)
                    └── slug uniqueness
```

If any check fails, the PR cannot merge. Detail of each check is in [PROMPT_SCHEMA.md](PROMPT_SCHEMA.md) §Validation.

### 2. The preview flow (every PR)

```
PR opens  →  build-preview.yml (paths-filtered)
              │
              ├── merge content (PR head)
              ├── checkout base ref, merge content (base)
              ├── diff: ±counts per section, translation_quality histogram
              ├── upload merged-locales artifact (.json, retention 14d)
              └── sticky-comment the summary on the PR
```

Reviewers get a one-click view of what the PR actually changes — without checking out the branch.

### 3. The release flow (on tag push)

```
Maintainer pushes v1.0.0 tag
       │
       ▼
deploy.yml
       ├── re-validate dataset
       ├── re-merge into locales/en-US/*.json
       ├── package:
       │     ai3-prompt-dictionary-v1.0.0-en-US.json
       │     ai3-prompt-dictionary-v1.0.0-bundle.zip
       │     SHA256SUMS
       └── publish GitHub Release with auto-notes
                 │
                 ▼
       Downstream consumers pull (curl / wget / their CI)
```

`main` itself is **not** schema-stable between two release tags. Production consumers must pin to a tagged release. See [DEPLOYMENT.md](DEPLOYMENT.md).

### 4. The two-stage gate (merge ≠ ship)

This repo never deploys to anyone's server. Consumers (the consumer-website repo, third-party tools) pull from **release tags**, not from `main`. A contributor's PR travels through two distinct gates:

```
Contributor PR
   ↓
CI green + BDFL review pass
   ↓
[ Stage 1: Merge gate — automatic ]
   ↓
Merged to main           ← latest valid state, but NOT shipped anywhere
   ↓
   …several merges may accumulate here…
   ↓
Maintainer decides "this batch is shippable"
   ↓
[ Stage 2: Release gate — manual ]
   ↓
git tag -a v1.x.y && git push origin v1.x.y
   ↓
deploy.yml packages the dataset and publishes a GitHub Release
   ↓
Downstream consumers pull from the release, on their own schedule
```

The decision rationale — separating "data validity" (automatic, CI-enforced) from "shipping decision" (manual, maintainer judgment) — is recorded as [DECISIONS.md D-0005](DECISIONS.md).

**This repo does not know, and does not care, what consumers do with a release.** The consumer-website repo deploys to its own servers on its own schedule. Data packages, CLI tools, and third-party apps publish on theirs. Extension/plugin surfaces are not active product surfaces.

## Schema discipline

The schema in [PROMPT_SCHEMA.md](PROMPT_SCHEMA.md) is a **stable contract**. Downstream tools depend on it. Field renames or removals would break everyone.

Rules:

1. **Adding** an optional field is fine — bump minor version (`v1.0.0 → v1.1.0`).
2. **Removing** or **renaming** any field is a major version (`v1.x.y → v2.0.0`) and requires an RFC.
3. **Changing the meaning** of a field without renaming is forbidden — rename instead.
4. The `id` (`AI³-NNNNN`) is permanent. A prompt's ID never changes, even if its content is rewritten or its category is moved. This lets downstream tools cache by ID safely.

## Quality discipline

Records may carry `translation_quality ∈ {draft, community-reviewed, expert-reviewed}`. Default (when absent) is `draft`. The decision and rationale is [DECISIONS.md D-0003](DECISIONS.md).

This is honest signaling to downstream consumers — they can filter `draft` out if they want only vetted prompts.

## What "the codebase" looks like in practice

| Surface | Lines | Where to start reading |
|---|---|---|
| Data | ~50,000 lines of JSON | `content/en-US/prompts/01-core.json` |
| Validator | ~200 lines | `scripts/validate_prompts.py` |
| Merger | ~100 lines | `scripts/merge_content.py` |
| Markdown exporter | ~330 lines | `scripts/export_dictionary.py` |
| CI | 4 workflows | `.github/workflows/validate.yml` |

The whole engineering surface is intentionally tiny. **The value is in the data.**

## Adding a new language

Out-of-scope for v1.0, but the path is:

1. Open a Discussion proposing a new locale code (e.g., `ja-JP`). Confirm ≥1 committed native maintainer.
2. Copy `content/en-US/` to `content/<locale>/` as scaffolding.
3. Translate `categories.json` and `ui.json` first (small, blocks everything else).
4. Translate prompts incrementally, marked `translation_quality: "draft"`.
5. Once 50+ prompts and the UI strings are done, propose adding the locale to `merge_content.py`'s locale list.
6. New locale gets included in the next release tag's bundle.

No code changes are needed in this repo until step 5.

## What this repo deliberately doesn't have

- **A package.json or node_modules** — there is no JS runtime here.
- **A web framework or SPA** — those live in the consumer-website repo.
- **A database** — the data *is* the database, version-controlled in git.
- **Server-rendered components** — out of scope for a dataset.
- **A CI pipeline that auto-deploys to production** — by design. See "cross-repo gate" above.
- **MCP, browser extension, Chrome Web Store, VS Code extension, or plugin code** — canceled by D-0007.
