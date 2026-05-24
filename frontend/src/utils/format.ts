/**
 * Small, pure helper functions used across screens.
 */
import type {
  Channel,
  EnquiryStatus,
  EventType,
  MessageSender,
  Urgency,
} from "@/types";

/**
 * Returns a humanized "time ago" string for ISO timestamps.
 * Falls back to local date string for anything older than a week.
 */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = Math.max(0, now.getTime() - then.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return then.toLocaleDateString();
}

/**
 * Returns a humanized "in X" string for upcoming timestamps.
 * Used for follow-up due times.
 */
export function timeUntil(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diff = then.getTime() - now.getTime();
  if (diff <= 0) return "overdue";
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "in <1m";
  const min = Math.floor(sec / 60);
  if (min < 60) return `in ${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `in ${hr}h`;
  const day = Math.floor(hr / 24);
  return `in ${day}d`;
}

/**
 * Short clock-style label, e.g. "9:14 AM".
 */
export function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Display labels
// ---------------------------------------------------------------------------

export const channelLabel: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  call: "Call",
};

export const statusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  processing: "Processing",
  qualified: "Qualified",
  escalated: "Escalated",
  resolved: "Resolved",
};

export const senderLabel: Record<MessageSender, string> = {
  customer: "Customer",
  ai: "Closira AI",
  agent: "Agent",
  system: "System",
};

export const urgencyLabel: Record<Urgency, string> = {
  high: "High urgency",
  medium: "Medium",
  low: "Low",
};

export function timelineIconForEvent(type: EventType): string {
  switch (type) {
    case "enquiry_created":
      return "📩";
    case "processing_started":
      return "⚙️";
    case "sop_matched":
      return "✓";
    case "sop_not_matched":
      return "⚠";
    case "escalated":
      return "🚨";
    case "follow_up_scheduled":
      return "🕓";
    case "follow_up_completed":
      return "✔︎";
    case "resolved":
      return "✔︎";
    default:
      return "•";
  }
}

/**
 * Initials for an avatar — 1-2 letters max.
 */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
