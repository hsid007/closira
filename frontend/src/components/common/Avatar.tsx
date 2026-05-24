/**
 * Initials avatar.
 *
 * Background color is deterministically derived from the name so the same
 * person is always the same color across screens.
 */
import { Text, View } from "react-native";

import { initials } from "@/utils/format";

interface AvatarProps {
  name: string;
  size?: number;
}

// Curated palette — saturated enough to read at small sizes, muted enough
// to not fight the status badges next to them.
const PALETTE = [
  { bg: "#FEE2E2", fg: "#B91C1C" },
  { bg: "#FED7AA", fg: "#9A3412" },
  { bg: "#FEF08A", fg: "#854D0E" },
  { bg: "#BBF7D0", fg: "#166534" },
  { bg: "#A7F3D0", fg: "#065F46" },
  { bg: "#BFDBFE", fg: "#1E40AF" },
  { bg: "#C7D2FE", fg: "#3730A3" },
  { bg: "#DDD6FE", fg: "#5B21B6" },
  { bg: "#FBCFE8", fg: "#9D174D" },
];

function hashIndex(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

export function Avatar({ name, size = 36 }: AvatarProps) {
  const swatch = PALETTE[hashIndex(name)];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: swatch.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: swatch.fg,
          fontSize: size * 0.4,
          fontWeight: "700",
        }}
      >
        {initials(name) || "?"}
      </Text>
    </View>
  );
}
