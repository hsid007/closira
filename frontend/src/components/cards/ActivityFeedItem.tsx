/**
 * Activity-feed row — single event in the dashboard's recent activity list.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ChannelBadge } from "@/components/badges/ChannelBadge";
import { Avatar } from "@/components/common/Avatar";
import type { ActivityFeedItem as ActivityItem } from "@/types";
import { timeAgo } from "@/utils/format";

interface ActivityFeedItemProps {
  item: ActivityItem;
  onPress?: () => void;
}

const TYPE_META: Record<
  ActivityItem["type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  new_enquiry:   { icon: "sparkles-outline",        color: "#3B82F6" },
  qualified:     { icon: "checkmark-circle-outline", color: "#16A34A" },
  escalated:     { icon: "alert-circle-outline",     color: "#DC2626" },
  follow_up_due: { icon: "time-outline",             color: "#F59E0B" },
  resolved:      { icon: "checkmark-done-outline",   color: "#64748B" },
};

export function ActivityFeedItem({ item, onPress }: ActivityFeedItemProps) {
  const meta = TYPE_META[item.type];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Avatar name={item.customer_name} size={36} />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text
            className="font-semibold text-ink-900"
            style={{ fontSize: 14 }}
            numberOfLines={1}
          >
            {item.customer_name}
          </Text>
          <ChannelBadge channel={item.channel} size="xs" withLabel={false} />
        </View>
        <Text
          className="text-xs text-ink-500"
          numberOfLines={1}
          style={{ lineHeight: 16 }}
        >
          {item.description}
        </Text>
      </View>
      <View className="items-end gap-1">
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            backgroundColor: meta.color + "15",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        <Text className="text-[10px] text-ink-400">
          {timeAgo(item.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}
