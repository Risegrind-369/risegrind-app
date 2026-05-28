export const ENV = {
  // Supabase PostgreSQL database
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  // Anthropic API for AI features
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",

  // Server config
  port: parseInt(process.env.PORT ?? "3000", 10),
  isProduction: process.env.NODE_ENV === "production",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
};
