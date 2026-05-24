/**
 * Card — the base surface for every list item, stat tile, etc.
 *
 * Soft elevation + 1px hairline border on light theme. Keeps the UI
 * looking layered without going overboard with shadows.
 */
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  padded?: boolean;
}

export function Card({ padded = true, style, children, ...rest }: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: "#FFFFFF",
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#EEF2F7",
          shadowColor: "#0B1220",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 1,
        },
        padded ? { padding: 16 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}
