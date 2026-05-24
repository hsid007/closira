/**
 * Design tokens — single source of truth for color, spacing, and typography.
 *
 * NativeWind classes use these via tailwind.config.js. This file exists for
 * the (rare) cases where we need the raw value in JS — chart series, status
 * pill rendering, dynamic gradients, etc.
 */

export const colors = {
  // Brand
  ink: {
    50: "#F6F8FB",
    100: "#EEF2F7",
    200: "#D9E0EA",
    300: "#B7C2D2",
    400: "#8B98AD",
    500: "#5C6B85",
    600: "#3E4A63",
    700: "#2A3447",
    800: "#1A2233",
    900: "#0B1220",
  },
  accent: {
    50: "#F2F2FF",
    100: "#E5E5FF",
    500: "#5B5BFF",
    600: "#4646E0",
    700: "#3636B5",
  },

  // Channels (PDF: WhatsApp green / Email blue / Call amber)
  channel: {
    whatsapp: { base: "#25D366", soft: "#E8FAF1", ink: "#0F6A35" },
    email:    { base: "#3B82F6", soft: "#EBF2FE", ink: "#1E40AF" },
    call:     { base: "#F59E0B", soft: "#FEF4E2", ink: "#92400E" },
  },

  // Status (PDF: New blue / Qualified green / Escalated red)
  status: {
    new:        { base: "#3B82F6", soft: "#EBF2FE", ink: "#1E40AF" },
    qualified:  { base: "#16A34A", soft: "#E7F7EC", ink: "#166534" },
    escalated:  { base: "#DC2626", soft: "#FBECEC", ink: "#991B1B" },
    processing: { base: "#A855F7", soft: "#F4ECFD", ink: "#6B21A8" },
    resolved:   { base: "#64748B", soft: "#EEF1F5", ink: "#334155" },
  },

  urgency: {
    high:   "#DC2626",
    medium: "#F59E0B",
    low:    "#64748B",
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  "2xl": 24,
  full: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;
