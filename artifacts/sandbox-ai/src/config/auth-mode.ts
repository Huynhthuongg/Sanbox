export type AuthMode = "clerk" | "public";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const requestedAuthMode = (import.meta.env.VITE_AUTH_MODE ?? "clerk").toLowerCase();

export const authMode: AuthMode = requestedAuthMode === "public" ? "public" : "clerk";
export const isClerkConfigured = Boolean(clerkPubKey);
export const isAuthEnabled = authMode === "clerk" && isClerkConfigured;

export const clerkConfig = {
  clerkPubKey,
  clerkProxyUrl,
};

export const envChecklist = [
  {
    key: "VITE_AUTH_MODE",
    value: import.meta.env.VITE_AUTH_MODE,
    required: false,
    status: "info" as const,
    hint: "Optional. Use 'clerk' (default) or 'public'.",
  },
  {
    key: "VITE_CLERK_PUBLISHABLE_KEY",
    value: clerkPubKey,
    required: authMode === "clerk",
    status: isClerkConfigured ? ("ok" as const) : ("missing" as const),
    hint: "Required when VITE_AUTH_MODE=clerk.",
  },
  {
    key: "VITE_CLERK_PROXY_URL",
    value: clerkProxyUrl,
    required: false,
    status: "info" as const,
    hint: "Optional proxy URL for Clerk.",
  },
];
