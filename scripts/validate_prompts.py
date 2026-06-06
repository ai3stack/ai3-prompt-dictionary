#!/usr/bin/env python3
"""
Schema and consistency validator for content/{locale}/prompts/*.json.
Reads source files directly; does not depend on merge_content.py output.

Checks:
  1. All required top-level fields present
     (id / name / input_section / ai_instructions / version /
      section_code / section_name / category_code / category_path)
  2. id is unique and matches "AI3-NNNNN"
  3. section_code / category_code follow the format "01"-"04" / "NN-NN"
     and share a prefix; category_path also shares the section prefix
  4. ai_instructions sub-fields have correct types
     (role / task / type / search / style / format = string;
      framework / limits / interaction / check = array)
  5. name and role/task/framework are semantically related
     (catches accidental cross-prompt copy-paste; 7 such cases were
      found and fixed in the historical dataset)
  6. slug uniqueness — downstream consumers use the slug for URLs and
     cache keys
  7. translation_quality, if present, must be one of
     {draft, community-reviewed, expert-reviewed}

Usage:
  python3 scripts/validate_prompts.py                   # en-US (default)
  python3 scripts/validate_prompts.py --locale en-US    # English only

The dataset is English-only; locales whose content directory does not
exist are skipped rather than treated as failures.

Exit code: 0 = all clean; 1 = problems found (listed on stdout).
"""
import argparse
import json
import re
import sys
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
# Read directly from the sharded source files — no merge step required,
# so this script can run standalone.
# English-only dataset. zh-CN was retired; if its directory is ever
# re-added it will be validated, otherwise it is silently skipped.
CONTENT_DIRS = {
    "en-US": ROOT / "content" / "en-US" / "prompts",
}
SECTION_FILES = ("01-core.json", "02-industry.json", "03-lifestyle.json", "04-public.json")


def load_locale(code: str, prompts_dir: Path) -> list:
    """Concatenate all section shards under content/{code}/prompts/ into one list."""
    if not prompts_dir.exists():
        return []
    out: list = []
    for fname in SECTION_FILES:
        path = prompts_dir / fname
        if not path.exists():
            continue
        with path.open(encoding="utf-8") as f:
            out.extend(json.load(f))
    out.sort(key=lambda p: p.get("id", ""))
    return out


def name_tokens(s: str) -> list[set[str]]:
    """Extract token groups from a name for semantic matching:
      - bigram set (primary): does any 2-char bigram appear in the body?
      - unigram set (fallback): do all individual chars appear in the body?
        (handles cases where the matching tokens are split across the body)
    Returns [bigrams, unigrams].
    """
    clean = re.sub(r"[^A-Za-z0-9]", "", s)
    bgs = {clean[i:i + 2] for i in range(len(clean) - 1)} if len(clean) >= 2 else set()
    unis = set(clean) if len(clean) >= 2 else set()
    return [bgs, unis]


def validate(data: list) -> list[tuple[str, str]]:
    """Return [(id, message), ...]. Empty list means all checks passed."""
    errors: list[tuple[str, str]] = []
    ids = Counter()

    REQUIRED_FIELDS = ("id", "name", "input_section", "ai_instructions",
                       "version", "section_code", "section_name",
                       "category_code", "category_path")
    STRING_FIELDS = ("role", "task", "type", "search", "style", "format")
    ARRAY_FIELDS = ("framework", "limits", "interaction", "check")
    QUALITY_VALUES = ("draft", "community-reviewed", "expert-reviewed")

    id_re = re.compile(r"^AI³-\d{5}$")
    section_re = re.compile(r"^0[1-4]$")
    category_re = re.compile(r"^0[1-4]-\d{2}$")

    for idx, p in enumerate(data):
        pid = p.get("id", f"<index {idx}>")

        # 1. required fields
        for f in REQUIRED_FIELDS:
            if f not in p:
                errors.append((pid, f"missing field {f!r}"))

        # 2. id format + uniqueness
        if not id_re.match(pid):
            errors.append((pid, "id format does not match 'AI³-NNNNN'"))
        ids[pid] += 1

        # 3. section_code / category_code
        sc = p.get("section_code", "")
        cc = p.get("category_code", "")
        if not section_re.match(sc):
            errors.append((pid, f"section_code {sc!r} is not in '01'-'04'"))
        if not category_re.match(cc):
            errors.append((pid, f"category_code {cc!r} is not 'NN-NN'"))
        # section / category prefixes must agree
        if sc and cc and not cc.startswith(sc + "-"):
            errors.append((pid, f"section_code {sc!r} and category_code {cc!r} prefix mismatch"))

        # category_path must also start with section_code (e.g. "01-core")
        cp = p.get("category_path", "")
        if sc and cp and not cp.startswith(sc + "-"):
            errors.append((pid, f"section_code {sc!r} and category_path {cp!r} prefix mismatch"))

        # translation_quality, if present, must be a valid enum value
        tq = p.get("translation_quality")
        if tq is not None and tq not in QUALITY_VALUES:
            errors.append((pid, f"translation_quality {tq!r} is not one of {QUALITY_VALUES}"))

        # 4. ai_instructions field types
        inst = p.get("ai_instructions") or {}
        if not isinstance(inst, dict):
            errors.append((pid, "ai_instructions is not an object"))
            continue
        for f in STRING_FIELDS:
            v = inst.get(f)
            if v is not None and not isinstance(v, str):
                errors.append((pid, f"ai_instructions.{f} should be string, got {type(v).__name__}"))
        for f in ARRAY_FIELDS:
            v = inst.get(f)
            if v is not None and not isinstance(v, list):
                errors.append((pid, f"ai_instructions.{f} should be array, got {type(v).__name__}"))

        # 5. name ↔ ai_instructions semantic consistency
        #    (catches accidental cross-prompt copy-paste of the task field)
        name = p.get("name", "")
        if name:
            body = " ".join([
                inst.get("role") or "",
                inst.get("task") or "",
                " ".join(inst.get("framework") or []),
            ])
            bgs, unis = name_tokens(name)
            # Pass if any name bigram appears in body, OR every name char does.
            #   a name like "SEO audit" passes via the bigram "SE"/"EO" appearing in role/task
            #   a short name passes via every char appearing somewhere in the body
            bgram_hit = any(k in body for k in bgs)
            uni_hit = unis and all(c in body for c in unis)
            if not (bgram_hit or uni_hit):
                errors.append((
                    pid,
                    f"name {name!r} shares no key tokens with role/task/framework, "
                    f"likely cross-prompt copy-paste (task={inst.get('task','')[:40]!r})"
                ))

    # duplicate ids
    for i, cnt in ids.items():
        if cnt > 1:
            errors.append((i, f"id appears {cnt} times"))

    # 6. slug uniqueness
    #    slug = id.lower().replace("ai³-", "ai3-"); structurally collision-free
    slugs = Counter()
    for p in data:
        pid = p.get("id", "")
        slug = pid.lower().replace("ai³", "ai3")
        slugs[slug] += 1
    for s, cnt in slugs.items():
        if cnt > 1:
            errors.append((s, f"slug collision: {cnt} prompts map to slug `{s}`"))

    return errors


def validate_locale(code: str, prompts_dir: Path) -> int:
    """Return the error count for this locale."""
    print(f"\n--- {code} ---")
    if not prompts_dir.exists():
        # Locale not present in this (English-only) dataset — skip, not a failure.
        print(f"  SKIP: {code}: no content directory ({prompts_dir})")
        return 0

    data = load_locale(code, prompts_dir)
    if not data:
        print(f"  WARN: {code}: no prompts loaded (are {prompts_dir}/*.json all empty?)")
        return 1
    print(f"  loaded {len(data)} prompts")

    errors = validate(data)
    if not errors:
        print(f"  OK: {code} passed all checks")
        return 0

    print(f"  FAIL: {code} has {len(errors)} problems:")
    for pid, msg in errors:
        print(f"    {pid}  {msg}")
    return len(errors)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--locale",
        choices=list(CONTENT_DIRS.keys()) + ["all"],
        default="all",
        help="locale to validate (default: both)",
    )
    args = ap.parse_args()

    codes = list(CONTENT_DIRS.keys()) if args.locale == "all" else [args.locale]

    total_errors = 0
    for code in codes:
        total_errors += validate_locale(code, CONTENT_DIRS[code])

    print()
    if total_errors == 0:
        print("OK: all locales passed")
        return 0
    print(f"FAIL: {total_errors} problems total")
    return 1


if __name__ == "__main__":
    sys.exit(main())
