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
