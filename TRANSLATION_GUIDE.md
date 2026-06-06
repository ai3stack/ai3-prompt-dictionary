# Prompt Data Style Guide

> This dataset is English-only. The original bilingual translation workflow no
> longer applies — there is no Chinese dataset to translate from or to. This
> file is kept as a short style note for anyone adding or editing prompt data.

If you are looking for how to open a PR, mechanics live in
[CONTRIBUTING.md](CONTRIBUTING.md). This page is only about *what good prompt
data looks like*.

---

## Principles for writing a good prompt

### Role · name a real expert, institution, or methodology founder

Anchor the `role` on **named authorities** a US professional would instantly
recognize, rather than a generic descriptor.

| Weak | Strong |
|---|---|
| "Senior HR manager" | "Former Google VP of People Ops Laszlo Bock" |
| "Corporate strategy consultant" | "McKinsey senior partner" |
| "Nutrition department chief" | "Harvard T.H. Chan School of Public Health nutrition professor" |

**Constraint**: use real people or real institutions only. Do not invent names.
If unsure, default to the institution (e.g., "a Harvard Business School
professor") rather than inventing a person.

### Task · imperative, specific, one sentence

Task fields should read like marching orders.

| Weak | Strong |
|---|---|
| "Generate a structurally-clear weekly work report" | "Produce a clear, structured weekly work report" |
| "To complete an analysis of the user requirements" | "Analyze user requirements" |
| "Help me to write a proposal" | "Draft a proposal" |

### Framework · use recognized US-native frameworks

Prefer named, widely recognized frameworks over ad-hoc step lists.

| Task | Use |
|---|---|
| Lesson plan | Madeline Hunter 5-stage: Hook / Direct Instruction / Guided Practice / Independent Practice / Formative Assessment |
| Sales call | SPIN: Situation / Problem / Implication / Need-Payoff |
| Business plan | Y Combinator seed format: Problem / Solution / Why Now / Market / Business Model / Traction / Team / Competition / Ask |

When in doubt, search "\<task\> template site:hbr.org" and use what you find.

### Type · preserve the 10-type taxonomy

The project uses exactly 10 prompt types. **Do not** invent new type names —
the build system uses them as override-table keys (see
`content/en-US/ui.json` → `typeOverrides`):

Routine Report · Specialized Report · Analytical Decision · Standard Operation ·
Process Execution · Collaborative Communication · Creative Expression ·
External Presentation · Self Documentation · Crisis Response

### Name · use the natural US term

The `name` field is the title an end user sees. Use the term US companies
actually use: **PTO Request** (not "Leave Application"), **Expense Report**
(not "Reimbursement Application"), **Performance Review** (not "Performance
Assessment"), **Two-Week Notice Letter** (not "Resignation Application").

**Test**: if you can't search the English name and find it used naturally by US
companies, it's probably wrong.

---

## Quality tiers

Every prompt may carry a `translation_quality` marker:

| Tier | Meaning | How to earn it |
|---|---|---|
| `draft` | First-pass, not yet reviewed | Default for scripted entries |
| `community-reviewed` | A native US English speaker reviewed and approved via PR | Merge a PR that creates or refines the prompt |
| `expert-reviewed` | Reviewed by a domain expert | Maintainers set this, usually after consulting the contributor |

---

## Style checklist (before opening a PR)

Read it aloud. If you pause or wince, rewrite.

- [ ] Would a US professional feel spoken to as a peer — not patronized, not confused?
- [ ] Is `role` anchored on a real expert or institution?
- [ ] Is `task` one imperative sentence?
- [ ] Does `framework` use a recognized US-native template?
- [ ] Is `name` something you can search and find natural US usage for?
- [ ] Is `type` one of the exact 10 type names?
