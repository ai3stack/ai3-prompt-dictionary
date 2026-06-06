# Security Policy

This is a **content repository** — the bulk of what's here is JSON data, not executable code. The attack surface is small but not zero. This document covers what we care about, what we don't, and how to report something.

---

## Scope

### In scope (please report)

- **Secrets accidentally committed** to the repo (API keys, SSH keys, deploy tokens) — even if rotated.
- **Malicious content** smuggled into a prompt's `role` / `task` / `framework` fields (prompt injection, data exfiltration patterns, attempts to make end-user LLMs leak system prompts).
- **Vulnerabilities in our scripts** (`scripts/*.py`, `scripts/*.sh`) — e.g., shell injection, path traversal, arbitrary file write.
- **GitHub Actions misconfigurations** in `.github/workflows/` — e.g., over-broad `permissions:`, untrusted-input expansion, third-party Action without pinned SHA.
- **Supply-chain risks** — typosquatted dependencies, compromised actions, suspicious release artifacts.

### Out of scope

- **The end-user website** ([www.ai3stack.com](https://www.ai3stack.com)) — that's a separate repository with its own security policy.
- **End-user LLM behavior** — what ChatGPT / Claude / Gemini does with one of our prompts is the LLM provider's responsibility.
- **The quality of a prompt's wording** — that's a content issue, file an Issue with the `wording fix` template.

---

## How to report

**Do not open a public Issue for security reports.**

| Severity | How to reach us | Expected response |
|---|---|---|
| Critical (active exploit, leaked secret) | Email **ai3@ai3stack.com** with `[SECURITY-CRITICAL]` in subject | Acknowledged ≤24 h |
| High / Medium | Email **ai3@ai3stack.com** with `[SECURITY]` in subject | Acknowledged ≤72 h |
| Low / informational | [GitHub Security Advisory](https://github.com/ai3stack/ai-prompt-dictionary/security/advisories/new) (private) | Acknowledged ≤7 days |

In your report include:
- What you found
- How to reproduce it (command, file path, line numbers)
- Your assessment of impact
- Whether you've disclosed elsewhere

We do **not** offer monetary bounties at this stage. We do credit reporters in [CHANGELOG.md](CHANGELOG.md) and [CONTRIBUTORS.md](CONTRIBUTORS.md) (with permission).

---

## Our commitments

- We acknowledge in the SLA above.
- We patch and disclose within **30 days** for critical/high, **90 days** for medium/low — whichever is reasonable for the issue.
- We will not legally pursue good-faith security research that follows this policy.

---

## Hardening practices in this repo

| Layer | Measure |
|---|---|
| Secrets | None in repo. Deploy keys live in GitHub Environments. `secrets-scan.yml` runs on every PR. |
| Workflows | All third-party Actions pinned to commit SHA. `permissions:` declared explicitly per job. `persist-credentials: false` on `actions/checkout`. |
| Branches | `main` requires PR review and a green Validate check. Force-push disabled. |
| Maintainers | 2FA required on all maintainer accounts. |
| Dependencies | Dependabot tracks GitHub Actions versions weekly. |

---

## Known accepted risks

- The repository is **public**. All prompt content is intended to be world-readable — there is no confidential data here by design.
- We do **not** sign tags / releases with GPG yet. Will revisit at v1.2.

---

*Policy version: 2026-04. Maintainer: [@ai3stack](https://github.com/ai3stack).*
