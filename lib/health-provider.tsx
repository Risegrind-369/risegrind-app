/**
 * Apple Health Provider
 *
 * Reads Steps and Sleep data from HealthKit (iOS only).
 * Provides auto-validation for Movement and Sleep habits.
 * Falls back gracefully on Android, web, and Expo Go.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthData {
  stepsToday: number | null;
  sleepLastNight: number | null; // hours
  isAvailable: boolean;
  isAuthorized: boolean;
  lastUpdated: Date | null;
}

interface HealthContextValue extends HealthData {
  requestPermissions: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_HEALTH: HealthData = {
  stepsToday: null,
  sleepLastNight: null,
  isAvailable: false,
  isAuthorized: false,
  lastUpdated: null,
};

// ─── Context ──────────────────────────────────────────────────────────────────

const HealthContext = createContext<HealthContextValue>({
  ...DEFAULT_HEALTH,
  requestPermissions: async () => false,
  refresh: async () => {},
});

export function useHealth() {
  return useContext(HealthContext);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when running in a real native build (not Expo Go, not web) */
function isNativeBuild(): boolean {
  if (Platform.OS === "web") return false;
  const execEnv = Constants.executionEnvironment as string;
  return execEnv === "storeClient" || execEnv === "standalone";
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function HealthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HealthData>(DEFAULT_HEALTH);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isNativeBuild() || Platform.OS !== "ios") return false;
    try {
      const AppleHealthKit = (await import("react-native-health")).default;
      const permissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.SleepAnalysis,
          ],
          write: [] as typeof AppleHealthKit.Constants.Permissions[keyof typeof AppleHealthKit.Constants.Permissions][],
        },
      };
      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, (err: unknown) => {
          if (err) {
            console.warn("[HealthKit] Permission denied:", err);
            setData((prev) => ({ ...prev, isAvailable: true, isAuthorized: false }));
            resolve(false);
          } else {
            setData((prev) => ({ ...prev, isAvailable: true, isAuthorized: true }));
            resolve(true);
          }
        });
      });
    } catch (e) {
      console.warn("[HealthKit] Not available:", e);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!isNativeBuild() || Platform.OS !== "ios") return;
    try {
      const AppleHealthKit = (await import("react-native-health")).default;
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Fetch today's steps
      AppleHealthKit.getStepCount(
        { date: startOfDay.toISOString() },
        (err: unknown, results: { value?: number }) => {
          if (!err && results?.value != null) {
            setData((prev) => ({ ...prev, stepsToday: Math.round(results.value ?? 0), lastUpdated: new Date() }));
          }
        }
      );

      // Fetch last night's sleep (past 12 hours)
      const sleepStart = new Date(today.getTime() - 12 * 60 * 60 * 1000);
      AppleHealthKit.getSleepSamples(
        {
          startDate: sleepStart.toISOString(),
          endDate: today.toISOString(),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err: unknown, results: any[]) => {
          if (!err && Array.isArray(results) && results.length > 0) {
            // Sum up "ASLEEP" samples in hours
            const totalMs = results
              .filter((s) => s.value === "ASLEEP" || s.value === "CORE" || s.value === "DEEP" || s.value === "REM")
              .reduce((sum, s) => {
                const ms = new Date(s.endDate).getTime() - new Date(s.startDate).getTime();
                return sum + ms;
              }, 0);
            const hours = Math.round((totalMs / (1000 * 60 * 60)) * 10) / 10;
            setData((prev) => ({ ...prev, sleepLastNight: hours, lastUpdated: new Date() }));
          }
        }
      );
    } catch (e) {
      console.warn("[HealthKit] Refresh error:", e);
    }
  }, []);

  // Permission is now requested lazily (on-demand) rather than on app mount
  // This allows us to show HealthPermissionSheet first, then trigger native dialog
  // See ai-chat.tsx for the lazy permission request pattern

  return (
    <HealthContext.Provider value={{ ...data, requestPermissions, refresh }}>
      {children}
    </HealthContext.Provider>
  );
}

// ─── Auto-validation helpers ──────────────────────────────────────────────────

/** Returns true if today's step count meets the threshold for a "Movement" habit */
export function stepsValidatesMovement(steps: number | null, threshold = 7500): boolean {
  return steps !== null && steps >= threshold;
}

/** Returns true if last night's sleep meets the threshold for a "Sleep" habit */
export function sleepValidatesSleep(hours: number | null, threshold = 7): boolean {
  return hours !== null && hours >= threshold;
}
