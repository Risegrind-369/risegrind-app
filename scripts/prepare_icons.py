#!/usr/bin/env python3
"""
Prepare all required icon assets for the RiseGrind app.
Source: /home/ubuntu/webdev-static-assets/risegrind-icon.png (2048x2048)
Splash: /home/ubuntu/webdev-static-assets/risegrind-splash.png (1536x2752)
"""
from PIL import Image
import os

src_icon = "/home/ubuntu/webdev-static-assets/risegrind-icon.png"
src_splash = "/home/ubuntu/webdev-static-assets/risegrind-splash.png"
assets_dir = "/home/ubuntu/risegrind/assets/images"

os.makedirs(assets_dir, exist_ok=True)

icon = Image.open(src_icon).convert("RGBA")
splash = Image.open(src_splash).convert("RGBA")

# 1. App icon — 1024x1024
icon_1024 = icon.resize((1024, 1024), Image.LANCZOS)
icon_1024.save(os.path.join(assets_dir, "icon.png"), "PNG")
print("✓ icon.png (1024x1024)")

# 2. Splash icon — 200x200 (centered logo for expo-splash-screen)
#    Extract the center 60% of the icon for the splash icon
w, h = icon.size
crop_size = int(min(w, h) * 0.7)
left = (w - crop_size) // 2
top = (h - crop_size) // 2
icon_cropped = icon.crop((left, top, left + crop_size, top + crop_size))
splash_icon = icon_cropped.resize((200, 200), Image.LANCZOS)
splash_icon.save(os.path.join(assets_dir, "splash-icon.png"), "PNG")
print("✓ splash-icon.png (200x200)")

# 3. Favicon — 48x48
favicon = icon.resize((48, 48), Image.LANCZOS)
favicon.save(os.path.join(assets_dir, "favicon.png"), "PNG")
print("✓ favicon.png (48x48)")

# 4. Android adaptive icon foreground — 1024x1024
# For Android adaptive icons, the foreground should be centered with padding
android_fg = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
# Scale icon to 72% of canvas (safe zone for adaptive icons)
safe_size = int(1024 * 0.72)
icon_safe = icon.resize((safe_size, safe_size), Image.LANCZOS)
offset = (1024 - safe_size) // 2
android_fg.paste(icon_safe, (offset, offset), icon_safe)
android_fg.save(os.path.join(assets_dir, "android-icon-foreground.png"), "PNG")
print("✓ android-icon-foreground.png (1024x1024)")

print("\nAll icon assets prepared successfully!")
