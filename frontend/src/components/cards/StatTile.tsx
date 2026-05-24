/**
 * Stat tile — single big number with label and a colored accent strip.
 *
 * Used on the Dashboard for the four headline metrics. Tiles are flex:1
 * inside a row so the layout adapts to any number of them.
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface StatTileProps {
  label: string;
  value: number | string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  accent: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function StatTile({
  label,
  value,
  delta,
  trend,
  accent,
  icon,
}: StatTileProps) {
  const trendColor =
    trend === "up" ? "#16A34A" : trend === "down" ? "#DC2626" : "#8B98AD";
  const trendIcon =
    trend === "up"
      ? "trending-up"
      : trend === "down"
        ? "trending-down"
        : "remove";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        padding: 14,
        gap: 10,
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: accent + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={16} color={accent} />
        </View>
        {delta ? (
          <View className="flex-row items-center gap-0.5">
            <Ionicons name={trendIcon} size={12} color={trendColor} />
            <Text style={{ fontSize: 11, color: trendColor, fontWeight: "600" }}>
              {delta}
            </Text>
          </View>
        ) : null}
      </View>

      <View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#0B1220",
            letterSpacing: -0.5,
          }}
        >
          {value}
        </Text>
        <Text className="mt-0.5 text-xs font-medium text-ink-500">{label}</Text>
      </View>
    </View>
  );
}
