/**
 * Follow-ups screen.
 *
 * PDF requirements: task cards for scheduled follow-ups — customer name,
 * due time, message preview, mark-as-done action.
 *
 * Bucketed into Overdue / Due today / Upcoming for scannability.
 */
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, Text, View } from "react-native";

import { followUpApi } from "@/api/client";
import { FollowUpCard } from "@/components/cards/FollowUpCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/LoadingState";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useAsync } from "@/hooks/useAsync";
import type { FollowUp } from "@/types";

interface Bucket {
  key: string;
  label: string;
  items: FollowUp[];
}

function bucketize(items: FollowUp[], now = new Date()): Bucket[] {
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  const overdue: FollowUp[] = [];
  const today: FollowUp[] = [];
  const upcoming: FollowUp[] = [];

  for (const f of items) {
    const due = new Date(f.due_at);
    if (due.getTime() < now.getTime()) {
      overdue.push(f);
    } else if (due.getTime() <= endOfToday.getTime()) {
      today.push(f);
    } else {
      upcoming.push(f);
    }
  }

  return [
    { key: "overdue", label: "Overdue", items: overdue },
    { key: "today",   label: "Due today", items: today },
    { key: "upcoming", label: "Upcoming", items: upcoming },
  ].filter((b) => b.items.length > 0);
}

export default function FollowUpsScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());

  const { data, loading } = useAsync(
    () => followUpApi.listPending(),
    [refreshKey],
  );

  const buckets = useMemo(() => {
    if (!data) return [];
    return bucketize(data.filter((f) => !doneIds.has(f.id)));
  }, [data, doneIds]);

  const onRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const onMarkDone = useCallback((id: number) => {
    setDoneIds((prev) => new Set(prev).add(id));
  }, []);

  const totalPending = data
    ? data.filter((f) => !doneIds.has(f.id)).length
    : 0;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        eyebrow="Tasks"
        title="Follow-ups"
        subtitle={
          loading
            ? "Loading…"
            : `${totalPending} pending`
        }
      />

      <View className="px-5">
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : buckets.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="Nothing on the list"
            description="You're all caught up. Schedule a new follow-up from any lead."
          />
        ) : (
          buckets.map((bucket) => (
            <View key={bucket.key} className="mb-2">
              <View className="mb-2 flex-row items-center gap-2">
                <Text className="text-[11px] font-bold uppercase tracking-widest text-ink-400">
                  {bucket.label}
                </Text>
                <View
                  style={{
                    backgroundColor: bucket.key === "overdue" ? "#FBECEC" : "#EEF2F7",
                    paddingHorizontal: 7,
                    paddingVertical: 1,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: bucket.key === "overdue" ? "#991B1B" : "#5C6B85",
                    }}
                  >
                    {bucket.items.length}
                  </Text>
                </View>
              </View>
              {bucket.items.map((followUp) => (
                <FollowUpCard
                  key={followUp.id}
                  followUp={followUp}
                  onPress={() =>
                    router.push({
                      pathname: "/conversation/[id]",
                      params: { id: followUp.enquiry_id },
                    })
                  }
                  onMarkDone={() => onMarkDone(followUp.id)}
                />
              ))}
            </View>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}
