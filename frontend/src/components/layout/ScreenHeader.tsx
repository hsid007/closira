/**
 * Screen header — title + optional subtitle, used at the top of every tab screen.
 *
 * Keeps spacing consistent and gives the dashboard its editorial feel.
 */
import { Text, View } from "react-native";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: ScreenHeaderProps) {
  return (
    <View className="flex-row items-end justify-between px-5 pb-4 pt-2">
      <View className="flex-1 pr-3">
        {eyebrow ? (
          <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-400">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: "#0B1220",
            letterSpacing: -0.5,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-ink-500">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
