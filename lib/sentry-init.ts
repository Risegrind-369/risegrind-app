// Gracefully handle missing sentry-expo
let Sentry: any = null;
try {
  Sentry = require("sentry-expo");
} catch (e) {
  console.warn("[Sentry] sentry-expo not installed");
}

/**
 * Initialize Sentry for crash monitoring and error tracking
 * Call this in app/_layout.tsx before rendering the app
 */
export function initSentry() {
  // Only initialize if DSN is configured and package is available
  if (!Sentry) {
    console.warn("[Sentry] Package not available, skipping initialization");
    return;
  }

  const sentryDSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!sentryDSN) {
    console.warn("[Sentry] DSN not configured, skipping initialization");
    return;
  }

  Sentry.init({
    dsn: sentryDSN,
    enableInExpoDevelopment: false,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
    integrations: [
      new Sentry.Native.ReactNativeIntegration(),
      new Sentry.Native.CaptureConsoleIntegration({
        levels: ["error", "warn"],
      }),
    ],
  });

  console.log("[Sentry] Initialized with DSN:", sentryDSN.substring(0, 20) + "...");
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!Sentry) return;
  Sentry.captureException(error, {
    contexts: context ? { custom: context } : undefined,
  });
}

/**
 * Capture a message and send to Sentry
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (!Sentry) return;
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: number | string, email?: string, name?: string) {
  if (!Sentry) return;
  Sentry.setUser({
    id: userId.toString(),
    email,
    username: name,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser() {
  if (!Sentry) return;
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addSentryBreadcrumb(message: string, category: string = "user-action", data?: Record<string, any>) {
  if (!Sentry) return;
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}
