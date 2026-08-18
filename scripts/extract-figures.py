#!/usr/bin/env python3
"""Renders figure crops from a source PDF for every digitized paper.

Each digital-documents/<slug>/figures/crops.json declares:
  { "source": "papersraw/....pdf", "dpi": 300,
    "crops": [{ "out": "q03-a.png", "page": 1, "rect": [x0, y0, x1, y1] }] }
rect is in PDF points. Output PNGs land next to crops.json.

Usage: npm run figures   (or: python3 scripts/extract-figures.py)
"""
import json
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent

def main() -> int:
    specs = sorted(ROOT.glob("digital-documents/*/figures/crops.json"))
    if not specs:
        print("no figures/crops.json found under digital-documents/")
        return 0
    for spec_path in specs:
        spec = json.loads(spec_path.read_text())
        doc = pymupdf.open(ROOT / spec["source"])
        dpi = spec.get("dpi", 300)
        for crop in spec["crops"]:
            page = doc[crop["page"] - 1]
            rect = pymupdf.Rect(*crop["rect"])
            pix = page.get_pixmap(clip=rect, dpi=dpi)
            out = spec_path.parent / crop["out"]
            pix.save(out)
            print(f"{spec_path.parent.parent.name}/figures/{crop['out']}  ({pix.width}x{pix.height})")
    return 0

if __name__ == "__main__":
    sys.exit(main())
