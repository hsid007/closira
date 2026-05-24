/**
 * Channel badge — WhatsApp / Email / Call.
 *
 * Two sizes:
 *   - `sm` (default): pill with icon + label, used on cards.
 *   - `xs`: icon only, used in dense lists / activity feed.
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import type { Channel } from "@/types";
import { channelLabel } from "@/utils/format";

interface ChannelBadgeProps {
  channel: Channel;
  size?: "xs" | "sm" | "md";
  withLabel?: boolean;
}

const ICONS: Record<Channel, keyof typeof Ionicons.glyphMap> = {
  whatsapp: "logo-whatsapp",
  email: "mail-outline",
  call: "call-outline",
};

export function ChannelBadge({
  channel,
  size = "sm",
  withLabel = true,
}: ChannelBadgeProps) {
  const palette = colors.channel[channel];
  const iconSize = size === "xs" ? 12 : size === "md" ? 16 : 14;
  const showLabel = withLabel && size !== "xs";

  return (
    <View
      className={
        "flex-row items-center gap-1.5 rounded-full " +
        (size === "xs" ? "px-1.5 py-1" : "px-2.5 py-1")
      }
      style={{ backgroundColor: palette.soft }}
    >
      <Ionicons name={ICONS[channel]} size={iconSize} color={palette.base} />
      {showLabel ? (
        <Text
          className="font-semibold"
          style={{ color: palette.ink, fontSize: size === "md" ? 13 : 11 }}
        >
          {channelLabel[channel]}
        </Text>
      ) : null}
    </View>
  );
}
