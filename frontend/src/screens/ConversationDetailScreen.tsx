/**
 * Conversation Detail screen.
 *
 * PDF requirements: message thread, SOP match label, AI summary,
 * status timeline. Opens as a stack screen from Leads or Escalations.
 *
 * Layout (top to bottom):
 *   - Customer header card (avatar, name, contact, channel)
 *   - Status pill + AI summary card + matched SOP card
 *   - Tabbed switch: Conversation / Timeline
 *   - Conversation: message bubbles in a thread
 *   - Timeline: vertical rail of TimelineItem rows
 */
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { enquiryApi } from "@/api/client";
import { ChannelBadge } from "@/components/badges/ChannelBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { UrgencyBadge } from "@/components/badges/UrgencyBadge";
import { Avatar } from "@/components/common/Avatar";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { InfoCard } from "@/components/common/InfoCard";
import { SkeletonCard, SkeletonLine } from "@/components/common/LoadingState";
import { MessageBubble } from "@/components/timeline/MessageBubble";
import { TimelineItem } from "@/components/timeline/TimelineItem";
import { useAsync } from "@/hooks/useAsync";
import { ScrollView } from "react-native";
import type { Urgency } from "@/types";

type Tab = "conversation" | "timeline";

export default function ConversationDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string | string[] }>();
  // Expo Router can return params as string[] when the same key appears
  // multiple times — normalize to a single string.
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [tab, setTab] = useState<Tab>("conversation");

  const { data, loading } = useAsync(
    () => enquiryApi.getHistory(id ?? ""),
    [id],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }} edges={["top"]}>
      {/* Header bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 4,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color="#0B1220" />
        </Pressable>
        <Text
          className="flex-1 text-center text-base font-semibold text-ink-800"
          numberOfLines={1}
        >
          Conversation
        </Text>
        <Pressable
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#5C6B85" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {loading || !data ? (
          <View className="gap-3 px-5 pt-2">
            <SkeletonCard />
            <SkeletonLine width="100%" height={14} />
            <SkeletonCard />
          </View>
        ) : (
          <>
            {/* Customer + status header card */}
            <View className="px-5 pt-2">
              <Card>
                <View className="flex-row items-center gap-3">
                  <Avatar name={data.customer_name} size={48} />
                  <View className="flex-1">
                    <Text
                      className="font-bold text-ink-900"
                      style={{ fontSize: 17 }}
                    >
                      {data.customer_name}
                    </Text>
                    {data.customer_contact ? (
                      <Text
                        className="mt-0.5 text-xs text-ink-500"
                        numberOfLines={1}
                      >
                        {data.customer_contact}
                      </Text>
                    ) : null}
                  </View>
                  <ChannelBadge channel={data.channel} size="sm" />
                </View>

                <View className="mt-3 flex-row items-center gap-2">
                  <StatusBadge status={data.status} size="md" />
                  {data.status === "escalated" && data.escalation_urgency ? (
                    <UrgencyBadge urgency={data.escalation_urgency as Urgency} />
                  ) : null}
                </View>
              </Card>
            </View>

            {/* AI insight cards */}
            <View className="gap-2 px-5 pt-3">
              {data.ai_summary ? (
                <InfoCard
                  icon="sparkles"
                  iconColor="#5B5BFF"
                  label="AI summary"
                  value={data.ai_summary}
                  tone="accent"
                />
              ) : null}

              {data.sop_label ? (
                <InfoCard
                  icon="document-text-outline"
                  iconColor="#16A34A"
                  label="Matched SOP"
                  value={data.sop_label}
                  tone="success"
                />
              ) : (
                <InfoCard
                  icon="warning-outline"
                  iconColor="#F59E0B"
                  label="No SOP matched"
                  value="This enquiry didn't match any known SOP and was flagged for human review."
                  tone="warning"
                />
              )}

              {data.escalation_reason ? (
                <InfoCard
                  icon="alert-circle-outline"
                  iconColor="#DC2626"
                  label="Escalation reason"
                  value={data.escalation_reason}
                  tone="warning"
                />
              ) : null}
            </View>

            {/* Tab switcher */}
            <View className="px-5 pt-4">
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#EEF2F7",
                  borderRadius: 12,
                  padding: 4,
                  gap: 4,
                }}
              >
                <TabPill
                  label="Conversation"
                  active={tab === "conversation"}
                  count={data.messages.length}
                  onPress={() => setTab("conversation")}
                />
                <TabPill
                  label="Timeline"
                  active={tab === "timeline"}
                  count={data.timeline.length}
                  onPress={() => setTab("timeline")}
                />
              </View>
            </View>

            {/* Tab content */}
            {tab === "conversation" ? (
              <View className="pt-4">
                {data.messages.length === 0 ? (
                  <EmptyState
                    icon="chatbubble-outline"
                    title="No messages yet"
                    description="The conversation will appear here as it unfolds."
                  />
                ) : (
                  data.messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))
                )}
              </View>
            ) : (
              <View className="mx-5 mt-4 rounded-2xl border border-ink-100 bg-white p-4">
                {data.timeline.length === 0 ? (
                  <EmptyState
                    icon="time-outline"
                    title="No timeline events"
                    description="Status changes will be recorded here."
                  />
                ) : (
                  data.timeline.map((e, idx) => (
                    <TimelineItem
                      key={e.id}
                      event={e}
                      isLast={idx === data.timeline.length - 1}
                    />
                  ))
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      {data ? (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingVertical: 12,
            paddingBottom: 28,
            backgroundColor: "#FFFFFFEE",
            borderTopWidth: 1,
            borderTopColor: "#EEF2F7",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <View style={{ flex: 1 }}>
            <Button
              label="Reply"
              icon="send"
              variant="primary"
              fullWidth
              size="md"
            />
          </View>
          <Button
            label="Follow-up"
            icon="time-outline"
            variant="secondary"
            size="md"
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function TabPill({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 8,
        borderRadius: 9,
        backgroundColor: active ? "#FFFFFF" : "transparent",
        shadowColor: active ? "#0B1220" : "transparent",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: active ? 0.06 : 0,
        shadowRadius: 3,
        elevation: active ? 2 : 0,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          color: active ? "#0B1220" : "#5C6B85",
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: active ? "#EEF2F7" : "#D9E0EA",
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: 999,
        }}
      >
        <Text
          style={{
            color: active ? "#3E4A63" : "#5C6B85",
            fontSize: 10,
            fontWeight: "700",
          }}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}
