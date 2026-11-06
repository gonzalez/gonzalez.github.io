#!/usr/bin/env python3
"""Emit ``public/assets/word/manifest.json`` from the rendered DDC PNGs.

The manifest records each raster's dimensions so the Astro HeadingWord
component can emit width/height attributes (no layout shift) without shipping
the licensed OTF.  Shape::

    { "<slug>": { "light": { "1": [w, h], "2": [w, h] },
                  "dark":  { "1": [w, h], "2": [w, h] } } }

Slug = filename minus ``@Nx.png``; exactly the naming used by
``scripts/render_wordmark.py``.  Run after the prebuild renders have completed.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image

DEFAULT_WORD_DIR = Path("public/assets/word")
DEFAULT_OUT = Path("public/assets/word/manifest.json")
INK_DIRS = ("light", "dark")
PNG_NAME = re.compile(r"^(.+)@(\d+)x\.png$")


def build_manifest(word_dir: str | Path) -> dict:
    """Slug → ink → scale-string → [png width, png height]."""
    word = Path(word_dir)
    found: dict[str, dict[str, dict[str, list[int]]]] = {}
    for ink in INK_DIRS:
        for png in sorted((word / ink).glob("*.png")):
            match = PNG_NAME.match(png.name)
            if not match:
                continue
            slug, scale = match.group(1), match.group(2)
            with Image.open(png) as image:
                width, height = image.size
            found.setdefault(slug, {}).setdefault(ink, {})[scale] = [width, height]
    return {slug: found[slug] for slug in sorted(found)}


def write_manifest(manifest: dict, out_path: str | Path) -> None:
    """Write the manifest as stable, sorted JSON."""
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2, sort_keys=True)
        handle.write("\n")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--word-dir", default=str(DEFAULT_WORD_DIR))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    args = parser.parse_args()
    manifest = build_manifest(args.word_dir)
    write_manifest(manifest, args.out)
    print(f"wrote {args.out}: {len(manifest)} slugs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
