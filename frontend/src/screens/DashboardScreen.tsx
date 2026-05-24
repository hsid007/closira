/**
 * Dashboard (Home) screen.
 *
 * Required content per PDF:
 *   - Summary stats: leads today, missed, open escalations, follow-ups due
 *   - Quick-action buttons
 *   - Activity feed of recent conversations
 *
 * Layout: stat tiles (2x2 grid on phones) → quick actions row →
 * activity feed list. Pull-to-refresh re-runs the mock fetches.
 */
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, Text, View } from "react-native";

import { dashboardApi } from "@/api/client";
import { ActivityFeedItem } from "@/components/cards/ActivityFeedItem";
import { QuickActionButton } from "@/components/cards/QuickActionButton";
import { StatTile } from "@/components/cards/StatTile";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/LoadingState";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useAsync } from "@/hooks/useAsync";

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const stats = useAsync(() => dashboardApi.getStats(), [refreshKey]);
  const feed = useAsync(() => dashboardApi.getActivityFeed(), [refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const loading = stats.loading || feed.loading;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        eyebrow="Saturday, 23 May"
        title="Good morning 👋"
        subtitle="Here's what's happening with your customers today."
      />

      {/* Stat tiles — 2x2 grid */}
      <View className="px-5">
        {stats.loading || !stats.data ? (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <StatTile
                label="Leads today"
                value={stats.data.total_today}
                icon="people-outline"
                accent="#3B82F6"
                delta="+18%"
                trend="up"
              />
              <StatTile
                label="Missed enquiries"
                value={stats.data.missed}
                icon="alert-circle-outline"
                accent="#F59E0B"
                delta="-2"
                trend="down"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <StatTile
                label="Open escalations"
                value={stats.data.open_escalations}
                icon="flame-outline"
                accent="#DC2626"
                delta="+1"
                trend="up"
              />
              <StatTile
                label="Follow-ups due"
                value={stats.data.follow_ups_due}
                icon="time-outline"
                accent="#5B5BFF"
                delta="0"
                trend="flat"
              />
            </View>
          </View>
        )}
      </View>

      {/* Quick actions */}
      <SectionHeader title="Quick actions" />
      <View className="flex-row gap-2 px-5">
        <QuickActionButton
          icon="people-outline"
          label="All leads"
          accent="#3B82F6"
          onPress={() => router.push("/(tabs)/leads")}
        />
        <QuickActionButton
          icon="flame-outline"
          label="Escalations"
          accent="#DC2626"
          onPress={() => router.push("/(tabs)/escalations")}
        />
        <QuickActionButton
          icon="time-outline"
          label="Follow-ups"
          accent="#5B5BFF"
          onPress={() => router.push("/(tabs)/followups")}
        />
        <QuickActionButton
          icon="document-text-outline"
          label="SOPs"
          accent="#16A34A"
          onPress={() => {
            /* no-op placeholder */
          }}
        />
      </View>

      {/* Channel breakdown */}
      {stats.data ? (
        <>
          <SectionHeader title="By channel" />
          <View className="px-5">
            <Card>
              <View className="flex-row items-center justify-between">
                <ChannelStat
                  count={stats.data.by_channel.whatsapp ?? 0}
                  label="WhatsApp"
                  color="#25D366"
                />
                <View className="h-10 w-px bg-ink-100" />
                <ChannelStat
                  count={stats.data.by_channel.email ?? 0}
                  label="Email"
                  color="#3B82F6"
                />
                <View className="h-10 w-px bg-ink-100" />
                <ChannelStat
                  count={stats.data.by_channel.call ?? 0}
                  label="Call"
                  color="#F59E0B"
                />
              </View>
            </Card>
          </View>
        </>
      ) : null}

      {/* Activity feed */}
      <SectionHeader
        title="Recent activity"
        action={{ label: "See all", onPress: () => router.push("/(tabs)/leads") }}
      />
      <View className="mx-5 overflow-hidden rounded-2xl border border-ink-100 bg-white">
        {feed.loading ? (
          <View className="p-4">
            <SkeletonCard />
          </View>
        ) : !feed.data || feed.data.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="No activity yet"
            description="When customers reach out, you'll see updates here."
          />
        ) : (
          feed.data.map((item, idx) => (
            <View key={item.id}>
              <ActivityFeedItem
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/conversation/[id]",
                    params: { id: item.enquiry_id },
                  })
                }
              />
              {idx < feed.data!.length - 1 ? (
                <View className="ml-16 h-px bg-ink-100" />
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

function ChannelStat({
  count,
  label,
  color,
}: {
  count: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Text style={{ fontSize: 22, fontWeight: "800", color: "#0B1220" }}>
        {count}
      </Text>
      <View className="mt-1 flex-row items-center gap-1.5">
        <View
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }}
        />
        <Text className="text-[11px] font-semibold text-ink-500">{label}</Text>
      </View>
    </View>
  );
}
