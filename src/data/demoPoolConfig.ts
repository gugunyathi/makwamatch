export const GUEST_DEMO_STARTUP_IDS = ["1", "3", "5", "8", "9"] as const;

export const SIGNED_VARIATION_STARTUP_IDS = [
  "2",
  "4",
  "6",
  "7",
  "10",
  "12",
  "15",
  "17",
  "18",
  "19",
] as const;

export const SIGNED_DEMO_POOL_STARTUP_IDS = [
  ...GUEST_DEMO_STARTUP_IDS,
  ...SIGNED_VARIATION_STARTUP_IDS,
] as const;
