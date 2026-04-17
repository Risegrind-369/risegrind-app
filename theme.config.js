/** @type {const} */
const themeColors = {
  // Premium Ghost Mode (Dark) & Light Mode palette
  // Dark: Deep navy/black (#0A0A0A), glowing orange (#FF6200, #FF9A3D)
  // Light: Warm off-white (#F8F5F0), same glowing orange, deep navy text (#1A1A1A)
  
  primary: { light: '#F8F5F0', dark: '#0A0A0A' }, // Warm off-white (light) / Deep black (dark)
  background: { light: '#F8F5F0', dark: '#0A0A0A' }, // Premium light/dark backgrounds
  surface: { light: '#FFFFFF', dark: '#1A1A2E' }, // White cards (light) / Dark navy (dark)
  foreground: { light: '#1A1A1A', dark: '#F5F5F5' }, // Deep navy text (light) / Bright white (dark)
  muted: { light: '#6B7280', dark: '#9CA3AF' }, // Gray text (light) / Soft gray (dark)
  border: { light: '#E5E0D8', dark: '#2D2D3D' }, // Warm border (light) / Dark border (dark)
  
  // Glowing orange accents (#FF6200, #FF9A3D) for all interactive elements
  success: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange (primary accent)
  warning: { light: '#FF8C42', dark: '#FFB366' }, // Warm terracotta
  error: { light: '#EF4444', dark: '#FF6666' }, // Warm red
  
  // Primary accents: strong glowing orange for progress ring, streaks, badges
  accent: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange accent
  card: { light: '#FFFFFF', dark: '#1A1A2E' }, // White cards (light) / Dark navy (dark)
  tint: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange tint
  
  // Additional colors for graphs and data visualization
  olive: { light: '#6B8E23', dark: '#9CCC65' }, // Olive green (light) / Bright olive (dark)
  orange: { light: '#FF6200', dark: '#FF9A3D' }, // Primary glowing orange
  terracotta: { light: '#D97706', dark: '#FFB366' }, // Terracotta (light) / Warm terracotta (dark)
};

module.exports = { themeColors };
