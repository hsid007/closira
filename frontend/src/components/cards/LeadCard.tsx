/**
 * Lead card — primary list item on the Leads tab.
 *
 * Layout: avatar | name + message preview | channel badge + status badge + time.
 * Tapping the whole card opens the Conversation Detail screen.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ChannelBadge } from "@/components/badges/ChannelBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { Avatar } from "@/components/common/Avatar";
import type { Enquiry } from "@/types";
import { timeAgo } from "@/utils/format";

interface LeadCardProps {
  enquiry: Enquiry;
  onPress?: () => void;
}

export function LeadCard({ enquiry, onPress }: LeadCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        padding: 14,
        marginBottom: 10,
        opacity: pressed ? 0.85 : 1,
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
      })}
    >
      <View className="flex-row items-center gap-3">
        <Avatar name={enquiry.customer_name} size={42} />

        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="flex-shrink font-semibold text-ink-900"
              style={{ fontSize: 15 }}
            >
              {enquiry.customer_name}
            </Text>
            <ChannelBadge channel={enquiry.channel} size="xs" withLabel={false} />
          </View>
          <Text
            numberOfLines={2}
            className="mt-0.5 text-xs text-ink-500"
            style={{ lineHeight: 16 }}
          >
            {enquiry.initial_message}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#B7C2D2" />
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        <StatusBadge status={enquiry.status} />
        <Text className="text-[11px] font-medium text-ink-400">
          {timeAgo(enquiry.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}
