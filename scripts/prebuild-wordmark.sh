#!/usr/bin/env bash
# Wordmark build step: rasterize the DDC Hardware 45 masthead strings into
# public/assets/word/*.png. The OTF is vendored locally (gitignored, licensed
# operator fixture) and is NEVER served — rasterized PNGs only (EULA).
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

python3 scripts/render_wordmark.py --font "$FONT" --out "$OUT" --text "gonzalez"
