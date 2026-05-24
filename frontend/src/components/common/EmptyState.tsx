/**
 * EmptyState — shown whenever a list has nothing in it.
 *
 * The PDF calls this out specifically: "Empty states: handle empty lists
 * gracefully with a helpful message, not a blank screen."
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export function EmptyState({
  icon = "checkmark-done-outline",
  title,
  description,
}: EmptyStateProps) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: "#F2F4F8",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={32} color="#8B98AD" />
      </View>
      <Text className="text-center text-base font-semibold text-ink-800">
        {title}
      </Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-ink-500">
          {description}
        </Text>
      ) : null}
    </View>
  );
}
