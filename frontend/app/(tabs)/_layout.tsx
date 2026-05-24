/**
 * Bottom-tabs layout — 4 tabs as required by the PDF: Home, Leads,
 * Escalations, Follow-ups. Icons sit on top, labels below.
 *
 * The tab bar floats slightly with a soft top border and matched safe-area
 * padding so it doesn't fight the iPhone home indicator.
 */
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink[900],
        tabBarInactiveTintColor: colors.ink[400],
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EEF2F7",
          borderTopWidth: 1,
          height: 78,
          paddingTop: 8,
          paddingBottom: 18,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="escalations"
        options={{
          title: "Escalations",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="followups"
        options={{
          title: "Follow-ups",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "time" : "time-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
