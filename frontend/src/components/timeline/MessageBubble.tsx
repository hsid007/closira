/**
 * Message bubble — chat-style message in the Conversation Detail thread.
 *
 * Customer messages align left in a soft bubble; AI/agent messages align
 * right with the brand color. Subtle sender label above for clarity.
 */
import { Text, View } from "react-native";

import { colors } from "@/theme/tokens";
import type { Message } from "@/types";
import { senderLabel, shortTime } from "@/utils/format";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isCustomer = message.sender === "customer";
  const isSystem = message.sender === "system";

  // System messages render as muted centered notes
  if (isSystem) {
    return (
      <View className="my-2 items-center px-4">
        <Text className="text-[11px] italic text-ink-400">
          {message.content}
        </Text>
      </View>
    );
  }

  const align = isCustomer ? "flex-start" : "flex-end";
  const bg = isCustomer ? "#FFFFFF" : colors.ink[900];
  const fg = isCustomer ? colors.ink[800] : "#FFFFFF";
  const senderColor = isCustomer ? colors.ink[400] : colors.ink[400];

  return (
    <View style={{ alignItems: align }} className="mb-3 px-4">
      <Text
        style={{
          fontSize: 10,
          color: senderColor,
          fontWeight: "600",
          letterSpacing: 0.3,
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        {senderLabel[message.sender]} · {shortTime(message.created_at)}
      </Text>
      <View
        style={{
          backgroundColor: bg,
          borderWidth: isCustomer ? 1 : 0,
          borderColor: "#EEF2F7",
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 16,
          borderTopLeftRadius: isCustomer ? 4 : 16,
          borderTopRightRadius: isCustomer ? 16 : 4,
          maxWidth: "85%",
          shadowColor: "#0B1220",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        <Text style={{ color: fg, fontSize: 14, lineHeight: 20 }}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}
