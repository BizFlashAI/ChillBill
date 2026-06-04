import type { Category } from "../types";

// Update this to your FastAPI server URL
// For local dev with Android emulator, use 10.0.2.2 (emulator's host loopback)
// For physical device on same network, use your machine's LAN IP
export const API_BASE_URL = "http://10.0.2.2:8000";

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; emoji: string; color: string; bg: string }
> = {
  home: {
    label: "Home & Mortgage",
    emoji: "🏠",
    color: "#2563EB",
    bg: "#DBEAFE",
  },
  personal: {
    label: "Personal & Investing",
    emoji: "💰",
    color: "#059669",
    bg: "#D1FAE5",
  },
  subscriptions: {
    label: "Subscriptions",
    emoji: "📺",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
};

export const FREQUENCY_OPTIONS: { label: string; value: string }[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Yearly", value: "yearly" },
  { label: "One-time", value: "once" },
];
