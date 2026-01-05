// Color palette for text and highlight colors
export const TEXT_COLORS = [
  { name: "Default", color: "inherit" },
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#4B5563" },
  { name: "Gray", color: "#9CA3AF" },
  { name: "Red", color: "#EF4444" },
  { name: "Orange", color: "#F97316" },
  { name: "Yellow", color: "#EAB308" },
  { name: "Green", color: "#22C55E" },
  { name: "Blue", color: "#3B82F6" },
  { name: "Purple", color: "#A855F7" },
  { name: "Pink", color: "#EC4899" },
];

export const HIGHLIGHT_COLORS = [
  { name: "None", color: "" },
  { name: "Yellow", color: "#FEF08A" },
  { name: "Green", color: "#BBF7D0" },
  { name: "Blue", color: "#BFDBFE" },
  { name: "Pink", color: "#FBCFE8" },
  { name: "Purple", color: "#E9D5FF" },
  { name: "Orange", color: "#FED7AA" },
  { name: "Gray", color: "#E5E7EB" },
];

export const FONT_SIZES = [
  { label: "8px", value: "8px" },
  { label: "9px", value: "9px" },
  { label: "10px", value: "10px" },
  { label: "11px", value: "11px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
  { label: "36px", value: "36px" },
  { label: "48px", value: "48px" },
  { label: "72px", value: "72px" },
];

// Allowed namespaces for variable validation
export const ALLOWED_NAMESPACES = [
  "examiner", // Legacy support
  "application",
  "contract",
  "org",
  "thrive",
  "fees",
  "custom",
];
