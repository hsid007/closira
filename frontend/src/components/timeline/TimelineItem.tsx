/**
 * Timeline item — single event with a connector line.
 *
 * Used on Conversation Detail. The connector line is rendered by the
 * parent (TimelineList) so we know whether to draw it to the next item.
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import type { TimelineEvent } from "@/types";
import { shortTime, timeAgo } from "@/utils/format";

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

const EVENT_META: Record<
  TimelineEvent["event_type"],
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  enquiry_created:      { icon: "mail-outline",            color: colors.status.new.base },
  processing_started:   { icon: "sync-outline",            color: colors.status.processing.base },
  sop_matched:          { icon: "checkmark-circle-outline", color: colors.status.qualified.base },
  sop_not_matched:      { icon: "warning-outline",          color: colors.urgency.medium },
  escalated:            { icon: "alert-circle-outline",    color: colors.status.escalated.base },
  follow_up_scheduled:  { icon: "time-outline",            color: colors.urgency.medium },
  follow_up_completed:  { icon: "checkmark-done-outline",  color: colors.status.qualified.base },
  resolved:             { icon: "checkmark-done-outline",  color: colors.status.resolved.base },
  message_added:        { icon: "chatbubble-outline",       color: colors.ink[400] },
};

export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const meta = EVENT_META[event.event_type] ?? EVENT_META.message_added;

  return (
    <View className="flex-row gap-3">
      {/* Rail */}
      <View className="items-center" style={{ width: 28 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: meta.color + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={meta.icon} size={14} color={meta.color} />
        </View>
        {!isLast ? (
          <View
            style={{
              flex: 1,
              width: 1.5,
              backgroundColor: "#E1E6EF",
              marginTop: 2,
            }}
          />
        ) : null}
      </View>

      {/* Content */}
      <View className="flex-1 pb-4 pt-0.5">
        <Text className="text-sm font-medium text-ink-800">
          {event.description}
        </Text>
        <Text className="mt-0.5 text-[11px] text-ink-400">
          {shortTime(event.created_at)} · {timeAgo(event.created_at)}
        </Text>
      </View>
    </View>
  );
}
