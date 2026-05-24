/**
 * InfoCard — labelled bordered surface for showing AI-generated content
 * (summary, matched SOP, suggested response) on Conversation Detail.
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface InfoCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "warning" | "success";
}

const TONE_BG: Record<NonNullable<InfoCardProps["tone"]>, string> = {
  neutral: "#FFFFFF",
  accent:  "#F2F2FF",
  warning: "#FEF4E2",
  success: "#E7F7EC",
};

export function InfoCard({
  icon,
  iconColor,
  label,
  value,
  tone = "neutral",
}: InfoCardProps) {
  return (
    <View
      style={{
        backgroundColor: TONE_BG[tone],
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        padding: 14,
        gap: 8,
      }}
    >
      <View className="flex-row items-center gap-2">
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            backgroundColor: iconColor + "1F",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={12} color={iconColor} />
        </View>
        <Text className="text-[11px] font-bold uppercase tracking-widest text-ink-500">
          {label}
        </Text>
      </View>
      <Text className="text-sm text-ink-800" style={{ lineHeight: 20 }}>
        {value}
      </Text>
    </View>
  );
}
