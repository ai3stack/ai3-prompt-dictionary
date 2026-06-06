# Getting help

Different questions go to different places. Picking the right one will get you an answer fast — and won't get drowned out.

---

## I want to *use* prompts (copy-paste into ChatGPT)

You're in the wrong repo. Go to [www.ai3stack.com](https://www.ai3stack.com).

That site is designed for end users — search, copy, paste, done. This repo is for people who want to *build on* the data.

---

## I found a bad / outdated / awkward prompt

Open a GitHub Issue using one of these templates:

| Issue you spotted | Use this template |
|---|---|
| Wording reads awkward, unclear, or culturally off | [Wording fix](https://github.com/ai3stack/ai-prompt-dictionary/issues/new?template=translation-fix.yml) |
| A prompt is wrong, broken, or produces bad output | [Bug report](https://github.com/ai3stack/ai-prompt-dictionary/issues/new?template=bug-report.yml) |
| You think we should add a new prompt | [Prompt suggestion](https://github.com/ai3stack/ai-prompt-dictionary/issues/new?template=prompt-suggestion.yml) |

Even better: open the JSON file, fix it yourself, and send a PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## I'm building something on top of this dataset

- **Architectural questions** ("how is this organized? what's the schema?") → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/PROMPT_SCHEMA.md](docs/PROMPT_SCHEMA.md).
- **Schema feels wrong / missing a field** → [GitHub Discussions](https://github.com/ai3stack/ai-prompt-dictionary/discussions). Schema changes need an RFC; ad-hoc edits will be closed.
- **You want a feature** ("Could there be an NPM package?") → [Feature request](https://github.com/ai3stack/ai-prompt-dictionary/issues/new?template=feature-request.yml). Check [ROADMAP.md](ROADMAP.md) first; if it's already planned and waiting for an owner, claim it instead.

---

## I want to add or improve prompt data

Read the [prompt data style guide](TRANSLATION_GUIDE.md) first.

For porting to a new language (Japanese, Korean, Spanish…) open a Discussion before doing bulk work — we want to make sure ≥1 native speaker is committing to maintain the locale long-term.

---

## I want to chat / vibe / be in the loop

| What | Where |
|---|---|
| Async discussion, long-form questions | [GitHub Discussions](https://github.com/ai3stack/ai-prompt-dictionary/discussions) |
| Release notifications | "Watch" the repo on GitHub → "Custom" → "Releases" |

> Off-platform channels (Discord, X, WeChat, etc.) are not yet active. They will be added here only after they actually exist.

---

## I think I found a security issue

**Don't post it publicly.** See [SECURITY.md](SECURITY.md).

---

## My question doesn't fit any of these

Open a [Discussion](https://github.com/ai3stack/ai-prompt-dictionary/discussions). If it's the wrong forum, we'll redirect.

We do **not** offer paid support. The maintainer triages issues weekly; expect a response within 7 days.
