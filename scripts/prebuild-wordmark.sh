#!/usr/bin/env bash
# Wordmark build step: rasterize the DDC Hardware 45 masthead strings into
# public/assets/word/*.png. The OTF is vendored locally (gitignored, licensed
# operator fixture) and is NEVER served — rasterized PNGs only (EULA).
#
# TASK-3: the masthead ships BOTH palette variants so the wordmark is never
# invisible on a dark background (plan Review Focus #2):
#   light/ — light-ink #242424 (dark strokes, for the light theme)
#   dark/  — ivory ink #EAEAEA  (light strokes, for the dark theme)
# The CSS swap (global.css + prefers-color-scheme / [data-theme]) picks one.
set -euo pipefail

# CI path: when the licensed font isn't vendored but the rendered PNGs are
# committed (rasterized locally per EULA), skip re-rendering and build.
if [ ! -f "assets/fonts-src/DDCHardware45-Regular.otf" ] \
   && ls public/assets/word/*/*.png >/dev/null 2>&1 \
   && [ -f public/assets/word/manifest.json ]; then
  echo "wordmark PNGs + manifest present (rasterized locally); skipping local render"
  exit 0
fi
cd "$(dirname "${BASH_SOURCE[0]}")/.."

FONT="assets/fonts-src/DDCHardware45-Regular.otf"
OUT="public/assets/word"

if [ ! -f "$FONT" ]; then
  echo "error: wordmark font missing: $FONT" >&2
  echo "  (vendored operator fixture, gitignored — vendor it locally before building;" >&2
  echo "   the OTF must never be committed or served)" >&2
  exit 2
fi

# Superseded flat naming (Task 2) — regenerate as light/ + dark/ variants.
rm -f "$OUT"/gonzalez@1x.png "$OUT"/gonzalez@2x.png

python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/light" --text "gonzalez" --ink 242424
python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/dark" --text "gonzalez" --ink EAEAEA

# TASK-9: static page headings as DDC rasters too — same EULA-safe pattern,
# both ink variants @1x+@2x. The manifest records their dimensions so the
# HeadingWord component can emit width/height (no layout shift).
HEADINGS=("more is coming soon" "Writing" "Projects" "About")
for heading in "${HEADINGS[@]}"; do
  python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/light" --text "$heading" --ink 242424 --height 30
  python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT/dark" --text "$heading" --ink EAEAEA --height 30
done

python3 scripts/build_headings_manifest.py
