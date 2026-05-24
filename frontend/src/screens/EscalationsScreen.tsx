/**
 * Escalations screen.
 *
 * PDF requirements: active escalations with reason, customer, channel,
 * time, urgency indicator (high/medium), and resolve button per card.
 *
 * Sorted by urgency (high first) then by recency.
 */
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, RefreshControl, View } from "react-native";

import { enquiryApi } from "@/api/client";
import { EscalationCard } from "@/components/cards/EscalationCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/LoadingState";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useAsync } from "@/hooks/useAsync";
import type { Enquiry, Urgency } from "@/types";

const URGENCY_RANK: Record<Urgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export default function EscalationsScreen() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const { data, loading } = useAsync(
    () => enquiryApi.listEscalated(),
    [refreshKey],
  );

  const sorted = useMemo(() => {
    if (!data) return [];
    return data
      .filter((e) => !resolvedIds.has(e.id))
      .slice()
      .sort((a, b) => {
        const ua = (a.escalation_urgency ?? "medium") as Urgency;
        const ub = (b.escalation_urgency ?? "medium") as Urgency;
        const diff = URGENCY_RANK[ua] - URGENCY_RANK[ub];
        if (diff !== 0) return diff;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [data, resolvedIds]);

  const onRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const onResolve = useCallback((enquiry: Enquiry) => {
    Alert.alert(
      "Resolve escalation?",
      `Mark ${enquiry.customer_name}'s escalation as resolved.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          style: "default",
          onPress: () => {
            // In a real app this would call POST /enquiry/{id}/resolve
            setResolvedIds((prev) => new Set(prev).add(enquiry.id));
          },
        },
      ],
    );
  }, []);

  const highCount = sorted.filter(
    (e) => (e.escalation_urgency ?? "medium") === "high",
  ).length;

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        eyebrow="Needs attention"
        title="Escalations"
        subtitle={
          data
            ? `${sorted.length} open${highCount ? ` · ${highCount} high urgency` : ""}`
            : "Loading…"
        }
      />

      <View className="px-5">
        {loading ? (
          <View style={{ gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="checkmark-done-outline"
            title="All clear"
            description="No open escalations right now. Nicely done."
          />
        ) : (
          sorted.map((enquiry) => (
            <EscalationCard
              key={enquiry.id}
              enquiry={enquiry}
              onPress={() =>
                router.push({
                  pathname: "/conversation/[id]",
                  params: { id: enquiry.id },
                })
              }
              onResolve={() => onResolve(enquiry)}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}
