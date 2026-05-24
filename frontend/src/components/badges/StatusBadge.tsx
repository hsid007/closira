/**
 * Status badge — New / Qualified / Escalated / Processing / Resolved.
 *
 * Color palette mirrors the assignment brief: New=blue, Qualified=green,
 * Escalated=red. Processing and Resolved are added for the full lifecycle.
 */
import { Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import type { EnquiryStatus } from "@/types";
import { statusLabel } from "@/utils/format";

interface StatusBadgeProps {
  status: EnquiryStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const palette = colors.status[status];
  const dotSize = size === "md" ? 7 : 6;

  return (
    <View
      className={
        "flex-row items-center gap-1.5 rounded-full " +
        (size === "md" ? "px-3 py-1.5" : "px-2.5 py-1")
      }
      style={{ backgroundColor: palette.soft }}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: palette.base,
        }}
      />
      <Text
        className="font-semibold"
        style={{ color: palette.ink, fontSize: size === "md" ? 13 : 11 }}
      >
        {statusLabel[status]}
      </Text>
    </View>
  );
}
