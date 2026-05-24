/**
 * Quick-action button — square tile, used on Dashboard.
 *
 * Three or four of these sit in a row beneath the stats; tapping one
 * routes to a tab or opens a flow.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accent: string;
  onPress?: () => void;
}

export function QuickActionButton({
  icon,
  label,
  accent,
  onPress,
}: QuickActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        padding: 12,
        alignItems: "center",
        gap: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: accent + "15",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text className="text-center text-xs font-semibold text-ink-700">
        {label}
      </Text>
    </Pressable>
  );
}
