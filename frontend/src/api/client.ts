/**
 * Mock API client.
 *
 * The shape is deliberately identical to what a real REST client would
 * expose, so swapping `mockEnquiries` for an actual `fetch` call later is
 * a function-body change, not an interface change. Every function returns
 * a Promise with realistic latency so the UI can render skeleton states.
 */
import {
  mockActivityFeed,
  mockConversations,
  mockEnquiries,
  mockFollowUps,
  mockStats,
} from "@/mock";
import type {
  ActivityFeedItem,
  DashboardStats,
  Enquiry,
  EnquiryDetail,
  EnquiryStatus,
  FollowUp,
} from "@/types";

const LATENCY_MS = 250;

const delay = <T>(value: T, ms = LATENCY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));


// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

export const enquiryApi = {
  list: async (filters?: { status?: EnquiryStatus }): Promise<Enquiry[]> => {
    let items = [...mockEnquiries].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (filters?.status) {
      items = items.filter((e) => e.status === filters.status);
    }
    return delay(items);
  },

  getById: async (id: string): Promise<Enquiry | undefined> => {
    return delay(mockEnquiries.find((e) => e.id === id));
  },

  getHistory: async (id: string): Promise<EnquiryDetail | undefined> => {
    const enquiry = mockEnquiries.find((e) => e.id === id);
    if (!enquiry) return delay(undefined);
    const conv = mockConversations[id] ?? { messages: [], timeline: [] };
    const follow_ups = mockFollowUps.filter((f) => f.enquiry_id === id);
    return delay({ ...enquiry, ...conv, follow_ups });
  },

  listEscalated: async (): Promise<Enquiry[]> => {
    const items = mockEnquiries
      .filter((e) => e.status === "escalated")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    return delay(items);
  },
};


// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------

export const followUpApi = {
  listPending: async (): Promise<FollowUp[]> => {
    const items = mockFollowUps
      .filter((f) => f.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.due_at).getTime() - new Date(b.due_at).getTime(),
      );
    return delay(items);
  },
};


// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => delay(mockStats),
  getActivityFeed: async (): Promise<ActivityFeedItem[]> =>
    delay(mockActivityFeed),
};
