/** @type {const} */
const themeColors = {
  // Premium Ghost Mode palette: Deep navy/black (#0A0A0A), glowing orange (#FF6200, #FF9A3D), olive green, terracotta
  // Designed for premium iOS quality with strong visual hierarchy and glowing accents
  
  primary: { light: '#0A0A0A', dark: '#0A0A0A' }, // Deep black (Ghost Mode)
  background: { light: '#0A0A0A', dark: '#0A0A0A' }, // Deep black background
  surface: { light: '#1A1A2E', dark: '#1A1A2E' }, // Dark navy surface cards
  foreground: { light: '#F5F5F5', dark: '#F5F5F5' }, // Bright white text
  muted: { light: '#9CA3AF', dark: '#9CA3AF' }, // Soft gray for secondary text
  border: { light: '#2D2D3D', dark: '#2D2D3D' }, // Dark border with subtle glow
  
  // Glowing orange accents (#FF6200, #FF9A3D) for all interactive elements
  success: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange (primary accent)
  warning: { light: '#FF8C42', dark: '#FFB366' }, // Warm terracotta
  error: { light: '#FF4444', dark: '#FF6666' }, // Warm red
  
  // Primary accents: strong glowing orange for progress ring, streaks, badges
  accent: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange accent
  card: { light: '#1A1A2E', dark: '#1A1A2E' }, // Dark navy cards
  tint: { light: '#FF6200', dark: '#FF9A3D' }, // Glowing orange tint
  
  // Additional colors for graphs and data visualization
  olive: { light: '#7CB342', dark: '#9CCC65' }, // Soft olive green accent
  orange: { light: '#FF6200', dark: '#FF9A3D' }, // Primary glowing orange
  terracotta: { light: '#FF8C42', dark: '#FFB366' }, // Warm terracotta accent
};

module.exports = { themeColors };
