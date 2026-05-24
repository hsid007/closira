/**
 * Urgency indicator — used on escalation cards.
 */
import { Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import type { Urgency } from "@/types";

interface UrgencyBadgeProps {
  urgency: Urgency;
}

const LABELS: Record<Urgency, string> = {
  high: "HIGH",
  medium: "MED",
  low: "LOW",
};

export function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  const color = colors.urgency[urgency];
  return (
    <View
      className="flex-row items-center gap-1 rounded-md px-2 py-0.5"
      style={{ backgroundColor: color + "1A", borderWidth: 1, borderColor: color + "40" }}
    >
      <View
        style={{
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
        }}
      />
      <Text className="font-bold" style={{ color, fontSize: 10, letterSpacing: 0.4 }}>
        {LABELS[urgency]}
      </Text>
    </View>
  );
}
