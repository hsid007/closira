/**
 * Section header — small uppercase label used inside screens to group rows.
 */
import { Text, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pb-2 pt-1">
      <Text className="text-xs font-bold uppercase tracking-widest text-ink-400">
        {title}
      </Text>
      {action ? (
        <Text
          onPress={action.onPress}
          className="text-xs font-semibold text-accent-500"
        >
          {action.label}
        </Text>
      ) : null}
    </View>
  );
}
