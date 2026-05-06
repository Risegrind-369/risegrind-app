import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Gracefully handle missing expo-app-tracking-transparency
let AppTrackingTransparency: any = null;
try {
  AppTrackingTransparency = require("expo-app-tracking-transparency");
} catch (e) {
  console.warn("[ATT] expo-app-tracking-transparency not installed");
}

const ATT_PROMPT_SHOWN_KEY = "att_prompt_shown";
const ATT_PERMISSION_KEY = "att_permission";

/**
 * Request App Tracking Transparency (ATT) permission on iOS 14+
 * Required by Apple if the app uses analytics or ad tracking
 * 
 * This should be called once after user completes onboarding
 */
export async function requestATTPermission(): Promise<boolean> {
  // Only on iOS
  if (Platform.OS !== "ios" || !AppTrackingTransparency) {
    return false;
  }

  try {
    // Check if we've already shown the prompt
    const alreadyShown = await AsyncStorage.getItem(ATT_PROMPT_SHOWN_KEY);
    if (alreadyShown === "true") {
      // Get cached permission status
      const cached = await AsyncStorage.getItem(ATT_PERMISSION_KEY);
      return cached === "granted";
    }

    // Get current tracking status
    const currentStatus = await AppTrackingTransparency.getTrackingPermissionsAsync();

    // If already determined, don't show prompt again
    if (
      currentStatus.status !== AppTrackingTransparency.TrackingPermissionStatus.UNDETERMINED
    ) {
      await AsyncStorage.setItem(ATT_PROMPT_SHOWN_KEY, "true");
      const granted =
        currentStatus.status ===
        AppTrackingTransparency.TrackingPermissionStatus.GRANTED;
      await AsyncStorage.setItem(ATT_PERMISSION_KEY, granted ? "granted" : "denied");
      return granted;
    }

    // Request permission
    const { status } = await AppTrackingTransparency.requestTrackingPermissionsAsync();

    // Cache the result
    await AsyncStorage.setItem(ATT_PROMPT_SHOWN_KEY, "true");
    const granted = status === AppTrackingTransparency.TrackingPermissionStatus.GRANTED;
    await AsyncStorage.setItem(ATT_PERMISSION_KEY, granted ? "granted" : "denied");

    console.log(`[ATT] Permission status: ${status}`);

    return granted;
  } catch (error) {
    console.error("[ATT] Error requesting permission:", error);
    return false;
  }
}

/**
 * Check if ATT permission has been granted
 */
export async function hasATTPermission(): Promise<boolean> {
  if (Platform.OS !== "ios" || !AppTrackingTransparency) {
    return false;
  }

  try {
    const cached = await AsyncStorage.getItem(ATT_PERMISSION_KEY);
    if (cached) {
      return cached === "granted";
    }

    const status = await AppTrackingTransparency.getTrackingPermissionsAsync();
    const granted =
      status.status === AppTrackingTransparency.TrackingPermissionStatus.GRANTED;

    await AsyncStorage.setItem(ATT_PERMISSION_KEY, granted ? "granted" : "denied");
    return granted;
  } catch (error) {
    console.error("[ATT] Error checking permission:", error);
    return false;
  }
}

/**
 * Reset ATT prompt (for testing/development)
 */
export async function resetATTPrompt(): Promise<void> {
  await AsyncStorage.removeItem(ATT_PROMPT_SHOWN_KEY);
  await AsyncStorage.removeItem(ATT_PERMISSION_KEY);
}
