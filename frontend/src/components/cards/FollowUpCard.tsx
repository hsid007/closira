/**
 * Follow-up task card — used on the Follow-ups tab.
 *
 * Required by the PDF: customer name, due time, message preview,
 * mark-as-done action. Overdue items get a red due-time chip.
 */
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { ChannelBadge } from "@/components/badges/ChannelBadge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import type { FollowUp } from "@/types";
import { timeUntil } from "@/utils/format";

interface FollowUpCardProps {
  followUp: FollowUp;
  onMarkDone?: () => void;
  onPress?: () => void;
}

export function FollowUpCard({
  followUp,
  onMarkDone,
  onPress,
}: FollowUpCardProps) {
  const due = timeUntil(followUp.due_at);
  const isOverdue = due === "overdue";
  const dueColor = isOverdue ? "#DC2626" : "#3E4A63";
  const dueBg = isOverdue ? "#FBECEC" : "#EEF2F7";

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
        gap: 12,
        opacity: pressed ? 0.9 : 1,
        shadowColor: "#0B1220",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
      })}
    >
      <View className="flex-row items-center gap-3">
        <Avatar name={followUp.customer_name ?? "?"} size={38} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              numberOfLines={1}
              className="font-semibold text-ink-900"
              style={{ fontSize: 14 }}
            >
              {followUp.customer_name ?? "Unknown"}
            </Text>
            {followUp.channel ? (
              <ChannelBadge channel={followUp.channel} size="xs" withLabel={false} />
            ) : null}
          </View>
          <View className="mt-1 flex-row items-center gap-2">
            <View
              className="flex-row items-center gap-1 rounded-md"
              style={{ backgroundColor: dueBg, paddingHorizontal: 6, paddingVertical: 2 }}
            >
              <Ionicons name="time-outline" size={11} color={dueColor} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: dueColor }}>
                {due}
              </Text>
            </View>
            <Text className="text-[11px] text-ink-400">
              · {followUp.delay_minutes}m delay
            </Text>
          </View>
        </View>
      </View>

      {followUp.message_template ? (
        <View
          style={{
            borderLeftWidth: 2,
            borderLeftColor: "#D9E0EA",
            paddingLeft: 10,
          }}
        >
          <Text
            numberOfLines={2}
            className="text-xs text-ink-600"
            style={{ lineHeight: 17, fontStyle: "italic" }}
          >
            “{followUp.message_template}”
          </Text>
        </View>
      ) : null}

      <View className="flex-row justify-end">
        <Button
          label="Mark done"
          icon="checkmark"
          size="sm"
          variant="primary"
          onPress={onMarkDone}
        />
      </View>
    </Pressable>
  );
}
