/**
 * Mock follow-ups, dashboard stats, and activity feed.
 */
import type { ActivityFeedItem, DashboardStats, FollowUp } from "@/types";

export const mockFollowUps: FollowUp[] = [
  {
    id: 1,
    enquiry_id: "enq_a1b2c3d4",
    customer_name: "Sarah Mehta",
    channel: "whatsapp",
    message_template:
      "Hi Sarah, just checking in on your 2BHK enquiry — happy to share more details if you're still interested.",
    delay_minutes: 60,
    due_at: "2026-05-23T11:30:00Z",
    status: "pending",
    created_at: "2026-05-23T08:14:05Z",
  },
  {
    id: 2,
    enquiry_id: "enq_y5z6a7b8",
    customer_name: "Anita Desai",
    channel: "email",
    message_template:
      "Hi Anita, sending you the office cleaning quote we discussed. Let me know if you'd like to schedule a site visit.",
    delay_minutes: 120,
    due_at: "2026-05-23T12:00:00Z",
    status: "pending",
    created_at: "2026-05-23T03:15:05Z",
  },
  {
    id: 3,
    enquiry_id: "enq_g3h4i5j6",
    customer_name: "Meera Krishnan",
    channel: "whatsapp",
    message_template:
      "Hi Meera, here's the bi-weekly recurring booking rate — happy to set this up whenever you're ready.",
    delay_minutes: 240,
    due_at: "2026-05-23T15:30:00Z",
    status: "pending",
    created_at: "2026-05-23T02:45:10Z",
  },
  {
    id: 4,
    enquiry_id: "enq_q7r8s9t0",
    customer_name: "Neha Banerjee",
    channel: "call",
    message_template:
      "Hi Neha, following up on your villa services enquiry. Want to walk through the package options?",
    delay_minutes: 180,
    due_at: "2026-05-23T18:45:00Z",
    status: "pending",
    created_at: "2026-05-23T05:30:10Z",
  },
];

export const mockStats: DashboardStats = {
  total_today: 10,
  missed: 1,
  open_escalations: 3,
  follow_ups_due: 4,
  by_channel: {
    whatsapp: 4,
    email: 4,
    call: 2,
  },
  by_status: {
    new: 1,
    qualified: 6,
    escalated: 3,
  },
};

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: "act_001",
    enquiry_id: "enq_c9d0e1f2",
    customer_name: "Karan Malhotra",
    channel: "call",
    type: "escalated",
    description: "Auto-escalated — complaint requires human handling",
    timestamp: "2026-05-23T09:05:05Z",
  },
  {
    id: "act_002",
    enquiry_id: "enq_k7l8m9n0",
    customer_name: "Arjun Nair",
    channel: "email",
    type: "new_enquiry",
    description: "New enquiry received",
    timestamp: "2026-05-23T09:32:00Z",
  },
  {
    id: "act_003",
    enquiry_id: "enq_a1b2c3d4",
    customer_name: "Sarah Mehta",
    channel: "whatsapp",
    type: "qualified",
    description: "Matched SOP: Pricing Question",
    timestamp: "2026-05-23T08:14:03Z",
  },
  {
    id: "act_004",
    enquiry_id: "enq_e5f6g7h8",
    customer_name: "Rohan Kapoor",
    channel: "email",
    type: "escalated",
    description: "Customer requested manager — refund issue",
    timestamp: "2026-05-23T07:42:05Z",
  },
  {
    id: "act_005",
    enquiry_id: "enq_i9j0k1l2",
    customer_name: "Priya Iyer",
    channel: "whatsapp",
    type: "qualified",
    description: "Booking confirmed for Saturday 10am",
    timestamp: "2026-05-23T07:05:00Z",
  },
  {
    id: "act_006",
    enquiry_id: "enq_q7r8s9t0",
    customer_name: "Neha Banerjee",
    channel: "call",
    type: "qualified",
    description: "Matched SOP: General Information",
    timestamp: "2026-05-23T05:30:03Z",
  },
];
