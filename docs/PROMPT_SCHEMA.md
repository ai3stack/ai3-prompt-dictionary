# Prompt Schema

The canonical shape of a single prompt record, as stored in `content/{locale}/prompts/{section}.json`.

## Minimal example

```json
{
  "id": "AI³-00001",
  "name": "Weekly Report",
  "input_section": "Describe your requirements and context...",
  "ai_instructions": {
    "role": "OKR methodology inventor & former Intel CEO Andy Grove",
    "task": "Produce a clear, structured weekly work report",
    "type": "Routine Report",
    "framework": [
      "- Period: time range",
      "- Core Focus: weekly priorities, ranked",
      "- Key Results: deliveries, quantified metrics, business impact"
    ]
  },
  "version": "V1.0",
  "section_code": "01",
  "section_name": "Core & General",
  "category_code": "01-01",
  "category_path": "01-core"
}
```

## Field reference

### Top-level fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | **yes** | Format `AI³-NNNNN` (five-digit zero-padded). Permanent and stable; same ID maps the same conceptual prompt across any future locales. |
| `name` | string | **yes** | Human-readable title. **Use the natural US-business term**, not a generic descriptor (see the [style guide](../TRANSLATION_GUIDE.md)). |
| `input_section` | string | **yes** | Placeholder text shown in the I/O input area. By convention: a short "describe your…" prompt. |
| `ai_instructions` | object | **yes** | See below. |
| `version` | string | **yes** | `V1.0` by default; bumped on material content changes. |
| `section_code` | string | **yes** | Two-digit section ID (`01`–`04`). Must match the filename the record lives in (`01-core.json` → `"01"`). |
| `section_name` | string | **yes** | Human-readable section name in the current locale. |
| `category_code` | string | **yes** | `NN-NN` format where the prefix matches `section_code`. Must exist in `content/{locale}/categories.json`. |
| `category_path` | string | **yes** | Slug used in internal paths (`01-core`, `02-industry`, `03-life`, `04-public`). |
| `translation_quality` | string | optional | `draft` / `community-reviewed` / `expert-reviewed`. Absent = treat as draft. A review-status marker on each `en-US` record. |

### `ai_instructions` fields

| Field | Type | Required | Role at runtime |
|---|---|---|---|
| `role` | string | **yes** | The persona the AI adopts. Should reference a real expert or institution (see the [style guide](../TRANSLATION_GUIDE.md)). |
| `task` | string | **yes** | What the AI is being asked to do. Imperative, one sentence. |
| `type` | string | **yes** | One of the 10 canonical types (see below). May include a `→` suffix for sub-intent, e.g. `"Routine Report → upward visibility, show value"`. |
| `framework` | string[] | **yes** | Ordered list of bullet lines that structure the AI's output. Each line starts with `- `. |
| `limits` | string[] | optional | Per-prompt override of global default `limits`. Leave empty to inherit the type-default. |
| `interaction` | string[] | optional | Same pattern. |
| `check` | string[] | optional | Same pattern. |
| `search` | string | optional | Instruction re: web search. Inherits type default if absent. |
| `style` | string | optional | Voice / tone hint. Inferred from type + name if absent via `styleOverrides` in `content/en-US/ui.json`. **Convention:** omit `style` on English records — inline strings read clunky and `styleOverrides` already covers all 10 types. Set it only when you have a specific reason. |
| `format` | string | optional | Output format hint (e.g., "Markdown", "plain text, no markers"). Inherits type default. |

### The 10 canonical types

| Type (`en-US`) |
|---|
| Routine Report |
| Specialized Report |
| Analytical Decision |
| Standard Operation |
| Process Execution |
| Collaborative Communication |
| Creative Expression |
| External Presentation |
| Self Documentation |
| Crisis Response |

Type is the single most important field besides `name` because it drives automatic overrides of `limits`, `check`, `search`, `style`, and `format` at render time. Choose carefully — and use the exact string.

## Validation

`scripts/validate_prompts.py` enforces:

1. **Required fields present** on every record.
2. **`id` format** matches `AI³-NNNNN` and is globally unique.
3. **`section_code`** is one of `01`–`04`; **`category_code`** matches `NN-NN` and shares its prefix with `section_code`.
4. **Type correctness**: field types match (`role` is string, `framework` is array, etc.).
5. **Semantic consistency**: `name`'s bigrams or unigrams must appear somewhere in `role`/`task`/`framework`. This catches the historical bug where a prompt's `task` was copy-pasted from a neighbor by mistake.
6. **Slug uniqueness** — derived from `id`, ensures downstream consumers can build URLs / cache keys without collisions.

All six checks must pass before CI will green-light a PR.

## Inheritance & defaults

A prompt record only specifies what's *different* from the locale's defaults. The locale's `ui.json` provides:

- `defaultInstructions` — baseline values for `limits` / `interaction` / `check` / `search` / `format`
- `typeOverrides` — per-`type` overrides (e.g., Creative Expression types may relax certain limits)
- `nameFormatOverrides` / `styleOverrides` — pattern-based overrides keyed off `name`

Downstream consumers apply these layers in order: `defaultInstructions` < per-prompt `ai_instructions` < `typeOverrides[type]` < name-pattern overrides. Later layers win.

**For contributors this means: omit a field unless the prompt genuinely needs a non-default value.** Setting `format` to the same value as `defaultInstructions.format` adds noise without information.

> The actual layer-merge logic lives in *each* downstream consumer (the consumer website, NPM packages, third-party tools). This repo only documents the contract; it does not provide a reference renderer. Consumers that want a starting point can read `scripts/export_dictionary.py`, which performs the same merge in pure Python while exporting to Markdown.

## Adding a new prompt

1. Pick the right section file (`content/{locale}/prompts/{NN-section}.json`).
2. Find the next unused `AI³-NNNNN` ID. Currently the highest is **AI³-00930**.
3. Construct the record following the schema above. Omit optional fields unless you have a specific reason to override.
4. Run `python3 scripts/validate_prompts.py` — it must print `✅`.
5. Run `python3 scripts/merge_content.py` — verify your record appears in the merged output.
6. Open a PR.

## Changing the schema

**Don't** — at least not without an RFC. Schema changes touch every record (>930) and break every downstream consumer (the consumer website, data packages, CLI tools, apps, anyone who pinned to a previous release). See [GOVERNANCE.md](../GOVERNANCE.md) for the RFC process and [DECISIONS.md](DECISIONS.md) for prior schema choices.

Acceptable reasons to change the schema:
- A field has been empty for all records (pure tech debt — remove it, like `example` was removed in v5.9)
- A truly new dimension emerges that cannot be derived (e.g., `license_required: true` for prompts that need a paid LLM tier — this did not exist in 2026)

Unacceptable reasons:
- "It would be nicer if…"
- Anything that could be done at render time via existing fields
