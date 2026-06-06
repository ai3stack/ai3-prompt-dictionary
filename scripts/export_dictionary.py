#!/usr/bin/env python3
"""
Export the merged dictionary as a single human-readable Markdown file.

Reads:
  locales/{LOCALE}/prompts_index.json
  locales/{LOCALE}/categories_index.json
  content/{LOCALE}/ui.json   (defaults + override config)

Writes:
  dist/AI3_Dictionary_Export_{LOCALE}.md   (or a custom path)

Inheritance / override semantics applied here MUST stay in sync with the
schema documented in docs/PROMPT_SCHEMA.md. ui.json is the single source
of truth for defaults and overrides; this script only consumes it.

Prerequisite:
  python3 scripts/merge_content.py    # generates locales/

Usage:
  python3 scripts/export_dictionary.py [LOCALE=en-US] [OUT_PATH]
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOCALE = sys.argv[1] if len(sys.argv) > 1 else "en-US"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else \
    ROOT / "dist" / f"AI3_Dictionary_Export_{LOCALE}.md"


def load_inputs(locale: str) -> tuple[list, list, dict]:
    locale_dir = ROOT / "locales" / locale
    if not locale_dir.exists():
        sys.exit(f"missing {locale_dir} — run scripts/merge_content.py first")
    with (locale_dir / "prompts_index.json").open(encoding="utf-8") as f:
        prompts = json.load(f)
    with (locale_dir / "categories_index.json").open(encoding="utf-8") as f:
        categories = json.load(f)
    with (ROOT / "content" / locale / "ui.json").open(encoding="utf-8") as f:
        ui = json.load(f)
    return prompts, categories, ui


def apply_overrides(inst: dict, name: str, ui: dict) -> dict:
    """Merge overrides in the canonical order:
         defaultInstructions
         < per-prompt ai_instructions
         < typeOverrides[type]
         < nameFormatOverrides (format only)
         < styleOverrides       (style only, when current style is generic)
       Later layers win. See docs/PROMPT_SCHEMA.md.
    """
    inst = inst or {}
    type_main = (inst.get("type") or "").split("→")[0].strip()
    merged = dict(ui.get("defaultInstructions", {}))
    merged.update(inst)

    type_ov = ui.get("typeOverrides", {}).get(type_main)
    if type_ov:
        merged.update(type_ov)

    for pattern, fmt in ui.get("nameFormatOverrides", []):
        if re.search(pattern, name or ""):
            merged["format"] = fmt
            break

    cur_style = inst.get("style") or ""
    generic = set(ui.get("genericStyles", []))
    if cur_style == "" or cur_style in generic:
        for entry in ui.get("styleOverrides", []):
            # entry can be 4-tuple [type, pattern, flags, style] or 3-tuple
            if len(entry) == 4:
                t, pattern, flags_str, style = entry
                flags = re.IGNORECASE if "i" in (flags_str or "") else 0
            else:
                t, pattern, style = entry
                flags = 0
            if t == type_main and re.search(pattern, name or "", flags):
                merged["style"] = style
                break

    return merged


def render_instructions(merged: dict, ai_layout: list) -> list[str]:
    lines = []
    for entry in ai_layout:
        key = entry["key"]
        label = entry.get("label", key)
        v = merged.get(key)
        if v is None or v == "":
            continue
        lines.append(f"- **{key.upper()} · {label}**")
        if isinstance(v, list):
            for item in v:
                txt = re.sub(r"^[-•·]\s*", "", str(item))
                lines.append(f"  - {txt}")
        else:
            lines.append(f"  - {v}")
    return lines


def esc_md(s) -> str:
    if not isinstance(s, str):
        return str(s)
    return s.replace("|", "\\|")


def main():
    prompts, categories, ui = load_inputs(LOCALE)
    OUT.parent.mkdir(parents=True, exist_ok=True)

    sections = ui.get("sections", {})
    ai_layout = ui.get("aiLayout", [])
    defaults = ui.get("defaultInstructions", {})

    out: list[str] = []
    out.append(f"# AI³ Prompt Dictionary · Full Snapshot ({LOCALE})")
    out.append("")
    out.append(f"> Exported: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    out.append(f"> Prompts: **{len(prompts)}**")
    out.append(f"> Categories: **{len(categories)}**")
    out.append("")
    out.append("---")
    out.append("")

    # 1. Category tree
    out.append("## 1. Category tree")
    out.append("")
    groups: dict[str, list] = {}
    for cat in categories:
        groups.setdefault(cat["section_code"], []).append(cat)
    for sc in sorted(groups.keys()):
        sec_name = sections.get(sc, {}).get("name", "")
        out.append(f"### {sc} {sec_name}")
        out.append("")
        for cat in groups[sc]:
            cat_name = cat.get("category_name") or cat.get("name") or cat["category_code"]
            out.append(f"- **{cat['category_code']}** {cat_name} ({cat.get('prompt_count', 0)})")
        out.append("")
    out.append("---")
    out.append("")

    # 2. AI-instruction schema and global defaults
    out.append("## 2. AI-instruction schema")
    out.append("")
    out.append("| Field | Label | Default? |")
    out.append("|---|---|---|")
    for entry in ai_layout:
        in_default = "yes" if entry["key"] in defaults else ""
        out.append(f"| `{entry['key']}` | {entry.get('label', '')} | {in_default} |")
    out.append("")
    out.append("### Global defaults (omit on a prompt to inherit)")
    out.append("")
    for key, v in defaults.items():
        out.append(f"#### {key.upper()}")
        if isinstance(v, list):
            for item in v:
                txt = re.sub(r"^[-•·]\s*", "", str(item))
                out.append(f"- {txt}")
        else:
            out.append(f"- {v}")
        out.append("")
    out.append("---")
    out.append("")

    # 3. All prompts
    out.append(f"## 3. All {len(prompts)} prompts")
    out.append("")
    by_section: dict = {}
    for p in prompts:
        by_section.setdefault(p["section_code"], {}).setdefault(p["category_code"], []).append(p)

    for sc in sorted(by_section.keys()):
        sec_name = sections.get(sc, {}).get("name", "")
        out.append(f"### Section {sc} · {sec_name}")
        out.append("")
        for cc in sorted(by_section[sc].keys()):
            out.append(f"#### {cc}")
            out.append("")
            for p in by_section[sc][cc]:
                version = p.get("version", "V1.0")
                out.append(f"##### {p['id']} · {p['name']} ({version})")
                out.append("")
                if p.get("input_section"):
                    out.append(f"**Input placeholder:** `{esc_md(p['input_section'])}`")
                    out.append("")
                tq = p.get("translation_quality")
                if tq:
                    out.append(f"**Translation quality:** {tq}")
                    out.append("")
                out.append("**AI instructions:**")
                out.append("")
                merged = apply_overrides(p.get("ai_instructions") or {}, p.get("name", ""), ui)
                out.extend(render_instructions(merged, ai_layout))
                out.append("")
        out.append("---")
        out.append("")

    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"OK: exported {len(prompts)} prompts ({LOCALE})")
    print(f"    path: {OUT}")
    print(f"    size: {OUT.stat().st_size:,} bytes")
    print(f"    lines: {len(out):,}")


if __name__ == "__main__":
    main()
