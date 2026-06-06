# Governance

This document explains how decisions get made on the AI³ Prompt Dictionary project, who has authority over what, and how contributors can grow into maintainer roles.

## Summary

We are a **BDFL** (Benevolent Dictator For Life) project, maintained by [@ai3stack](https://github.com/ai3stack). This model is chosen deliberately for the current project size (single-digit active contributors). It will evolve as the community grows.

## Roles

### Contributor
- **How to become one**: Submit a PR that gets merged.
- **What you can do**: Open Issues, submit PRs, participate in Discussions.
- **Recognition**: Your name is added to [CONTRIBUTORS.md](CONTRIBUTORS.md) on first merge.

### Reviewer
- **How to become one**: 5+ merged PRs AND active in the project for at least 3 months AND an invite from the BDFL.
- **What you can do**: Everything a Contributor can, plus: add labels to Issues / PRs, formally leave `Approve` / `Request Changes` on PRs. Your review is considered in merge decisions.
- **What you cannot do**: Merge PRs. Close others' Issues without discussion.

### Committer
- **How to become one**: 20+ merged PRs AND active for 6+ months AND the BDFL invites you.
- **What you can do**: Everything a Reviewer can, plus: merge content-type PRs (prompt / wording / docs) after a clean CI run. Create new Issue labels. Manage CONTRIBUTORS.md.
- **What you cannot do**: Merge PRs that change schema, build pipeline, or governance documents. Those still route to the BDFL.

### BDFL (Benevolent Dictator)
- **Currently**: [@ai3stack](https://github.com/ai3stack).
- **What they do**: Final decision on disputes, schema changes, architecture changes, governance changes, new Committer invitations.
- **Succession**: If @ai3stack steps down or becomes unreachable for 90+ days, existing Committers can nominate a replacement BDFL by a 2/3 majority vote among Committers. If no Committers exist at that point, the longest-active Reviewer takes the seat.

## Decision types

| Decision type | Who decides | Typical time |
|---|---|---|
| Merge a wording-fix PR | Any Committer | 7 days |
| Merge a new-prompt PR | Any Committer (after native-speaker review) | 7–14 days |
| Merge a bug-fix PR | Any Committer | 7 days |
| Merge a feature PR | BDFL | 14 days |
| Change the prompt schema | BDFL (after public RFC Issue, ≥48h discussion) | 14 days |
| Add a new language (`content/ja-JP/` etc.) | BDFL (after public RFC, ≥7 days discussion) | 30 days |
| Change governance (this document) | BDFL (after public RFC, ≥14 days discussion, Committer input) | — |
| Adjust CODE_OF_CONDUCT | BDFL | — |

## Request for Comments (RFC) process

For schema changes, new languages, or significant features:

1. Open a **Discussion** (not an Issue) titled `[RFC] <proposal>`.
2. Include: motivation, proposed change, alternatives considered, impact on existing content.
3. Stay open for the minimum window (see the Decision Types table above). Comment, iterate.
4. The BDFL closes with either **Accepted**, **Declined**, or **Needs More Discussion**.
5. If Accepted, the BDFL or a designated contributor opens the implementation PR.

No action should be taken on the accepted design until the RFC is explicitly closed as accepted.

## Conflict resolution

- **Disagreement on wording**: prefer the version a native US-English speaker endorses. If still unresolved, BDFL decides. (See the [style guide](TRANSLATION_GUIDE.md).)
- **Disagreement on content inclusion**: default to exclusion if the prompt doesn't clearly serve a common real-world task.
- **CoC violations**: see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — enforced by BDFL, reported to `ai3@ai3stack.com`.

## Transparency

- All significant decisions happen in public (Issues, Discussions, PRs). Private maintainer discussions are limited to CoC enforcement and security disclosures.
- The CHANGELOG includes every merged content or code change.
- Quarterly, the BDFL will post a "State of the project" Discussion with traffic stats, PR throughput, and roadmap updates.

## Financial

The project has no budget and no treasury. Hosting costs (~$30/mo) are currently paid by the BDFL. If the project reaches GitHub Sponsors or donation support, the BDFL will publish an annual transparency report covering income and spending.

We will never:
- Accept payment to include a specific prompt.
- Add a paywall to any content.
- Sell user data.
- Insert advertising.

---

## Changelog for this document

- **2026-04-23** — Initial version.
