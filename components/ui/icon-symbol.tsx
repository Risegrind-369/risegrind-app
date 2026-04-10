// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mapping for RiseGrind.
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "list.bullet": "checklist",
  "book.fill": "menu-book",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "pencil": "edit",
  "trash": "delete",
  "trash.fill": "delete",
  "arrow.right": "arrow-forward",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "chevron.left.forwardslash.chevron.right": "code",
  "paperplane.fill": "send",
  // Content
  "flame.fill": "local-fire-department",
  "star.fill": "star",
  "trophy.fill": "emoji-events",
  "bolt.fill": "bolt",
  "heart.fill": "favorite",
  "moon.fill": "nightlight-round",
  "sun.max.fill": "wb-sunny",
  "sparkles": "auto-awesome",
  "wand.and.stars": "auto-fix-high",
  "brain.head.profile": "psychology",
  "lightbulb.fill": "lightbulb",
  "calendar": "calendar-today",
  "clock.fill": "schedule",
  "bell.fill": "notifications",
  "gear": "settings",
  "lock.fill": "lock",
  "crown.fill": "workspace-premium",
  "arrow.clockwise": "refresh",
  "square.and.arrow.up": "ios-share",
  "info.circle": "info",
  "questionmark.circle": "help",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
