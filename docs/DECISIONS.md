# Decision log

Per [GOVERNANCE.md §4.4](../GOVERNANCE.md), all non-trivial governance / content / schema decisions land here. The point of this log is so that **two years from now nobody has to re-litigate the same argument**.

## Format

Each decision gets a single block:

```
### YYYY-MM-DD · D-NNNN · Short title

**Context.** What was the question? What sparked it?
**Decision.** What did we decide?
**Rationale.** The 1–3 reasons that won.
**Consequences.** What changes / what we're now committed to.
**Status.** Active / Superseded by D-NNNN / Reverted on YYYY-MM-DD.
**Decided by.** BDFL / Committers vote / RFC vote (link to thread).
```

IDs are sequential (`D-0001`, `D-0002`…). Dates use China Standard Time.

---

## Active decisions

### 2026-04-23 · D-0001 · Repository split: dictionary vs. consumer website

**Context.** Until 2026-04-23, the dictionary content and the consumer SPA lived in the same repository. Mixing the two had two costs: (a) PRs that touched only data still ran the full website CI; (b) external contributors looking at the repo had to wade past website code before reaching the data.

**Decision.** Split into two repositories. **ai-prompt-dictionary** (this one, public, MIT) holds `content/`, validation scripts, and governance. The consumer website lives in a separate, currently private repository and consumes `content/` as its upstream.

**Rationale.**
1. 90% of valuable PRs are content changes; the dictionary repo should be optimized for that path.
2. Clear license boundary: the data is MIT; the website's UI/branding is not the same kind of asset.
3. Easier to add additional consumers later (NPM package, CLI, third-party apps) without entangling them with a specific website's needs.

**Consequences.** This repo's `ROADMAP.md` only covers data / tool features. Consumer-site UX roadmap moved out. CI's `deploy.yml` will publish a release artifact rather than rsync to a server.

**Supersession note (2026-06-15).** A 2026-06-07 amendment briefly treated an assistant-connector / MCP package as colocated with this repository. That amendment is superseded by D-0006: MCP / `prompts-mcp` is not part of the current Prompt 930 release surface.

**Status.** Active.
**Decided by.** BDFL.

---

### 2026-04-23 · D-0002 · One JSON file per section, not per prompt

**Context.** Three packaging options for 930 prompts:
1. Single monolithic file (`prompts_index.json`).
2. One file per section (4 files, 87–348 prompts each).
3. One file per prompt (930 files).

**Decision.** Option 2 — one JSON per section, under `content/{locale}/prompts/{NN-section}.json`.

**Rationale.**
1. Option 1: every PR changes the same file → diff noise, frequent merge conflicts, awful blame.
2. Option 3: 930 small files = slow `git clone`, hard to spot patterns across a section, scripts must enumerate.
3. Option 2: 4 files is small enough that any PR usually touches one; large enough that section-wide refactors stay coherent.

**Consequences.** `merge_content.py` does the runtime concat. Section file boundaries (`section_code` 01–04) are a hard schema invariant — moving a prompt across files is a schema-level operation requiring an RFC.

**Status.** Active.
**Decided by.** BDFL.

---

### 2026-04-23 · D-0003 · `translation_quality` is a 3-tier ladder

**Context.** Bulk-translating 918 EN prompts means most will be machine-assisted drafts. Hiding that fact from downstream users is dishonest; refusing to publish drafts kills the project's velocity.

**Decision.** Every non-source-locale prompt carries `translation_quality ∈ {draft, community-reviewed, expert-reviewed}`. Default (and absence) = `draft`. Promotion happens via PR review (draft → community-reviewed) and explicit BDFL stamp (community → expert).

**Rationale.**
1. Honest signaling — downstream consumers can choose to filter.
2. A clear promotion path turns review effort into visible status.
3. No quality bar for *first* submission means contributors can land work fast.

**Consequences.** UI must surface the badge somewhere unobtrusive. Validate script enforces the enum. The dataset is publishable with mostly-draft labels — that's expected, not embarrassing.

**Status.** Active.
**Decided by.** BDFL.

---

### 2026-04-23 · D-0004 · License: MIT (not CC-BY, not CC-BY-SA)

**Context.** Three reasonable choices for a structured prompt dataset: MIT (code license), CC-BY (data license, attribution required), CC-BY-SA (attribution + share-alike).

**Decision.** MIT, applied to the entire repo (data + scripts).

**Rationale.**
1. Maximum reuse — any company / individual can fork and ship without legal review.
2. CC-BY-SA's copyleft would deter commercial integrations, the very kind of adoption that grows the project.
3. MIT on data is unconventional but defensible — most of the value is in the *structure* and *organization*, which is closer to a software contribution than a literary work.

**Consequences.** We cannot retroactively go more restrictive. A future "CC-BY for non-trivial translations" carve-out would be confusing — better to accept MIT as the simple ground truth.

**Status.** Active.
**Decided by.** BDFL.

---

### 2026-04-25 · D-0005 · Server deployment is gated by maintainer tag-push, not by PR merge

**Context.** A naive open-source flow is: contributor PR merges → main updates → server auto-deploys. That conflates two distinct decisions: "is this change valid?" (automatic, CI's job) and "should this change be live for end users right now?" (judgment call, maintainer's job). Without separation, a single typo PR in the middle of the night could replace what 5,000 daily users see, with no human review of the *batched* result.

**Decision.** Two-stage gate.

1. **Stage 1 — Merge gate (automatic).** PR merges to `main` after CI green + reviewer approval. `main` represents *the latest valid state of the dataset*. **Nothing user-facing changes** when this happens.
2. **Stage 2 — Release gate (manual).** When the maintainer judges accumulated changes worth shipping (could be 1 PR or 50), they push a SemVer tag (`git tag -a v1.x.y && git push origin v1.x.y`). `deploy.yml` publishes a GitHub Release with packaged artifacts. The consumer website repo (separate) picks up the release — either via a release-watcher workflow gated on a `production` environment requiring required-reviewer approval, or via manual `workflow_dispatch` by the maintainer.

The maintainer thus has two distinct moments of agency: (a) reviewing & merging individual PRs, (b) deciding *when* a batch is shippable.

**Rationale.**
1. **Separation of concerns.** Data validity (rule-checkable) and shipping decisions (judgment-based) are different problems and deserve different mechanisms.
2. **Batching.** Five small translation fixes shipped together generate one release note and one cache invalidation, not five.
3. **Rollback simplicity.** "Revert to previous release tag" is one command. "Revert to the state of `main` 17 commits ago" is not.
4. **Cross-repo cleanliness.** This repo (data) and the website repo (frontend display) stay decoupled. The website's deployment is controlled by the website repo, not by this one.
5. **Maintainer sleep schedule.** PRs can be merged at any hour; production updates happen on the maintainer's intentional schedule.

**Consequences.**
- `deploy.yml` triggers on tag push only — never on `main` commit.
- The website repo carries its own deploy workflow that pulls *from* this repo's releases. We do not add server SSH keys to this repo's secrets.
- Release tags are the public version timeline; `main` history is the engineering timeline. They diverge and that's fine.

**Status.** Active.
**Decided by.** BDFL.

---

### 2026-06-15 · D-0006 · Prompt 930 release surface excludes MCP / prompts-mcp

**Context.** Prompt 930 is being prepared as AI3's first formal product project. The product scope at the time included the 930-prompt dataset, the hosted dictionary website, the browser extension, image/operations assets, and open-source distribution from this repository. A prior 2026-06-07 assistant-connector / MCP narrative was cut from the current product plan.

**Decision.** Do not ship, document, or promote MCP / `prompts-mcp` as part of the current Prompt 930 release surface. This repository's active release artifacts remain the validated JSON dataset bundle, release checksums, governance docs, and contributor tooling. Any future connector must come through a separate product decision and implementation plan.

**Rationale.**
1. The current launch needs one stable open-source data contract before adding assistant runtime surfaces.
2. MCP would add packaging, client setup, support, and security obligations that are outside the approved Prompt 930 baseline.
3. The hosted website and GitHub release artifacts already cover the current end-user, integrator, and DevRel paths.

**Consequences.** README, deployment docs, release notes, and public launch copy must not instruct users to install `prompts-mcp` or present MCP as active. Historical changelog entries may remain as history only when clearly superseded.

**Status.** Active.
**Decided by.** BDFL.

### 2026-06-15 · D-0007 · Prompt 930 cancels MCP, extensions, and plugin surfaces

**Context.** After the website went production-live, the product owner decided not to pursue MCP, browser extensions, Chrome Web Store distribution, VS Code extensions, or plugin packaging for Prompt 930. The active product should be the hosted website plus the structured open-source dataset/release artifacts.

**Decision.** Remove active code, release claims, roadmap items, and operations paths for MCP / `prompts-mcp`, browser extensions, Chrome Web Store, VS Code extensions, and plugin packaging. Do not present these as backlog, store-review candidates, or future launch channels for the current product.

**Rationale.**
1. The website and dataset release are enough for the current product surface.
2. Runtime connectors and extensions create support, security, and store-review obligations that are not worth carrying.
3. A narrower launch path keeps Prompt 930 focused on data quality, website use, and GitHub release distribution.

**Consequences.** The active implementation tree removes `browser-extension/`. Public release copy and launch operations must not mention extension install paths, Chrome Web Store upload, VS Code extension plans, plugins, MCP, or `prompts-mcp`. Historical evidence may still mention prior prepared-but-canceled work as history only.

**Status.** Active.
**Decided by.** BDFL.

---

## Superseded / reverted decisions

*(none yet)*

---

## Adding a new entry

1. Pick the next `D-NNNN`.
2. Open a PR that adds the block to "Active decisions" (or moves an existing one to "Superseded").
3. PR title: `docs: D-NNNN <short title>`.
4. The PR itself is the decision record — discussion happens in the PR thread, the merged commit is the ratification.
