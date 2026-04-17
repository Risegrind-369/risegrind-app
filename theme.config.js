/** @type {const} */
const themeColors = {
  // Premium Ghost Mode (Dark) & Light Mode palette
  // Dark: Deep navy/black (#0A0A0A), glowing orange (#FF6200, #FF9A3D)
  // Light: Warm off-white (#F8F5F0), Italian Earth Green accents (#6B8E23, #8B9D3D, #556B2F)
  
  primary: { light: '#F8F5F0', dark: '#0A0A0A' }, // Warm off-white (light) / Deep black (dark)
  background: { light: '#F8F5F0', dark: '#0A0A0A' }, // Premium light/dark backgrounds
  surface: { light: '#FFFFFF', dark: '#1A1A2E' }, // White cards (light) / Dark navy (dark)
  foreground: { light: '#1A1A1A', dark: '#F5F5F5' }, // Deep navy text (light) / Bright white (dark)
  muted: { light: '#6B7280', dark: '#9CA3AF' }, // Gray text (light) / Soft gray (dark)
  border: { light: '#E5E0D8', dark: '#2D2D3D' }, // Warm border (light) / Dark border (dark)
  
  // Italian Earth Green accents for Light Mode (#6B8E23, #8B9D3D, #556B2F)
  // Glowing orange accents (#FF6200, #FF9A3D) for Dark Mode
  success: { light: '#6B8E23', dark: '#FF9A3D' }, // Earth Green (light) / Glowing orange (dark)
  warning: { light: '#8B9D3D', dark: '#FFB366' }, // Lighter Earth Green (light) / Warm terracotta (dark)
  error: { light: '#EF4444', dark: '#FF6666' }, // Warm red (both modes)
  
  // Primary accents: Earth Green for Light Mode, glowing orange for Dark Mode
  accent: { light: '#6B8E23', dark: '#FF9A3D' }, // Earth Green (light) / Glowing orange (dark)
  card: { light: '#FFFFFF', dark: '#1A1A2E' }, // White cards (light) / Dark navy (dark)
  tint: { light: '#6B8E23', dark: '#FF9A3D' }, // Earth Green (light) / Glowing orange (dark)
  
  // Additional colors for graphs and data visualization
  olive: { light: '#6B8E23', dark: '#9CCC65' }, // Olive green (light) / Bright olive (dark)
  orange: { light: '#6B8E23', dark: '#FF9A3D' }, // Earth Green (light) / Primary glowing orange (dark)
  terracotta: { light: '#8B9D3D', dark: '#FFB366' }, // Light Earth Green (light) / Warm terracotta (dark)
};

module.exports = { themeColors };
