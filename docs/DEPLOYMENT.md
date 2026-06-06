# Releases & consumption

This repository is a **dataset**, not a website. There is nothing to deploy to a server *from this repo*. Instead, releases are published as versioned GitHub artifacts; downstream consumers (websites, NPM packages, CLI tools, third-party apps) pull from those artifacts.

> Looking for the consumer website's deployment? That's a separate repository — see its own `docs/DEPLOYMENT.md`. The repository split rationale is recorded in [docs/DECISIONS.md D-0001](DECISIONS.md).

---

## How a release happens

Maintainers cut a release by pushing a SemVer tag:

```bash
git tag -a v1.0.0 -m "v1.0.0 — public launch"
git push origin v1.0.0
```

`.github/workflows/deploy.yml` then:

1. Re-runs the validator (`scripts/validate_prompts.py`) on the tagged commit.
2. Runs the merger (`scripts/merge_content.py`) to produce flat runtime JSON.
3. Packages three artifacts:
   - `ai3-prompt-dictionary-<tag>-en-US.json` — English prompts, flattened
   - `ai3-prompt-dictionary-<tag>-bundle.zip` — full bundle (prompts + categories + UI strings)
   - `SHA256SUMS` — checksum file
4. Creates a GitHub Release with auto-generated notes (links to schema and CHANGELOG) and attaches the artifacts.

Pre-releases (`v1.0.0-rc1`, `v1.0.0-beta`) are auto-flagged as pre-release on GitHub.

For a dry run without creating a release, trigger the workflow via the **Run workflow** button on the Actions tab — choose any tag string, no GitHub Release will be created.

---

## Versioning

We follow [SemVer](https://semver.org/) once we hit `v1.0.0`:

| Bump | When |
|---|---|
| Major (`v2.0.0`) | Breaking schema change (field renamed/removed; `id` format changes; section codes reshuffled) |
| Minor (`v1.1.0`) | Schema-additive change (new optional field), new locale, +50 prompts in a batch |
| Patch (`v1.0.1`) | Prompt fixes, wording improvements, doc edits — no schema impact |

Release cadence: **as needed**, not on a calendar. Most months will see 1–2 patch releases.

---

## Consuming a release

### Quick: download a single locale

```bash
TAG=v1.0.0
curl -fLO "https://github.com/ai3stack/ai-prompt-dictionary/releases/download/${TAG}/ai3-prompt-dictionary-${TAG}-en-US.json"
```

The file is a plain JSON array — every element matches [docs/PROMPT_SCHEMA.md](PROMPT_SCHEMA.md).

### Verify the download

```bash
curl -fLO "https://github.com/ai3stack/ai-prompt-dictionary/releases/download/${TAG}/SHA256SUMS"
sha256sum -c SHA256SUMS
```

### Bundle (prompts + metadata)

```bash
TAG=v1.0.0
curl -fLO "https://github.com/ai3stack/ai-prompt-dictionary/releases/download/${TAG}/ai3-prompt-dictionary-${TAG}-bundle.zip"
unzip ai3-prompt-dictionary-${TAG}-bundle.zip -d ai3-data
```

After unzip:

```
ai3-data/
└── en-US/
    ├── prompts_index.json
    ├── categories_index.json
    └── ui.json
```

### Building from source instead

For consumers who want the latest unreleased state of `main`:

```bash
git clone https://github.com/ai3stack/ai-prompt-dictionary.git
cd ai-prompt-dictionary
python3 scripts/merge_content.py
# → locales/en-US/prompts_index.json
```

Note: `main` is *not* guaranteed schema-stable between two release tags. For production, pin to a release.

---

## Release checklist (maintainers only)

Before pushing a tag:

- [ ] All open `release-blocker` issues closed
- [ ] `CHANGELOG.md`'s `[Unreleased]` block moved under the new version with today's date
- [ ] `python3 scripts/validate_prompts.py` passes locally
- [ ] `python3 scripts/merge_content.py` produces sane output (spot-check `locales/en-US/prompts_index.json` — at least one entry per section)
- [ ] If the schema changed: `docs/PROMPT_SCHEMA.md` updated, RFC linked in CHANGELOG, version bumped major
- [ ] No new dependencies added without justification

After the release workflow finishes:

- [ ] Release page renders correctly (3 artifacts + notes)
- [ ] Download a random artifact, verify against SHA256SUMS
- [ ] Announce on Discussions (additional channels will be added once they exist)

---

## Rollback

We don't unpublish bad releases — that breaks pinning for downstream consumers. Instead:

1. Mark the bad release "as draft" (hides from default view but preserves URLs).
2. Cut a `+0.0.1` patch release with the fix.
3. Note the issue in `CHANGELOG.md`.

If a release leaks a secret or contains malicious content, follow [SECURITY.md](../SECURITY.md) — that path *does* warrant deletion.

---

## Non-goals

- **Server deployment from this repo** — see [docs/DECISIONS.md D-0001](DECISIONS.md). The consumer website handles its own deployment.
- **NPM / PyPI publishing** — planned for v1.x but waits on an external owner. See [ROADMAP.md](../ROADMAP.md).
- **Semantic-Versioning bot / automated release notes** — overkill at current cadence; manual notes are higher-quality.
