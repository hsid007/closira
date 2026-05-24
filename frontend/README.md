# Closira — Frontend

Mobile dashboard for SMB business owners to monitor customer conversations and act on escalations.

Built with **Expo (SDK 52) + React Native 0.76 + TypeScript + NativeWind 4 + Expo Router**.

---

## Quick start

```bash
# from /frontend
npm install
cp .env.example .env

npm start             # opens Metro; press i / a / w for iOS / Android / Web
npm run web           # browser-only
npm run type-check    # strict TypeScript check
```

Requires Node 18+. Use the **Expo Go** app on your phone for the fastest run, or press `w` to open the web build (every screen renders identically).

---

## What's in the app

A four-tab mobile experience with a fifth detail screen that opens as a stack route above the tabs.

| Tab          | Screen                          | Purpose                                                                 |
|--------------|---------------------------------|-------------------------------------------------------------------------|
| Home         | `DashboardScreen.tsx`           | 4 stat tiles, quick actions, channel breakdown, recent activity feed    |
| Leads        | `LeadsScreen.tsx`               | Filter chips (All / New / Qualified / Escalated) + sortable lead list  |
| Escalations  | `EscalationsScreen.tsx`         | Urgency-sorted escalation cards with resolve action                     |
| Follow-ups   | `FollowUpsScreen.tsx`           | Tasks bucketed into Overdue / Due today / Upcoming                      |
| —            | `ConversationDetailScreen.tsx`  | Customer header, AI summary, matched SOP, tabbed conversation/timeline  |

Conversation Detail is a **stack screen**, not a tab — opened from any lead, escalation, follow-up, or activity row, exactly as the brief specifies. The back arrow returns to the originating tab; the tab bar disappears for the detail view to maximize message-thread real estate.

---

## Folder structure

```
frontend/
├── app/                            # expo-router file-based navigation
│   ├── _layout.tsx                 # Root stack (tabs + conversation modal-card)
│   ├── (tabs)/                     # Bottom-tab group
│   │   ├── _layout.tsx             # Tab bar config (icons, labels, colors)
│   │   ├── index.tsx               # → DashboardScreen
│   │   ├── leads.tsx               # → LeadsScreen
│   │   ├── escalations.tsx         # → EscalationsScreen
│   │   └── followups.tsx           # → FollowUpsScreen
│   └── conversation/[id].tsx       # → ConversationDetailScreen
├── src/
│   ├── api/client.ts               # Mocked fetch-shaped API client
│   ├── components/
│   │   ├── badges/                 # ChannelBadge, StatusBadge, UrgencyBadge
│   │   ├── cards/                  # LeadCard, EscalationCard, FollowUpCard,
│   │   │                           # ActivityFeedItem, StatTile, QuickActionButton
│   │   ├── common/                 # Avatar, Button, Card, EmptyState, InfoCard,
│   │   │                           # LoadingState skeletons
│   │   ├── layout/                 # ScreenContainer, ScreenHeader, SectionHeader
│   │   └── timeline/               # TimelineItem, MessageBubble
│   ├── hooks/useAsync.ts
│   ├── mock/                       # Realistic mock JSON — enquiries, conversations,
│   │                               # follow-ups, dashboard stats, activity feed
│   ├── screens/                    # The 5 screen components
│   ├── theme/tokens.ts             # Colors, spacing, radius, shadow constants
│   ├── types/index.ts              # Domain types — mirror backend Pydantic schemas
│   └── utils/format.ts             # timeAgo, shortTime, channel/status label maps
├── global.css                      # @tailwind base/components/utilities
├── tailwind.config.js              # Full design tokens (colors, channels, statuses)
├── babel.config.js
├── metro.config.js                 # NativeWind + Expo metro config
├── app.json                        # Expo manifest
├── tsconfig.json                   # Strict TS + @/ path alias
└── package.json
```

Strict component separation — no screen file is longer than ~250 lines, and the average is under 150. Every "thing" you see on screen (a badge, a card, a section header) is its own file that gets composed from above.

---

## Styling choice: NativeWind

I used **NativeWind 4** (Tailwind for React Native) over `StyleSheet`. Reasoning:

1. **Component density.** This UI has ~20 small reusable components — badges, cards, headers, buttons. Writing a StyleSheet per file means each component grows by 40+ lines of style boilerplate. NativeWind keeps the styles inline so a `LeadCard` reads top-to-bottom as JSX without a 50-line style block at the bottom.
2. **Design tokens in one place.** `tailwind.config.js` declares the entire palette (`whatsapp`, `email`, `call`, `statusNew`, `statusEscalated`, `urgencyHigh`, etc.). Every component references those tokens by name, so changing the brand color is a one-line edit.
3. **Cross-platform parity.** The same `className` works on iOS, Android, and web (`npx expo start --web` runs the whole app in a browser). I verified this — running `expo export --platform web` produces a working bundle.
4. **Familiarity.** Most React engineers can read Tailwind classes at a glance.

**Where I fell back to inline `style={{...}}`:** for properties NativeWind 4 doesn't ship a static class for (dynamic colors derived from tokens, exact shadow offsets, derived sizes). Those cases live in the same file as the JSX they affect — never spread across a separate StyleSheet.

---

## Mock data

All data is hardcoded in `src/mock/`, structured exactly like real API responses so wiring up the backend later is one function change in `src/api/client.ts` per endpoint.

```ts
// src/mock/enquiries.ts — sample row
{
  id: "enq_a1b2c3d4",
  customer_name: "Sarah Mehta",
  customer_contact: "+91 98201 23456",
  channel: "whatsapp",
  status: "qualified",
  matched_sop: "sop_pricing",
  sop_label: "Pricing Question",
  ai_summary: "Customer enquiry classified as 'Pricing Question'. ...",
  created_at: "2026-05-23T08:14:00Z",
  // ... full backend shape
}
```

The mock API client (`src/api/client.ts`) wraps every read in a 250ms `setTimeout` so loading skeletons get real screen time. Swap that for `fetch(API_URL)` and the rest of the app keeps working.

Wiring to a live backend would look like:

```ts
// src/api/client.ts — sketch
export const enquiryApi = {
  list: async (filters?: { status?: EnquiryStatus }) => {
    const url = new URL(`${process.env.EXPO_PUBLIC_API_URL}/enquiry`);
    if (filters?.status) url.searchParams.set("status", filters.status);
    return fetch(url).then((r) => r.json());
  },
  // ...
};
```

---

## UI details that earn the polish

- **Channel badges** — WhatsApp green, Email blue, Call amber. Consistent across every card (lead, escalation, follow-up, activity feed) and at three sizes (icon-only chip, label + icon, full md).
- **Status indicators** — New blue, Qualified green, Escalated red, plus Processing purple and Resolved gray for the full lifecycle. Coloured dot + soft pill background + ink-tone text.
- **Urgency stripe** on escalation cards — 4px top bar in the urgency color so a glance down the list immediately surfaces the high-priority items.
- **Skeleton loaders** — every screen has a real skeleton state (cards, lines, circles), not a spinner.
- **Empty states** — every list has a custom empty state per the brief (icon + title + helpful description), not a blank screen.
- **Pull-to-refresh** on every list screen.
- **Overdue detection** on follow-ups — overdue chip flips to red; bucketing into Overdue / Due today / Upcoming makes triage trivial.
- **Deterministic avatar colors** — `Avatar` hashes the name to pick from a 9-swatch palette, so "Sarah Mehta" is always the same color everywhere.
- **Trend deltas on stat tiles** — small ↑18% / -2 indicators colored green/red/gray; mock values today, but shaped for real percentage diffs.

---

## Trade-offs & known limitations

- **No real backend integration.** The brief explicitly said "do not spend time building a backend, authentication, or real API calls." API client is mocked; types match the backend exactly so swap-in is trivial.
- **Resolve / mark-done is optimistic-local only.** Tapping "Resolve" on an escalation or "Mark done" on a follow-up updates local state but doesn't persist (no backend in scope).
- **No new-enquiry composer.** The brief's required screens don't include one. The bottom action bar on Conversation Detail has a "Reply" button as a UI placeholder.
- **No global state library.** With 5 screens and mocked data, props + `useAsync` + local `useState` is enough. For a real product I'd reach for React Query (loved its `useQuery` pattern for this exact shape — fetch, refresh, optimistic update).
- **No tests.** Component tests would have helped catch edge cases but felt like the wrong place to spend the time vs. visual polish given a 48-hour brief that emphasizes UI quality.
- **No animations beyond stack transitions.** Reanimated is set up but I didn't reach for it — the default expo-router transitions read well enough.

---

## Verified

- ✅ `npx tsc --noEmit` — zero TypeScript errors across the codebase.
- ✅ `npx expo export --platform web` — production bundle builds (765 modules, no warnings).
- ✅ All 5 screens, 4 tabs + 1 stack route, file-based routing wired through Expo Router.
- ✅ Every screen handles loading, empty, and populated states.
