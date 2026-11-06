"""Contract tests for the heading-raster manifest builder."""

import json
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from build_headings_manifest import build_manifest, write_manifest  # noqa: E402


class BuildManifestTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.word = Path(self.tmp) / "public" / "assets" / "word"
        for ink in ("light", "dark"):
            self._png(self.word / ink, "writing", 40, 12, 80, 24)
            self._png(self.word / ink, "gonzalez", 30, 5, 148, 25)

    def _png(self, directory, slug, w1, h1, w2, h2):
        directory.mkdir(parents=True, exist_ok=True)
        for scale, (w, h) in {"1": (w1, h1), "2": (w2, h2)}.items():
            Image.new("RGBA", (w, h)).save(directory / f"{slug}@{scale}x.png")

    def test_shape_and_values(self):
        manifest = build_manifest(self.word)
        self.assertEqual(list(manifest), ["gonzalez", "writing"])
        self.assertEqual(manifest["writing"]["light"]["1"], [40, 12])
        self.assertEqual(manifest["writing"]["dark"]["2"], [80, 24])

    def test_write_creates_json(self):
        manifest = build_manifest(self.word)
        out = Path(self.tmp) / "manifest.json"
        write_manifest(manifest, out)
        self.assertEqual(json.loads(out.read_text()), manifest)


if __name__ == "__main__":
    unittest.main()
