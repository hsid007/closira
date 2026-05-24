/**
 * Leads screen.
 *
 * PDF requirements: list of inbound leads with channel badge, status,
 * customer name, time received. Tappable card opens Conversation Detail.
 *
 * Adds filter chips (All / New / Qualified / Escalated) since this is
 * the screen a business owner will spend the most time on and a 50-row
 * unfiltered list gets unwieldy fast.
 */
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";

import { enquiryApi } from "@/api/client";
import { LeadCard } from "@/components/cards/LeadCard";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonCard } from "@/components/common/LoadingState";
import { ScreenContainer } from "@/components/layout/ScreenContainer";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { useAsync } from "@/hooks/useAsync";
import type { EnquiryStatus } from "@/types";

type Filter = "all" | EnquiryStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",        label: "All" },
  { key: "new",        label: "New" },
  { key: "qualified",  label: "Qualified" },
  { key: "escalated",  label: "Escalated" },
];

export default function LeadsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, loading } = useAsync(
    () => enquiryApi.list(),
    [refreshKey],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((e) => e.status === filter);
  }, [data, filter]);

  const onRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <ScreenHeader
        eyebrow="Inbound"
        title="Leads"
        subtitle={
          data
            ? `${data.length} total · ${
                data.filter((e) => e.status === "qualified").length
              } qualified`
            : "Loading…"
        }
      />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 14 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={({ pressed }) => ({
                paddingVertical: 7,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: active ? "#0B1220" : "#FFFFFF",
                borderWidth: 1,
                borderColor: active ? "#0B1220" : "#E1E6EF",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  color: active ? "#FFFFFF" : "#3E4A63",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <View className="px-5">
        {loading ? (
          <View style={{ gap: 10 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title={
              filter === "all"
                ? "No leads yet"
                : `No ${filter} leads`
            }
            description={
              filter === "all"
                ? "When customers reach out, they'll appear here."
                : "Switch filter to see leads in other states."
            }
          />
        ) : (
          filtered.map((enquiry) => (
            <LeadCard
              key={enquiry.id}
              enquiry={enquiry}
              onPress={() =>
                router.push({
                  pathname: "/conversation/[id]",
                  params: { id: enquiry.id },
                })
              }
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}
