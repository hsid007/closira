/**
 * Button — primary, secondary, ghost, and danger variants.
 *
 * Uses Pressable so the touch feedback is consistent across iOS and Android.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme/tokens";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  size?: "sm" | "md";
  disabled?: boolean;
}

const VARIANTS: Record<
  Variant,
  { bg: string; fg: string; border?: string }
> = {
  primary:   { bg: colors.ink[900], fg: "#FFFFFF" },
  secondary: { bg: "#FFFFFF", fg: colors.ink[800], border: colors.ink[200] },
  ghost:     { bg: "transparent", fg: colors.ink[700] },
  danger:    { bg: colors.status.escalated.base, fg: "#FFFFFF" },
};

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  fullWidth,
  size = "md",
  disabled,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const py = size === "sm" ? 8 : 12;
  const px = size === "sm" ? 12 : 16;
  const fs = size === "sm" ? 13 : 14;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: py,
        paddingHorizontal: px,
        borderRadius: 12,
        backgroundColor: palette.bg,
        borderWidth: palette.border ? 1 : 0,
        borderColor: palette.border,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        alignSelf: fullWidth ? "stretch" : "flex-start",
      })}
    >
      {icon ? <Ionicons name={icon} size={fs + 2} color={palette.fg} /> : null}
      <Text style={{ color: palette.fg, fontSize: fs, fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  );
}
