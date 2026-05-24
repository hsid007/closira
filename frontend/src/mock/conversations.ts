/**
 * Mock conversation history — messages and timeline events per enquiry.
 *
 * Keyed by enquiry ID. The Conversation Detail screen joins this with
 * the enquiry record to produce an EnquiryDetail response.
 */
import type { Message, TimelineEvent } from "@/types";

interface ConversationMock {
  messages: Message[];
  timeline: TimelineEvent[];
}

export const mockConversations: Record<string, ConversationMock> = {
  enq_a1b2c3d4: {
    messages: [
      {
        id: 1,
        sender: "customer",
        content:
          "Hi! I'd like to know the price for a 2BHK deep cleaning service. Looking to book next weekend if possible.",
        created_at: "2026-05-23T08:14:00Z",
      },
      {
        id: 2,
        sender: "ai",
        content:
          "Happy to share pricing details. Our packages start from a base rate depending on scope and size. Could you share a few more details so I can send you an accurate quote?",
        created_at: "2026-05-23T08:14:03Z",
      },
      {
        id: 3,
        sender: "customer",
        content:
          "Sure — it's a 2BHK around 1100 sqft, fully furnished. Want a complete deep clean before guests arrive.",
        created_at: "2026-05-23T08:18:00Z",
      },
    ],
    timeline: [
      {
        id: 1,
        event_type: "enquiry_created",
        description: "Enquiry received via whatsapp",
        created_at: "2026-05-23T08:14:00Z",
      },
      {
        id: 2,
        event_type: "processing_started",
        description: "Background processing started",
        created_at: "2026-05-23T08:14:01Z",
      },
      {
        id: 3,
        event_type: "sop_matched",
        description: "Matched SOP: Pricing Question",
        created_at: "2026-05-23T08:14:03Z",
      },
      {
        id: 4,
        event_type: "follow_up_scheduled",
        description: "Follow-up scheduled in 60 min",
        created_at: "2026-05-23T08:14:05Z",
      },
    ],
  },

  enq_e5f6g7h8: {
    messages: [
      {
        id: 4,
        sender: "customer",
        content:
          "I'm really unhappy with the service yesterday. The team showed up 2 hours late and left half the work incomplete. I want a refund and to speak to a manager immediately.",
        created_at: "2026-05-23T07:42:00Z",
      },
      {
        id: 5,
        sender: "ai",
        content:
          "I'm really sorry to hear about your experience. I'm escalating this to our team lead so we can resolve it as quickly as possible.",
        created_at: "2026-05-23T07:42:04Z",
      },
    ],
    timeline: [
      {
        id: 5,
        event_type: "enquiry_created",
        description: "Enquiry received via email",
        created_at: "2026-05-23T07:42:00Z",
      },
      {
        id: 6,
        event_type: "processing_started",
        description: "Background processing started",
        created_at: "2026-05-23T07:42:01Z",
      },
      {
        id: 7,
        event_type: "sop_matched",
        description: "Matched SOP: Complaint",
        created_at: "2026-05-23T07:42:03Z",
      },
      {
        id: 8,
        event_type: "escalated",
        description: "Auto-escalated: SOP 'Complaint' requires human handling",
        created_at: "2026-05-23T07:42:05Z",
      },
    ],
  },

  enq_i9j0k1l2: {
    messages: [
      {
        id: 6,
        sender: "customer",
        content:
          "Can I book an appointment for Saturday morning? Need to check availability for kitchen deep clean.",
        created_at: "2026-05-23T06:58:00Z",
      },
      {
        id: 7,
        sender: "ai",
        content:
          "Thanks for reaching out! I'd love to help you book a slot. Could you share your preferred date and time, and the service you're interested in?",
        created_at: "2026-05-23T06:58:03Z",
      },
      {
        id: 8,
        sender: "customer",
        content: "Saturday 10am works. Kitchen deep clean.",
        created_at: "2026-05-23T07:02:00Z",
      },
      {
        id: 9,
        sender: "agent",
        content:
          "Booked you in for Saturday 10am. You'll get a confirmation SMS shortly.",
        created_at: "2026-05-23T07:05:00Z",
      },
    ],
    timeline: [
      {
        id: 9,
        event_type: "enquiry_created",
        description: "Enquiry received via whatsapp",
        created_at: "2026-05-23T06:58:00Z",
      },
      {
        id: 10,
        event_type: "sop_matched",
        description: "Matched SOP: Booking Enquiry",
        created_at: "2026-05-23T06:58:03Z",
      },
    ],
  },

  enq_m3n4o5p6: {
    messages: [
      {
        id: 10,
        sender: "customer",
        content:
          "What are your opening hours on Sundays? Need to know if you can come tonight after 9pm.",
        created_at: "2026-05-22T23:11:00Z",
      },
      {
        id: 11,
        sender: "ai",
        content:
          "Thanks for your message! Our team is currently offline. We'll get back to you first thing during business hours (Mon–Sat, 9am–7pm).",
        created_at: "2026-05-22T23:11:04Z",
      },
    ],
    timeline: [
      {
        id: 11,
        event_type: "enquiry_created",
        description: "Enquiry received via email",
        created_at: "2026-05-22T23:11:00Z",
      },
      {
        id: 12,
        event_type: "sop_matched",
        description: "Matched SOP: After-Hours Message",
        created_at: "2026-05-22T23:11:04Z",
      },
    ],
  },

  enq_q7r8s9t0: {
    messages: [
      {
        id: 12,
        sender: "customer",
        content:
          "Could you share more information about your services? I want to know what packages you offer and which one fits a 3BHK villa.",
        created_at: "2026-05-23T05:30:00Z",
      },
      {
        id: 13,
        sender: "ai",
        content:
          "Thanks for getting in touch! Here's a quick overview of what we offer. Let me know which service you'd like to learn more about.",
        created_at: "2026-05-23T05:30:03Z",
      },
    ],
    timeline: [
      {
        id: 13,
        event_type: "enquiry_created",
        description: "Enquiry received via call",
        created_at: "2026-05-23T05:30:00Z",
      },
      {
        id: 14,
        event_type: "sop_matched",
        description: "Matched SOP: General Information",
        created_at: "2026-05-23T05:30:03Z",
      },
    ],
  },

  enq_u1v2w3x4: {
    messages: [
      {
        id: 14,
        sender: "customer",
        content: "Hello.",
        created_at: "2026-05-23T04:22:00Z",
      },
    ],
    timeline: [
      {
        id: 15,
        event_type: "enquiry_created",
        description: "Enquiry received via whatsapp",
        created_at: "2026-05-23T04:22:00Z",
      },
      {
        id: 16,
        event_type: "sop_not_matched",
        description: "No SOP matched the message content",
        created_at: "2026-05-23T04:22:03Z",
      },
      {
        id: 17,
        event_type: "escalated",
        description: "Auto-escalated: no SOP match",
        created_at: "2026-05-23T04:22:03Z",
      },
    ],
  },

  enq_y5z6a7b8: {
    messages: [
      {
        id: 15,
        sender: "customer",
        content:
          "Pricing question — can you send me a quote for monthly office cleaning, about 1500 sqft, four days a week?",
        created_at: "2026-05-23T03:15:00Z",
      },
      {
        id: 16,
        sender: "ai",
        content:
          "Happy to share pricing details. Our packages start from a base rate depending on scope and size. Could you share a few more details so I can send you an accurate quote?",
        created_at: "2026-05-23T03:15:03Z",
      },
    ],
    timeline: [
      {
        id: 18,
        event_type: "enquiry_created",
        description: "Enquiry received via email",
        created_at: "2026-05-23T03:15:00Z",
      },
      {
        id: 19,
        event_type: "sop_matched",
        description: "Matched SOP: Pricing Question",
        created_at: "2026-05-23T03:15:03Z",
      },
    ],
  },

  enq_c9d0e1f2: {
    messages: [
      {
        id: 17,
        sender: "customer",
        content:
          "The technician didn't show up today and no one is answering my calls. This is terrible service, please respond.",
        created_at: "2026-05-23T09:05:00Z",
      },
      {
        id: 18,
        sender: "ai",
        content:
          "I'm really sorry to hear about your experience. I'm escalating this to our team lead so we can resolve it as quickly as possible.",
        created_at: "2026-05-23T09:05:04Z",
      },
    ],
    timeline: [
      {
        id: 20,
        event_type: "enquiry_created",
        description: "Enquiry received via call",
        created_at: "2026-05-23T09:05:00Z",
      },
      {
        id: 21,
        event_type: "sop_matched",
        description: "Matched SOP: Complaint",
        created_at: "2026-05-23T09:05:03Z",
      },
      {
        id: 22,
        event_type: "escalated",
        description: "Auto-escalated: SOP 'Complaint' requires human handling",
        created_at: "2026-05-23T09:05:04Z",
      },
    ],
  },

  enq_g3h4i5j6: {
    messages: [
      {
        id: 19,
        sender: "customer",
        content:
          "Hi! Want to schedule a recurring booking every two weeks. What's the rate for that?",
        created_at: "2026-05-23T02:45:00Z",
      },
      {
        id: 20,
        sender: "ai",
        content:
          "Thanks for reaching out! I'd love to help you book a slot. Could you share your preferred date and time, and the service you're interested in?",
        created_at: "2026-05-23T02:45:03Z",
      },
    ],
    timeline: [
      {
        id: 23,
        event_type: "enquiry_created",
        description: "Enquiry received via whatsapp",
        created_at: "2026-05-23T02:45:00Z",
      },
      {
        id: 24,
        event_type: "sop_matched",
        description: "Matched SOP: Booking Enquiry",
        created_at: "2026-05-23T02:45:03Z",
      },
    ],
  },

  enq_k7l8m9n0: {
    messages: [
      {
        id: 21,
        sender: "customer",
        content:
          "Is your service available on holidays? Need it for next Monday which is a public holiday.",
        created_at: "2026-05-23T09:32:00Z",
      },
    ],
    timeline: [
      {
        id: 25,
        event_type: "enquiry_created",
        description: "Enquiry received via email",
        created_at: "2026-05-23T09:32:00Z",
      },
    ],
  },
};
