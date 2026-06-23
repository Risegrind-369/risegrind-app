/**
 * Debug Logger Utility
 * Logs navigation and guard events to console and optionally to a server endpoint
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export interface DebugLogEntry {
  label: string;
  timestamp: number;
  data: Record<string, any>;
}

const logs: DebugLogEntry[] = [];

export async function debugLog(label: string, data: Record<string, any>) {
  const entry: DebugLogEntry = {
    label,
    timestamp: Date.now(),
    data,
  };

  logs.push(entry);
  console.log(`[DEBUG-LOG] ${label}:`, data);

  // Optionally send to server for persistent logging
  try {
    await fetch(`${API_URL}/api/debug-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {
      // Silently fail if server not available
    });
  } catch (e) {
    // Ignore network errors
  }
}

export function getDebugLogs() {
  return logs;
}

export function clearDebugLogs() {
  logs.length = 0;
}
