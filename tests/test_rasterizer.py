"""Unittest contracts for the DDC wordmark rasterizer.

Contracts carried over from the retired 2026-11-03 hardware-refresh plan:
    - renders 1x and 2x PNGs
    - transparent (alpha) output
    - deterministic: identical inputs -> identical sha256
    - missing font fails loudly (nonzero exit + stderr)
    - --max-width constrains width without upscaling distortion
"""

from __future__ import annotations

import hashlib
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "scripts"))

import render_wordmark as rw  # noqa: E402

FONT = rw.DEFAULT_FONT
FONT_PRESENT = FONT.is_file()


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


@unittest.skipUnless(
    FONT_PRESENT, "vendored DDC font missing (gitignored operator fixture)"
)
class WordmarkRenderTests(unittest.TestCase):
    """Contracts that need the real vendored font."""

    def test_renders_pngs_at_1x_and_2x(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            outputs = rw.render_wordmark_set("gonzalez", tmp)
            self.assertEqual(
                sorted(Path(p).name for p in outputs),
                ["gonzalez@1x.png", "gonzalez@2x.png"],
            )
            one = Path(tmp) / "gonzalez@1x.png"
            two = Path(tmp) / "gonzalez@2x.png"
            self.assertTrue(one.is_file())
            self.assertTrue(two.is_file())

            with Image.open(one) as small, Image.open(two) as large:
                # 2x retina render is double the 1x raster (small rounding
                # tolerance at the glyph-measurement level).
                self.assertAlmostEqual(
                    large.width, 2 * small.width, delta=4
                )
                self.assertAlmostEqual(
                    large.height, 2 * small.height, delta=4
                )

    def test_output_is_transparent_rgba(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = rw.render_wordmark("gonzalez", Path(tmp) / "word.png")
            with Image.open(out) as image:
                self.assertEqual(image.mode, "RGBA")
                corner_alpha = image.getpixel((0, 0))[3]
                self.assertEqual(corner_alpha, 0)
                some_opaque_ink = image.getextrema()
                self.assertGreater(some_opaque_ink[3][1], 0)

    def test_rasterizer_is_deterministic(self) -> None:
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            first_paths = rw.render_wordmark_set("gonzalez", first)
            second_paths = rw.render_wordmark_set("gonzalez", second)
            digests_first = {_sha256(Path(p)) for p in first_paths}
            digests_second = {_sha256(Path(p)) for p in second_paths}
            self.assertEqual(digests_first, digests_second)

    def test_max_width_option_constrains_width(self) -> None:
        text = "gonzalez-gonzalez-gonzalez"
        with tempfile.TemporaryDirectory() as tmp:
            unrestricted = Path(
                rw.render_wordmark(text, Path(tmp) / "free.png", height_px=28)
            )
            constrained = Path(
                rw.render_wordmark(
                    text, Path(tmp) / "capped.png", height_px=28, max_width=200
                )
            )
            with Image.open(unrestricted) as free, Image.open(constrained) as capped:
                natural_width = free.width
                capped_width = capped.width
                self.assertGreater(natural_width, 200)
                self.assertLessEqual(capped_width, 200)
                # No upscaling distortion: it shrank to fit, it did not stretch.
                self.assertLessEqual(capped.width, natural_width)
                self.assertLess(capped.height, free.height)
                self.assertGreater(capped.width, 0)


@unittest.skipUnless(
    FONT_PRESENT, "vendored DDC font missing (gitignored operator fixture)"
)
class WordmarkCliTests(unittest.TestCase):
    """End-to-end wiring of the CLI entry point."""

    def test_cli_success_writes_both_scales(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            proc = subprocess.run(
                [
                    sys.executable,
                    str(REPO_ROOT / "scripts" / "render_wordmark.py"),
                    "--font",
                    str(FONT),
                    "--out",
                    str(tmp),
                    "--text",
                    "gonzalez",
                ],
                capture_output=True,
                text=True,
                cwd=str(REPO_ROOT),
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            self.assertTrue((Path(tmp) / "gonzalez@1x.png").is_file())
            self.assertTrue((Path(tmp) / "gonzalez@2x.png").is_file())

    def test_cli_max_width_is_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            proc = subprocess.run(
                [
                    sys.executable,
                    str(REPO_ROOT / "scripts" / "render_wordmark.py"),
                    "--font",
                    str(FONT),
                    "--out",
                    str(tmp),
                    "--text",
                    "gonzalez-gonzalez-gonzalez",
                    "--max-width",
                    "200",
                    "--scales",
                    "1",
                ],
                capture_output=True,
                text=True,
                cwd=str(REPO_ROOT),
            )
            self.assertEqual(proc.returncode, 0, proc.stderr)
            with Image.open(Path(tmp) / "gonzalez-gonzalez-gonzalez@1x.png") as capped:
                self.assertLessEqual(capped.width, 200)


class FontFailLoudTests(unittest.TestCase):
    """A missing font must be loud, never silently substituted."""

    def test_cli_missing_font_fails_loudly(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            proc = subprocess.run(
                [
                    sys.executable,
                    str(REPO_ROOT / "scripts" / "render_wordmark.py"),
                    "--font",
                    str(REPO_ROOT / "no-such-font.otf"),
                    "--out",
                    str(tmp),
                    "--text",
                    "gonzalez",
                ],
                capture_output=True,
                text=True,
                cwd=str(REPO_ROOT),
            )
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("font not found", proc.stderr)

    def test_missing_font_raises_systemexit(self) -> None:
        with self.assertRaises(SystemExit):
            rw.render_wordmark("gonzalez", "unused.png", font_path="no-such-font.otf")


if __name__ == "__main__":
    unittest.main()
