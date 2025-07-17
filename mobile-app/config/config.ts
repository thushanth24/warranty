// Centralized app config for environment variables and URLs
// Use process.env.EXPO_PUBLIC_BACKEND_URL for Expo EAS and fallback for local dev

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://your.backend.api";
