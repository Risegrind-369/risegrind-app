#!/usr/bin/env python3
"""Compress icon assets to stay under 1MB checkpoint limit."""
from PIL import Image
import os

assets_dir = "/home/ubuntu/risegrind/assets/images"

def compress_png(path, max_size_kb=900):
    img = Image.open(path).convert("RGBA")
    # Try saving at full size first with PNG optimization
    img.save(path, "PNG", optimize=True, compress_level=9)
    size_kb = os.path.getsize(path) / 1024
    print(f"  {os.path.basename(path)}: {size_kb:.0f} KB")
    if size_kb > max_size_kb:
        # Scale down to 512x512 for icon.png (still plenty for iOS)
        w, h = img.size
        if w > 512:
            img = img.resize((512, 512), Image.LANCZOS)
            img.save(path, "PNG", optimize=True, compress_level=9)
            size_kb = os.path.getsize(path) / 1024
            print(f"  → Scaled to 512x512: {size_kb:.0f} KB")

files = [
    "icon.png",
    "splash-icon.png",
    "favicon.png",
    "android-icon-foreground.png",
]

for fname in files:
    fpath = os.path.join(assets_dir, fname)
    if os.path.exists(fpath):
        compress_png(fpath)

print("Done.")
