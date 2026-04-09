import { useUser } from "@clerk/react";

export type UserRole = "admin" | "moderator" | "user";
export type UserPlan = "free" | "pro" | "enterprise";

const ROLE_RANK: Record<UserRole, number> = {
  admin: 3,
  moderator: 2,
  user: 1,
};

export function usePermissions() {
  const { user, isLoaded } = useUser();

  const meta = (user?.publicMetadata ?? {}) as Record<string, string>;
  const role: UserRole = (meta.role as UserRole) ?? "user";
  const plan: UserPlan = (meta.plan as UserPlan) ?? "free";

  function hasRole(minRole: UserRole): boolean {
    return (ROLE_RANK[role] ?? 1) >= ROLE_RANK[minRole];
  }

  function isAdmin() { return hasRole("admin"); }
  function isModerator() { return hasRole("moderator"); }
  function isPro() { return plan === "pro" || plan === "enterprise"; }
  function isEnterprise() { return plan === "enterprise"; }

  function canUse(feature: "image" | "flutter" | "dashboard" | "admin"): boolean {
    switch (feature) {
      case "image":
      case "flutter":
        return isPro();
      case "dashboard":
        return hasRole("moderator");
      case "admin":
        return isAdmin();
      default:
        return true;
    }
  }

  return {
    role,
    plan,
    isLoaded,
    isAdmin,
    isModerator,
    isPro,
    isEnterprise,
    canUse,
  };
}
