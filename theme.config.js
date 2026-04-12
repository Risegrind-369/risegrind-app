/** @type {const} */
const themeColors = {
  // Premium Ghost Mode earth palette with glowing orange accents
  // Deep navy/black background, warm terracotta/orange accents, soft olive, glowing orange highlights
  
  primary: { light: '#1F2937', dark: '#0F0F0F' }, // Deep navy/black
  background: { light: '#FAFAF8', dark: '#0F0F0F' }, // Off-white / deep black
  surface: { light: '#F3F1ED', dark: '#1A1A2E' }, // Warm beige / dark navy
  foreground: { light: '#1F2937', dark: '#F1F5F9' }, // Deep navy / light
  muted: { light: '#78716C', dark: '#A89968' }, // Warm gray / soft olive
  border: { light: '#E7E5E0', dark: '#2D2D3D' }, // Warm border / dark
  
  // Glowing orange/terracotta for all accents (progress ring, badges, highlights)
  success: { light: '#D97706', dark: '#FFA500' }, // Glowing orange
  warning: { light: '#EA580C', dark: '#FF8C42' }, // Warm terracotta
  error: { light: '#DC2626', dark: '#EF4444' }, // Red (unchanged)
  
  // Primary accents: glowing orange (used for progress ring, streaks, badges, graphs)
  accent: { light: '#D97706', dark: '#FFA500' }, // Glowing orange
  card: { light: '#FAFAF8', dark: '#1E1E2E' }, // Off-white / dark navy
  tint: { light: '#D97706', dark: '#FFA500' }, // Glowing orange tint
  
  // Additional colors for graphs and data visualization
  olive: { light: '#84CC16', dark: '#BEF264' }, // Soft olive green
  orange: { light: '#D97706', dark: '#FFA500' }, // Glowing orange (primary accent)
  terracotta: { light: '#EA580C', dark: '#FF8C42' }, // Warm terracotta
};

module.exports = { themeColors };
