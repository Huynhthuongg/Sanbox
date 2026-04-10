import { getServerAuth, getServerClaims } from "./clerkJwt";
import { Request, Response, NextFunction } from "express";

type Role = "admin" | "moderator" | "user";

const ROLE_RANK: Record<Role, number> = {
  admin: 3,
  moderator: 2,
  user: 1,
};

export function requireRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = getServerAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const claims = getServerClaims(req);
    const publicMeta = (
      (claims?.public_metadata ?? claims?.publicMetadata ?? {}) as Record<string, unknown>
    );
    const userRole = (publicMeta?.role as Role) ?? "user";
    if ((ROLE_RANK[userRole] ?? 1) < ROLE_RANK[minRole]) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
