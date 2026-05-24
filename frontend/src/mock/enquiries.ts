/**
 * Mock enquiries — shape matches backend GET /enquiry response exactly.
 *
 * Times use ISO 8601 with explicit Z. Mix of channels, statuses, and a few
 * realistic edge cases (long messages, missing contact, etc.) to stress
 * the UI.
 */
import type { Enquiry } from "@/types";

export const mockEnquiries: Enquiry[] = [
  {
    id: "enq_a1b2c3d4",
    customer_name: "Sarah Mehta",
    customer_contact: "+91 98201 23456",
    channel: "whatsapp",
    initial_message:
      "Hi! I'd like to know the price for a 2BHK deep cleaning service. Looking to book next weekend if possible.",
    status: "qualified",
    matched_sop: "sop_pricing",
    sop_label: "Pricing Question",
    suggested_response:
      "Happy to share pricing details. Our packages start from a base rate depending on scope and size. Could you share a few more details so I can send you an accurate quote?",
    ai_summary:
      "Customer enquiry classified as 'Pricing Question'. Asking about 2BHK deep cleaning, intends to book next weekend.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T08:14:00Z",
    updated_at: "2026-05-23T08:14:04Z",
  },
  {
    id: "enq_e5f6g7h8",
    customer_name: "Rohan Kapoor",
    customer_contact: "rohan.k@example.com",
    channel: "email",
    initial_message:
      "I'm really unhappy with the service yesterday. The team showed up 2 hours late and left half the work incomplete. I want a refund and to speak to a manager immediately.",
    status: "escalated",
    matched_sop: "sop_complaint",
    sop_label: "Complaint",
    suggested_response:
      "I'm really sorry to hear about your experience. I'm escalating this to our team lead so we can resolve it as quickly as possible.",
    ai_summary:
      "Customer reports late arrival and incomplete work; requesting refund and manager.",
    escalation_reason: "SOP 'Complaint' requires human attention.",
    escalation_urgency: "high",
    created_at: "2026-05-23T07:42:00Z",
    updated_at: "2026-05-23T07:42:05Z",
  },
  {
    id: "enq_i9j0k1l2",
    customer_name: "Priya Iyer",
    customer_contact: "+91 99887 11223",
    channel: "whatsapp",
    initial_message:
      "Can I book an appointment for Saturday morning? Need to check availability for kitchen deep clean.",
    status: "qualified",
    matched_sop: "sop_booking",
    sop_label: "Booking Enquiry",
    suggested_response:
      "Thanks for reaching out! I'd love to help you book a slot. Could you share your preferred date and time, and the service you're interested in?",
    ai_summary:
      "Booking enquiry — Saturday morning kitchen deep clean. Customer is checking availability.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T06:58:00Z",
    updated_at: "2026-05-23T06:58:03Z",
  },
  {
    id: "enq_m3n4o5p6",
    customer_name: "Aditya Sharma",
    customer_contact: "aditya@example.com",
    channel: "email",
    initial_message:
      "What are your opening hours on Sundays? Need to know if you can come tonight after 9pm.",
    status: "qualified",
    matched_sop: "sop_after_hours",
    sop_label: "After-Hours Message",
    suggested_response:
      "Thanks for your message! Our team is currently offline. We'll get back to you first thing during business hours (Mon–Sat, 9am–7pm).",
    ai_summary:
      "Customer asking about Sunday opening hours and late-evening availability.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-22T23:11:00Z",
    updated_at: "2026-05-22T23:11:04Z",
  },
  {
    id: "enq_q7r8s9t0",
    customer_name: "Neha Banerjee",
    customer_contact: "+91 98765 43210",
    channel: "call",
    initial_message:
      "Could you share more information about your services? I want to know what packages you offer and which one fits a 3BHK villa.",
    status: "qualified",
    matched_sop: "sop_general_info",
    sop_label: "General Information",
    suggested_response:
      "Thanks for getting in touch! Here's a quick overview of what we offer. Let me know which service you'd like to learn more about.",
    ai_summary:
      "Information request — 3BHK villa, exploring package options.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T05:30:00Z",
    updated_at: "2026-05-23T05:30:03Z",
  },
  {
    id: "enq_u1v2w3x4",
    customer_name: "Vikram Reddy",
    customer_contact: "+91 91234 56789",
    channel: "whatsapp",
    initial_message: "Hello.",
    status: "escalated",
    matched_sop: null,
    sop_label: null,
    suggested_response: null,
    ai_summary: "No matching SOP — message too vague, flagged for review.",
    escalation_reason: "No matching SOP found — needs human review.",
    escalation_urgency: "medium",
    created_at: "2026-05-23T04:22:00Z",
    updated_at: "2026-05-23T04:22:03Z",
  },
  {
    id: "enq_y5z6a7b8",
    customer_name: "Anita Desai",
    customer_contact: "anita.d@example.com",
    channel: "email",
    initial_message:
      "Pricing question — can you send me a quote for monthly office cleaning, about 1500 sqft, four days a week?",
    status: "qualified",
    matched_sop: "sop_pricing",
    sop_label: "Pricing Question",
    suggested_response:
      "Happy to share pricing details. Our packages start from a base rate depending on scope and size. Could you share a few more details so I can send you an accurate quote?",
    ai_summary:
      "Monthly office cleaning quote request — 1500 sqft, 4 days/week.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T03:15:00Z",
    updated_at: "2026-05-23T03:15:03Z",
  },
  {
    id: "enq_c9d0e1f2",
    customer_name: "Karan Malhotra",
    customer_contact: "+91 88776 65544",
    channel: "call",
    initial_message:
      "The technician didn't show up today and no one is answering my calls. This is terrible service, please respond.",
    status: "escalated",
    matched_sop: "sop_complaint",
    sop_label: "Complaint",
    suggested_response:
      "I'm really sorry to hear about your experience. I'm escalating this to our team lead so we can resolve it as quickly as possible.",
    ai_summary:
      "Customer reports no-show technician and unresponsive support line.",
    escalation_reason: "SOP 'Complaint' requires human attention.",
    escalation_urgency: "high",
    created_at: "2026-05-23T09:05:00Z",
    updated_at: "2026-05-23T09:05:04Z",
  },
  {
    id: "enq_g3h4i5j6",
    customer_name: "Meera Krishnan",
    customer_contact: "+91 90876 54321",
    channel: "whatsapp",
    initial_message:
      "Hi! Want to schedule a recurring booking every two weeks. What's the rate for that?",
    status: "qualified",
    matched_sop: "sop_booking",
    sop_label: "Booking Enquiry",
    suggested_response:
      "Thanks for reaching out! I'd love to help you book a slot. Could you share your preferred date and time, and the service you're interested in?",
    ai_summary: "Recurring booking, bi-weekly cadence. Wants rate info.",
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T02:45:00Z",
    updated_at: "2026-05-23T02:45:03Z",
  },
  {
    id: "enq_k7l8m9n0",
    customer_name: "Arjun Nair",
    customer_contact: "arjun.n@example.com",
    channel: "email",
    initial_message:
      "Is your service available on holidays? Need it for next Monday which is a public holiday.",
    status: "new",
    matched_sop: null,
    sop_label: null,
    suggested_response: null,
    ai_summary: null,
    escalation_reason: null,
    escalation_urgency: null,
    created_at: "2026-05-23T09:32:00Z",
    updated_at: "2026-05-23T09:32:00Z",
  },
];
