/**
 * Domain types — mirror the backend Pydantic schemas one-to-one.
 *
 * These are intentionally NOT generated from OpenAPI. The frontend brief
 * says we should not integrate with a backend, but writing the types as if
 * we did pays off in two ways: (1) the mock JSON is structured exactly as
 * a real response, (2) wiring up a real fetch later is a 10-line change.
 */

export type Channel = "whatsapp" | "email" | "call";

export type EnquiryStatus =
  | "new"
  | "processing"
  | "qualified"
  | "escalated"
  | "resolved";

export type MessageSender = "customer" | "system" | "agent" | "ai";

export type EventType =
  | "enquiry_created"
  | "processing_started"
  | "sop_matched"
  | "sop_not_matched"
  | "escalated"
  | "follow_up_scheduled"
  | "follow_up_completed"
  | "resolved"
  | "message_added";

export type FollowUpStatus = "pending" | "done" | "cancelled";

export type Urgency = "low" | "medium" | "high";

export interface Message {
  id: number;
  sender: MessageSender;
  content: string;
  created_at: string; // ISO datetime
}

export interface TimelineEvent {
  id: number;
  event_type: EventType;
  description: string;
  metadata_json?: string | null;
  created_at: string;
}

export interface FollowUp {
  id: number;
  enquiry_id: string;
  message_template?: string | null;
  delay_minutes: number;
  due_at: string;
  status: FollowUpStatus;
  created_at: string;
  completed_at?: string | null;
  // Joined for UI convenience — present in mock list responses.
  customer_name?: string;
  channel?: Channel;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  customer_contact?: string | null;
  channel: Channel;
  initial_message: string;
  status: EnquiryStatus;
  matched_sop?: string | null;
  sop_label?: string | null;
  suggested_response?: string | null;
  ai_summary?: string | null;
  escalation_reason?: string | null;
  escalation_urgency?: Urgency | null;
  created_at: string;
  updated_at: string;
}

export interface EnquiryDetail extends Enquiry {
  messages: Message[];
  timeline: TimelineEvent[];
  follow_ups: FollowUp[];
}

export interface DashboardStats {
  total_today: number;
  missed: number;
  open_escalations: number;
  follow_ups_due: number;
  by_channel: Record<Channel, number>;
  by_status: Partial<Record<EnquiryStatus, number>>;
}

export interface ActivityFeedItem {
  id: string;
  enquiry_id: string;
  customer_name: string;
  channel: Channel;
  type: "new_enquiry" | "escalated" | "qualified" | "follow_up_due" | "resolved";
  description: string;
  timestamp: string;
}
