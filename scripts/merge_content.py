#!/usr/bin/env python3
"""
Merge sharded content/{locale}/ files into runtime JSON bundles.

Inputs:  content/en-US/prompts/*.json
         content/{locale}/categories.json
         content/{locale}/ui.json

Outputs: locales/{locale}/{prompts_index,categories_index,ui}.json
         Downstream consumers (consumer website, NPM packages, third-party
         tools) read these merged files instead of stitching the shards
         themselves.
"""
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

SECTION_FILES = ["01-core.json", "02-industry.json", "03-lifestyle.json", "04-public.json"]


def _recompute_category_counts(categories: list, prompts: list) -> list:
    """Recompute prompt_count + prompts[] on each category from the actual
    prompt data. categories.json itself only carries identity fields
    (section_code / category_code / path).

    This means even if categories.json drifts from prompts/*.json (e.g. EN
    is only partially translated and categories.json is a stale snapshot),
    downstream consumers always see correct counts.
    """
    buckets: dict[str, list[dict]] = defaultdict(list)
    for p in prompts:
        cc = p.get("category_code")
        if not cc:
            continue
        buckets[cc].append({"id": p["id"], "name": p["name"]})

    for cat in categories:
        cc = cat.get("category_code")
        items = buckets.get(cc, [])
        cat["prompt_count"] = len(items)
        cat["prompts"] = items
    return categories


def load_locale(code: str) -> dict:
    """Load all content for one locale; return {prompts, categories, ui}."""
    loc_dir = CONTENT / code
    if not loc_dir.exists():
        raise FileNotFoundError(f"locale dir not found: {loc_dir}")

    # Concatenate prompt shards in section order, then stable-sort by id.
    prompts: list = []
    for fname in SECTION_FILES:
        path = loc_dir / "prompts" / fname
        if not path.exists():
            continue
        with path.open(encoding="utf-8") as f:
            prompts.extend(json.load(f))
    prompts.sort(key=lambda p: p.get("id", ""))

    with (loc_dir / "categories.json").open(encoding="utf-8") as f:
        categories = json.load(f)
    with (loc_dir / "ui.json").open(encoding="utf-8") as f:
        ui = json.load(f)

    _recompute_category_counts(categories, prompts)

    return {"prompts": prompts, "categories": categories, "ui": ui}


# English-only dataset. A locale whose content dir is absent is skipped
# (see load_locale / the FileNotFoundError handler below), so re-adding
# zh-CN to this tuple would resume building it without further changes.
SUPPORTED_LOCALES = ("en-US",)


def write_locale_bundle(code: str, locales_root: Path) -> Path:
    """Write one locale's prompts / categories / ui under locales/{code}/."""
    data = load_locale(code)
    out_dir = locales_root / code
    out_dir.mkdir(parents=True, exist_ok=True)

    with (out_dir / "prompts_index.json").open("w", encoding="utf-8") as f:
        json.dump(data["prompts"], f, ensure_ascii=False, indent=2)
    with (out_dir / "categories_index.json").open("w", encoding="utf-8") as f:
        json.dump(data["categories"], f, ensure_ascii=False, indent=2)
    with (out_dir / "ui.json").open("w", encoding="utf-8") as f:
        json.dump(data["ui"], f, ensure_ascii=False, indent=2)

    return out_dir


if __name__ == "__main__":
    # Usage:  python3 scripts/merge_content.py
    # Output: locales/en-US/{prompts_index,categories_index,ui}.json
    locales_root = ROOT / "locales"
    for code in SUPPORTED_LOCALES:
        try:
            out_dir = write_locale_bundle(code, locales_root)
            data_path = out_dir / "prompts_index.json"
            with data_path.open(encoding="utf-8") as f:
                n = len(json.load(f))
            print(f"[merge] {code} -> {out_dir.relative_to(ROOT)}/  ({n} prompts)")
        except FileNotFoundError as e:
            print(f"[skip]  {code}: {e}")
    print("Done.")
