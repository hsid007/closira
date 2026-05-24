/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand
        ink: {
          DEFAULT: "#0B1220",
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
          DEFAULT: "#5B5BFF",
          50: "#F2F2FF",
          100: "#E5E5FF",
          200: "#C7C7FF",
          300: "#9F9FFF",
          400: "#7878FF",
          500: "#5B5BFF",
          600: "#4646E0",
          700: "#3636B5",
          800: "#262685",
          900: "#1A1A66",
        },
        // Channels
        whatsapp: "#25D366",
        whatsappSoft: "#E8FAF1",
        email: "#3B82F6",
        emailSoft: "#EBF2FE",
        call: "#F59E0B",
        callSoft: "#FEF4E2",
        // Status
        statusNew: "#3B82F6",
        statusNewSoft: "#EBF2FE",
        statusQualified: "#16A34A",
        statusQualifiedSoft: "#E7F7EC",
        statusEscalated: "#DC2626",
        statusEscalatedSoft: "#FBECEC",
        statusProcessing: "#A855F7",
        statusProcessingSoft: "#F4ECFD",
        statusResolved: "#64748B",
        statusResolvedSoft: "#EEF1F5",
        // Urgency
        urgencyHigh: "#DC2626",
        urgencyMedium: "#F59E0B",
        urgencyLow: "#64748B",
      },
      fontFamily: {
        sans: ["Inter_400Regular", "System"],
        medium: ["Inter_500Medium", "System"],
        semibold: ["Inter_600SemiBold", "System"],
        bold: ["Inter_700Bold", "System"],
        display: ["FraunceDisplay", "System"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
