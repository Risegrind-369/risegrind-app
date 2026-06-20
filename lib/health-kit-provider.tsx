/**
 * Apple HealthKit Integration Provider
 * Handles permission requests and data syncing for sleep, steps, and active energy
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as AppleHealthKit from "react-native-health";
import { useAuth } from "@/lib/use-auth-supabase";

// Type AppleHealthKit as any to avoid type issues with the library
const HealthKit = AppleHealthKit as any;

interface HealthData {
  sleepHours?: number;
  steps?: number;
  activeEnergy?: number;
  morningEnergyScore?: number;
  lastSyncedAt?: Date;
}

interface HealthKitContextType {
  isHealthKitAvailable: boolean;
  isPermissionGranted: boolean;
  requestHealthKitPermission: () => Promise<boolean>;
  syncHealthData: (date?: Date) => Promise<HealthData | null>;
  getTodayHealthData: () => Promise<HealthData | null>;
  getHealthDataRange: (startDate: Date, endDate: Date) => Promise<HealthData[]>;
  loading: boolean;
  error: string | null;
}

const HealthKitContext = createContext<HealthKitContextType | undefined>(undefined);

export function HealthKitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only available on iOS
  const isHealthKitAvailable = Platform.OS === "ios";

  // Initialize HealthKit on mount
  useEffect(() => {
    if (!isHealthKitAvailable) return;

    const initHealthKit = async () => {
      try {
        const permissions = {
          permissions: {
            read: [
              HealthKit.HKQuantityTypeIdentifierStepCount,
              HealthKit.HKQuantityTypeIdentifierSleepAnalysis,
              HealthKit.HKQuantityTypeIdentifierActiveEnergyBurned,
            ],
          },
        };

        HealthKit.initHealthKit(permissions, (err: any) => {
          if (err) {
            console.warn("[HealthKit] Init error:", err);
            setError(err.message);
          } else {
            console.log("[HealthKit] Initialized successfully");
          }
        });
      } catch (err) {
        console.warn("[HealthKit] Init failed:", err);
      }
    };

    initHealthKit();
  }, [isHealthKitAvailable]);

  /**
   * Request HealthKit permission from user
   */
  const requestHealthKitPermission = async (): Promise<boolean> => {
    if (!isHealthKitAvailable) return false;

    return new Promise((resolve) => {
      const permissions = {
        permissions: {
          read: [
            HealthKit.HKQuantityTypeIdentifierStepCount,
            HealthKit.HKQuantityTypeIdentifierSleepAnalysis,
            HealthKit.HKQuantityTypeIdentifierActiveEnergyBurned,
          ],
        },
      };

      HealthKit.requestAuthorizationToShare(
        permissions.permissions.read,
        [],
        (err: any) => {
          if (err) {
            console.warn("[HealthKit] Permission denied:", err);
            setIsPermissionGranted(false);
            resolve(false);
          } else {
            console.log("[HealthKit] Permission granted");
            setIsPermissionGranted(true);
            resolve(true);
          }
        }
      );
    });
  };

  /**
   * Fetch health data for a specific date
   */
  const fetchHealthDataForDate = async (date: Date): Promise<HealthData | null> => {
    if (!isHealthKitAvailable || !isPermissionGranted) return null;

    return new Promise((resolve) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const healthData: HealthData = {};

      // Fetch steps
      HealthKit.getSteps(
        {
          startDate: startOfDay,
          endDate: endOfDay,
        },
        (err: any, result: any) => {
          if (!err) {
            healthData.steps = result.value || 0;
          }
        }
      );

      // Fetch sleep
      HealthKit.getSleepSamples(
        {
          startDate: startOfDay,
          endDate: endOfDay,
        },
        (err: any, result: any) => {
          if (!err && result.length > 0) {
            // Sum all sleep samples for the day
            const totalSleep = result.reduce((sum: number, sample: any) => {
              const duration = (sample.endDate - sample.startDate) / (1000 * 60 * 60); // Convert to hours
              return sum + duration;
            }, 0);
            healthData.sleepHours = Math.round(totalSleep * 10) / 10; // Round to 1 decimal
          }
        }
      );

      // Fetch active energy
      HealthKit.getActiveEnergy(
        {
          startDate: startOfDay,
          endDate: endOfDay,
        },
        (err: any, result: any) => {
          if (!err) {
            healthData.activeEnergy = result.value || 0;
          }
        }
      );

      // Resolve after a short delay to allow all callbacks to complete
      setTimeout(() => {
        resolve(healthData);
      }, 500);
    });
  };

  /**
   * Sync health data and save to backend
   */
  const syncHealthData = async (dateInput?: Date): Promise<HealthData | null> => {
    if (!user?.id) return null;

    setLoading(true);
    setError(null);

    try {
      const date = dateInput || new Date();
      const healthData = await fetchHealthDataForDate(date);

      if (!healthData || Object.keys(healthData).length === 0) {
        return null;
      }

      // Calculate morning energy score
      const morningEnergyScore = calculateMorningEnergyScore(
        healthData.sleepHours,
        healthData.steps,
        healthData.activeEnergy
      );

      // Save to backend via tRPC (health router will be added)
      // For now, just log the data
      console.log("[HealthKit] Synced data:", {
        date,
        sleepHours: healthData.sleepHours,
        steps: healthData.steps,
        activeEnergy: healthData.activeEnergy,
        morningEnergyScore,
      });

      return {
        ...healthData,
        morningEnergyScore,
        lastSyncedAt: new Date(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("[HealthKit] Sync failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get today's health data
   */
  const getTodayHealthData = async (): Promise<HealthData | null> => {
    return syncHealthData(new Date());
  };

  /**
   * Get health data for a date range
   */
  const getHealthDataRange = async (
    startDate: Date,
    endDate: Date
  ): Promise<HealthData[]> => {
    if (!isHealthKitAvailable || !isPermissionGranted) return [];

    const results: HealthData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const data = await fetchHealthDataForDate(currentDate);
      if (data && Object.keys(data).length > 0) {
        results.push(data);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return results;
  };

  const value: HealthKitContextType = {
    isHealthKitAvailable,
    isPermissionGranted,
    requestHealthKitPermission,
    syncHealthData,
    getTodayHealthData,
    getHealthDataRange,
    loading,
    error,
  };

  return (
    <HealthKitContext.Provider value={value}>
      {children}
    </HealthKitContext.Provider>
  );
}

export function useHealthKit() {
  const context = useContext(HealthKitContext);
  if (!context) {
    throw new Error("useHealthKit must be used within HealthKitProvider");
  }
  return context;
}

/**
 * Calculate Morning Energy Score (0-100)
 * Based on sleep hours and activity level
 */
function calculateMorningEnergyScore(
  sleepHours?: number,
  steps?: number,
  activeEnergy?: number
): number {
  let score = 50; // Base score

  // Sleep scoring: 7-8 hours = 100%, less/more = penalty
  if (sleepHours) {
    if (sleepHours >= 7 && sleepHours <= 8) {
      score += 30; // Full points
    } else if (sleepHours >= 6 && sleepHours < 9) {
      score += 20; // Partial points
    } else if (sleepHours < 5) {
      score -= 20; // Penalty for poor sleep
    }
  }

  // Activity scoring: 10k+ steps = 20 points
  if (steps && steps >= 10000) {
    score += 20;
  } else if (steps && steps >= 5000) {
    score += 10;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}
