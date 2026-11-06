#!/usr/bin/env python3
"""Deterministic DDC Hardware 45 wordmark rasterizer.

Renders the site's identity strings from the vendored (gitignored, licensed)
OTF into transparent PNGs under ``public/assets/word/`` — one file per render
scale (1x, 2x retina). The font file itself is never served and never lands in
``dist/``; the PNGs are the only artifact (EULA constraint, see
docs/plans/2026-11-05-digital-garden-plan.md).

Determinism contract: identical font + text + parameters produce
byte-identical PNG files (sha256-stable across reruns on the same Pillow
install).

CLI::

    python3 scripts/render_wordmark.py \
        --font assets/fonts-src/DDCHardware45-Regular.otf \
        --out public/assets/word \
        --text "gonzalez"

Unit contracts live in ``tests/test_rasterizer.py``.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Sequence

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_FONT = REPO_ROOT / "assets" / "fonts-src" / "DDCHardware45-Regular.otf"
DEFAULT_OUT = REPO_ROOT / "public" / "assets" / "word"
DEFAULT_HEIGHT_PX = 28  # 1x cap height of "gonzalez" in the masthead
DEFAULT_INK = "#242424"  # light-ink wordmark; dark-ink variant lands in Task 3
SCALES = (1, 2)
PAD = 6  # transparent padding around glyphs, in 1x pixels


def slugify(text: str) -> str:
    """Stable, filesystem-safe slug for an output filename."""
    slug = re.sub(r"[^a-z0-9]+", "-", text.strip().lower()).strip("-")
    return slug or "wordmark"


def _resolve_font(font_path: str | Path) -> Path:
    """Resolve a font path relative to the repo root (for stable CI runs)."""
    font = Path(font_path)
    if not font.is_absolute():
        font = REPO_ROOT / font
    return font


def _load_font(font_path: Path, size: int) -> ImageFont.FreeTypeFont:
    """Load the font or fail loudly: nonzero exit + a message on stderr."""
    if not font_path.is_file():
        sys.stderr.write(f"error: font not found: {font_path}\n")
        raise SystemExit(2)
    try:
        return ImageFont.truetype(str(font_path), size)
    except OSError as err:
        sys.stderr.write(f"error: cannot load font {font_path}: {err}\n")
        raise SystemExit(2)


def parse_ink(hex_str: str) -> tuple[int, int, int]:
    """Parse a 6-digit hex color like ``242424`` or ``#242424``."""
    value = hex_str.lstrip("#")
    if not re.fullmatch(r"[0-9a-fA-F]{6}", value):
        sys.stderr.write(
            f"error: --ink expects a 6-digit hex color, got {hex_str!r}\n"
        )
        raise SystemExit(2)
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16))


def _rasterize(
    text: str,
    font_path: Path,
    height_px: int,
    ink: tuple[int, int, int],
    max_width: int | None,
) -> Image.Image:
    """Render ``text`` onto a transparent canvas at ``height_px`` font units.

    When ``max_width`` is given, the label is shrunk to fit — never upscaled,
    never stretched: the font size is reduced so the natural proportions hold.
    """
    font = _load_font(font_path, height_px)
    left, top, right, bottom = font.getbbox(text)
    width = (right - left) + 2 * PAD
    height = (bottom - top) + 2 * PAD

    if max_width is not None and width > max_width:
        inner_budget = max(1, max_width - 2 * PAD)
        natural = max(1, right - left)
        shrunk_size = max(1, round(height_px * inner_budget / natural))
        if shrunk_size < height_px:
            font = _load_font(font_path, shrunk_size)
            left, top, right, bottom = font.getbbox(text)
        width = min((right - left) + 2 * PAD, max_width)
        height = (bottom - top) + 2 * PAD

    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.text((PAD - left, PAD - top), text, font=font, fill=(*ink, 255))
    return image


def render_wordmark(
    text: str,
    out_png: str | Path,
    scale: int = 1,
    height_px: int | None = None,
    max_width: int | None = None,
    font_path: str | Path = DEFAULT_FONT,
    ink_hex: str = DEFAULT_INK,
) -> str:
    """Render one scale of ``text`` to ``out_png``; returns the output path.

    Determinism relies on Pillow's stable text shaping and PNG encoding:
    identical inputs yield identical bytes on repeat runs.
    """
    base = height_px if height_px is not None else DEFAULT_HEIGHT_PX
    scaled_max = max_width * scale if max_width is not None else None
    image = _rasterize(
        text,
        _resolve_font(font_path),
        base * max(1, scale),
        parse_ink(ink_hex),
        scaled_max,
    )
    out = Path(out_png)
    out.parent.mkdir(parents=True, exist_ok=True)
    image.save(str(out), format="PNG", optimize=True)
    return str(out)


def render_wordmark_set(
    text: str,
    out_dir: str | Path,
    scales: Sequence[int] = SCALES,
    height_px: int | None = None,
    max_width: int | None = None,
    font_path: str | Path = DEFAULT_FONT,
    ink_hex: str = DEFAULT_INK,
) -> list[str]:
    """Render every scale and name each file ``<slug>@<scale>x.png``.

    The largest scale is the native raster; smaller scales are derived by a
    deterministic LANCZOS downscale, so every density shares the same glyph
    proportions and the srcset swap keeps the masthead geometrically stable.
    """
    slug = slugify(text)
    directory = Path(out_dir)
    ordered = sorted(max(1, s) for s in scales)
    largest = ordered[-1]
    base = height_px if height_px is not None else DEFAULT_HEIGHT_PX
    native = _rasterize(
        text,
        _resolve_font(font_path),
        base * largest,
        parse_ink(ink_hex),
        max_width * largest if max_width is not None else None,
    )
    rendered: list[str] = []
    for scale in ordered:
        if scale == largest:
            image = native
        else:
            image = native.resize(
                (max(1, round(native.width * scale / largest)),
                 max(1, round(native.height * scale / largest))),
                Image.LANCZOS,
            )
        out = directory / f"{slug}@{scale}x.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        image.save(str(out), format="PNG", optimize=True)
        rendered.append(str(out))
    return rendered


def parse_scales(raw: str) -> list[int]:
    """Parse a comma-separated scale list like ``1,2``."""
    parsed: list[int] = []
    for part in raw.split(","):
        token = part.strip()
        if not token.isdigit() or int(token) < 1:
            sys.stderr.write(
                f"error: --scales expects comma-separated positive integers, got {raw!r}\n"
            )
            raise SystemExit(2)
        parsed.append(int(token))
    return parsed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Rasterize DDC Hardware 45 text into transparent PNGs (1x + 2x)."
    )
    parser.add_argument(
        "--font", default=str(DEFAULT_FONT), help="Path to the licensed OTF."
    )
    parser.add_argument(
        "--out", default=str(DEFAULT_OUT), help="Directory receiving <slug>@<scale>x.png files."
    )
    parser.add_argument("--text", default="gonzalez", help="Text to rasterize.")
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT_PX, help="1x font height in px.")
    parser.add_argument("--max-width", type=int, default=None, help="Shrink-to-fit width constraint (1x px).")
    parser.add_argument("--ink", default=DEFAULT_INK, help="Ink color as 6-digit hex.")
    parser.add_argument("--scales", default="1,2", help="Comma-separated scales to render.")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    paths = render_wordmark_set(
        args.text,
        args.out,
        scales=parse_scales(args.scales),
        height_px=args.height,
        max_width=args.max_width,
        font_path=args.font,
        ink_hex=args.ink,
    )
    for path in paths:
        print(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
