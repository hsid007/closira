/**
 * Escalation card — used on the Escalations tab.
 *
 * Heavier visual weight than a lead card: urgency stripe on the left,
 * resolve button at the bottom. PDF requires reason / customer / channel /
 * time / urgency indicator / resolve action.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ChannelBadge } from "@/components/badges/ChannelBadge";
import { UrgencyBadge } from "@/components/badges/UrgencyBadge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { colors } from "@/theme/tokens";
import type { Enquiry, Urgency } from "@/types";
import { timeAgo } from "@/utils/format";

interface EscalationCardProps {
  enquiry: Enquiry;
  onPress?: () => void;
  onResolve?: () => void;
}

export function EscalationCard({
  enquiry,
  onPress,
  onResolve,
}: EscalationCardProps) {
  const urgency = (enquiry.escalation_urgency ?? "medium") as Urgency;
  const stripe = colors.urgency[urgency];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        marginBottom: 12,
        overflow: "hidden",
        opacity: pressed ? 0.92 : 1,
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      })}
    >
      {/* Top: urgency stripe */}
      <View style={{ height: 4, backgroundColor: stripe, width: "100%" }} />

      <View style={{ padding: 14, gap: 12 }}>
        {/* Header row */}
        <View className="flex-row items-center gap-3">
          <Avatar name={enquiry.customer_name} size={40} />
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                numberOfLines={1}
                className="font-semibold text-ink-900"
                style={{ fontSize: 15 }}
              >
                {enquiry.customer_name}
              </Text>
              <UrgencyBadge urgency={urgency} />
            </View>
            <View className="mt-1 flex-row items-center gap-2">
              <ChannelBadge channel={enquiry.channel} size="xs" />
              <Text className="text-[11px] text-ink-400">
                {timeAgo(enquiry.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Reason */}
        <View
          style={{
            backgroundColor: "#FBECEC",
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 10,
            flexDirection: "row",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <Ionicons
            name="alert-circle"
            size={14}
            color={colors.urgency.high}
            style={{ marginTop: 1 }}
          />
          <Text
            className="flex-1 text-xs font-medium"
            style={{ color: "#991B1B", lineHeight: 16 }}
          >
            {enquiry.escalation_reason ?? "Escalated to human agent."}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-2">
          <Button
            label="View thread"
            variant="secondary"
            icon="chatbubble-ellipses-outline"
            size="sm"
            onPress={onPress}
          />
          <Button
            label="Resolve"
            variant="primary"
            icon="checkmark"
            size="sm"
            onPress={onResolve}
          />
        </View>
      </View>
    </Pressable>
  );
}
