import { describe, it, expect } from "vitest";
import { themeColors } from "../theme.config";

describe("Theme Colors - Light/Dark Mode Consistency", () => {
  describe("Light Mode Colors", () => {
    it("should have Earth Green accents in Light Mode", () => {
      expect(themeColors.success.light).toBe("#6B8E23"); // Olive Green
      expect(themeColors.warning.light).toBe("#8B9D3D"); // Lighter Olive
      expect(themeColors.accent.light).toBe("#6B8E23"); // Earth Green
      expect(themeColors.tint.light).toBe("#6B8E23"); // Earth Green
    });

    it("should have warm off-white background in Light Mode", () => {
      expect(themeColors.primary.light).toBe("#F8F5F0"); // Warm off-white
      expect(themeColors.background.light).toBe("#F8F5F0"); // Warm off-white
    });

    it("should have deep navy text in Light Mode", () => {
      expect(themeColors.foreground.light).toBe("#1A1A1A"); // Deep navy
    });

    it("should have white surface in Light Mode", () => {
      expect(themeColors.surface.light).toBe("#FFFFFF"); // White cards
      expect(themeColors.card.light).toBe("#FFFFFF"); // White cards
    });

    it("should have warm border in Light Mode", () => {
      expect(themeColors.border.light).toBe("#E5E0D8"); // Warm border
    });

    it("should have gray muted text in Light Mode", () => {
      expect(themeColors.muted.light).toBe("#6B7280"); // Gray text
    });
  });

  describe("Dark Mode Colors", () => {
    it("should have glowing orange accents in Dark Mode", () => {
      expect(themeColors.success.dark).toBe("#FF9A3D"); // Glowing orange
      expect(themeColors.warning.dark).toBe("#FFB366"); // Warm terracotta
      expect(themeColors.accent.dark).toBe("#FF9A3D"); // Glowing orange
      expect(themeColors.tint.dark).toBe("#FF9A3D"); // Glowing orange
    });

    it("should have deep black background in Dark Mode", () => {
      expect(themeColors.primary.dark).toBe("#0A0A0A"); // Deep black
      expect(themeColors.background.dark).toBe("#0A0A0A"); // Deep black
    });

    it("should have bright white text in Dark Mode", () => {
      expect(themeColors.foreground.dark).toBe("#F5F5F5"); // Bright white
    });

    it("should have dark navy surface in Dark Mode", () => {
      expect(themeColors.surface.dark).toBe("#1A1A2E"); // Dark navy
      expect(themeColors.card.dark).toBe("#1A1A2E"); // Dark navy
    });

    it("should have dark border in Dark Mode", () => {
      expect(themeColors.border.dark).toBe("#2D2D3D"); // Dark border
    });

    it("should have soft gray muted text in Dark Mode", () => {
      expect(themeColors.muted.dark).toBe("#9CA3AF"); // Soft gray
    });
  });

  describe("Consistency Checks", () => {
    it("should have error colors in both modes", () => {
      expect(themeColors.error.light).toBe("#EF4444"); // Warm red
      expect(themeColors.error.dark).toBe("#FF6666"); // Warm red
    });

    it("should have all required color tokens", () => {
      const requiredTokens = [
        "primary",
        "background",
        "surface",
        "foreground",
        "muted",
        "border",
        "success",
        "warning",
        "error",
        "accent",
        "card",
        "tint",
        "olive",
        "orange",
        "terracotta",
      ];

      requiredTokens.forEach((token) => {
        expect(themeColors).toHaveProperty(token);
        expect(themeColors[token as keyof typeof themeColors]).toHaveProperty("light");
        expect(themeColors[token as keyof typeof themeColors]).toHaveProperty("dark");
      });
    });

    it("should have different colors for Light and Dark modes", () => {
      const tokens = [
        "primary",
        "background",
        "surface",
        "foreground",
        "border",
        "success",
        "warning",
        "accent",
        "card",
        "tint",
      ];

      tokens.forEach((token) => {
        const colorToken = themeColors[token as keyof typeof themeColors];
        expect(colorToken.light).not.toBe(colorToken.dark);
      });
    });

    it("should have valid hex color codes", () => {
      const hexRegex = /^#[0-9A-F]{6}$/i;

      Object.entries(themeColors).forEach(([tokenName, colorObj]) => {
        expect(colorObj.light).toMatch(hexRegex);
        expect(colorObj.dark).toMatch(hexRegex);
      });
    });
  });

  describe("Italian Earth Green Palette (Light Mode)", () => {
    it("should use Earth Green as primary accent in Light Mode", () => {
      // All accent-related colors should be Earth Green shades in Light Mode
      const earthGreenAccents = [
        themeColors.success.light,
        themeColors.accent.light,
        themeColors.tint.light,
      ];

      const earthGreenShades = ["#6B8E23", "#8B9D3D", "#556B2F"];
      earthGreenAccents.forEach((accent) => {
        expect(earthGreenShades).toContain(accent);
      });
    });

    it("should have warm, natural tones in Light Mode", () => {
      // Background should be warm off-white
      expect(themeColors.background.light).toBe("#F8F5F0");
      // Border should be warm
      expect(themeColors.border.light).toBe("#E5E0D8");
      // Text should be deep, readable
      expect(themeColors.foreground.light).toBe("#1A1A1A");
    });
  });

  describe("Glowing Orange Palette (Dark Mode)", () => {
    it("should use glowing orange as primary accent in Dark Mode", () => {
      // All accent-related colors should be orange shades in Dark Mode
      const orangeAccents = [
        themeColors.success.dark,
        themeColors.accent.dark,
        themeColors.tint.dark,
      ];

      const orangeShades = ["#FF9A3D", "#FFB366"];
      orangeAccents.forEach((accent) => {
        expect(orangeShades).toContain(accent);
      });
    });

    it("should have premium dark tones in Dark Mode", () => {
      // Background should be deep black
      expect(themeColors.background.dark).toBe("#0A0A0A");
      // Surface should be dark navy
      expect(themeColors.surface.dark).toBe("#1A1A2E");
      // Text should be bright white
      expect(themeColors.foreground.dark).toBe("#F5F5F5");
    });
  });
});
