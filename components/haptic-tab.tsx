import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Haptic feedback on tab press
        if (process.env.EXPO_OS === "ios" || process.env.EXPO_OS === "android") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
      onPress={(ev) => {
        // Additional haptic feedback on successful tab switch
        if (process.env.EXPO_OS === "ios" || process.env.EXPO_OS === "android") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        props.onPress?.(ev);
      }}
    />
  );
}
