/**
 * Skeleton placeholders used while async data is loading.
 *
 * Three primitives that compose into different layouts.
 */
import { View } from "react-native";

const SHIMMER = "#EEF2F7";

export function SkeletonLine({
  width = "100%",
  height = 12,
  rounded = 6,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  rounded?: number;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: SHIMMER,
          borderRadius: rounded,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCircle({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: SHIMMER,
        borderRadius: size / 2,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EEF2F7",
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <SkeletonCircle size={36} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonLine width="60%" height={12} />
          <SkeletonLine width="40%" height={10} />
        </View>
      </View>
      <SkeletonLine width="100%" height={10} />
      <SkeletonLine width="85%" height={10} />
    </View>
  );
}
