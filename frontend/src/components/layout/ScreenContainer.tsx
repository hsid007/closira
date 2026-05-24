/**
 * Top-level screen scaffold — SafeArea + background color + optional scroll.
 */
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshControl?: React.ReactElement;
}

export function ScreenContainer({
  children,
  scroll = true,
  refreshControl,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F8FB" }} edges={["top"]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </SafeAreaView>
  );
}
