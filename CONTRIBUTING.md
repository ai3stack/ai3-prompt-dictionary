# Contributing to AI³ Prompt Dictionary

Thanks for your interest! This project is a curated English (en-US) dictionary of 930+ structured AI prompts. Its value lives in the **content** much more than the code, so **90% of useful PRs are content changes** — improving a role, sharpening a task, adding a new prompt.

---

## Who this guide is for

- Anyone who has spotted an awkward or unclear prompt and can suggest a better one
- Users who want to add prompts for use cases the dictionary is missing
- Developers who want to fix bugs or add features to the build pipeline
- Designers who want to improve the OG covers or icon set

**Not** for end users who just want to *use* prompts — they should visit [dict.ai3stack.com](https://dict.ai3stack.com) and never have to read this file.

---

## Types of contributions, ranked by how easy they are to merge

### 🟢 Easiest to merge: content fixes (no code changes)

1. **Fix a prompt** — Edit one prompt inside `content/en-US/prompts/*.json`, open a PR.
2. **Add a prompt** — Pick a category that's sparsely populated, follow the schema, submit.
3. **Sharpen wording** — Improve an unclear `role`/`task`/`framework` (see [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) for the style guide).
4. **Fix a typo** — In any doc or UI string.

These PRs get merged quickly because they touch one file and don't need regression testing.

### 🟡 Medium effort: schema / UX tweaks

- Adjusting category labels (`content/en-US/categories.json`)
- Improving UI strings (`content/en-US/ui.json` — menu labels, toast text, placeholders)
- Suggesting a new section or category (requires discussion first → open an Issue)

### 🔴 Larger: code / architecture changes

- Build-pipeline changes
- New tooling (CLI, NPM package, validators)
- New language support (e.g., adding `ja-JP`)

**For anything in this tier, please open an Issue first** to discuss before spending time on a PR. Rejection-after-implementation is painful for everyone.

---

## Before you start

### Read

- [README.md](README.md) — high-level overview
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the code is organized
- [docs/PROMPT_SCHEMA.md](docs/PROMPT_SCHEMA.md) — exact fields a prompt must have
- [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) — prompt data style guide (read before editing prompts!)

### Install

```bash
git clone https://github.com/ai3stack/ai-prompt-dictionary.git
cd ai-prompt-dictionary

# Python 3.9+ is required; no other runtime deps for validation
python3 scripts/validate_prompts.py   # should print "OK: all locales passed"

# Merge content/ into runtime JSON (downstream consumers do the same):
python3 scripts/merge_content.py
# → produces locales/en-US/prompts_index.json, etc.

# To preview a single prompt by ID (Python only — no extra deps required):
python3 -c "import json; r=[p for p in json.load(open('locales/en-US/prompts_index.json')) if p['id']=='AI³-00042']; print(json.dumps(r[0] if r else None, ensure_ascii=False, indent=2))"
```

> If you want to see your prompt rendered on a real UI, that's the consumer-website repository's concern, not this one. This repo only ships and validates the data — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## How to make your first contribution

### Scenario A: I found a badly worded prompt

Say `content/en-US/prompts/01-core.json` has a prompt whose `name` is "Leave Application" but you know that in the US context it should be "PTO Request":

1. **Open an Issue first** using the `Prompt Fix` template. Paste the prompt ID, the current text, your suggestion, and your reasoning.
2. A maintainer (or you, if you want) opens a PR modifying only that prompt's fields.
3. Run `python3 scripts/validate_prompts.py` locally to make sure the schema still checks.
4. Push, open the PR, link the Issue.

The maintainer will typically merge within 7 days. If the phrasing is debatable, we might ask another contributor to chime in before merging.

### Scenario B: I want to add a prompt the dictionary is missing

1. Check `content/en-US/prompts/*.json` to confirm it doesn't already exist (search by keyword).
2. Pick the right category code (see `content/en-US/categories.json`).
3. Assign the next available `AI³-NNNNN` ID (see `docs/PROMPT_SCHEMA.md` for ID rules).
4. Write the prompt following the [style guide](TRANSLATION_GUIDE.md).
5. Open the PR.

**Keep new prompts focused on real use cases people actually have, not edge-case stunts.** A prompt for "weekly status report" is useful to thousands of readers; one for "write a haiku about my cat in the voice of Werner Herzog" is a party trick.

### Scenario C: I found a bug in the dataset or the tooling

1. Open an `Issue` (bug report template). Make clear whether it's a **data** bug (a prompt is wrong/incomplete/inconsistent) or a **tooling** bug (a script crashes, the validator misses a case, CI is broken).
2. If you want to fix it, comment on the Issue before starting.
3. PR should include: the fix + one-line explanation of root cause.

> Found a bug on the consumer website (the actual `dict.ai3stack.com` UI)? Report it in the **website repository's** issue tracker, not here. This repo doesn't ship UI.

---

## PR checklist (copy into your PR description)

```markdown
- [ ] I read TRANSLATION_GUIDE.md (if this is a translation PR)
- [ ] Ran `python3 scripts/validate_prompts.py` — passes
- [ ] The PR touches ≤ 5 prompts, **or** there's prior discussion in an Issue
- [ ] No hard-coded secrets, API keys, or personal info
- [ ] If I added dependencies: I didn't (we're dependency-free by design)
```

---

## Code style (for the rare code PR)

- **Python**: PEP 8, 4-space indent, type hints where the benefit is obvious. No black / ruff enforcement; keep diffs small.
- **Comments**: explain *why*, not *what*. Zero multi-line JSDoc blocks.

> This repository is data + Python tooling only. There is no JavaScript, no CSS, no frontend code here — those live in the consumer-website repository.

---

## Governance

This is a **Benevolent Dictator (BDFL)** project, maintained by [@ai3stack](https://github.com/ai3stack). See [GOVERNANCE.md](GOVERNANCE.md) for how decisions get made, how you become a Committer, and what the escalation path looks like.

---

## What happens after you submit a PR

1. **GitHub Actions** runs `validate_prompts.py` and posts a diff summary on the PR (≈ 30 s).
2. A maintainer labels (`translation`, `prompt-suggestion`, `bug`, `good-first-issue`, …) and reviews within ~7 days.
3. On merge, your change lands in `main`. **It does *not* automatically appear on any consumer website** — that's a separate decision (see [docs/DECISIONS.md D-0005](docs/DECISIONS.md)). The maintainer batches accumulated merges and pushes a release tag (e.g., `v1.0.3`) when ready, which triggers a GitHub Release. Downstream consumers (including the consumer website) pull from that release.
4. Your name joins [CONTRIBUTORS.md](CONTRIBUTORS.md) on your first merged PR.

---

## Code of Conduct

Be kind, assume good faith, focus criticism on ideas not people. Full text in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) (Contributor Covenant 2.1). Violations → please email the maintainer at `ai3@ai3stack.com`.

---

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE). You retain copyright; you grant the project and downstream users the permissions MIT confers.

---
