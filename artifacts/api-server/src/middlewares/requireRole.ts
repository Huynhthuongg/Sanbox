import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

type Role = "admin" | "moderator" | "user";

const ROLE_RANK: Record<Role, number> = {
  admin: 3,
  moderator: 2,
  user: 1,
};

export function requireRole(minRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = getAuth(req);
    if (!auth.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userRole = ((auth.sessionClaims?.publicMetadata as Record<string, unknown>)?.role as Role) ?? "user";
    if ((ROLE_RANK[userRole] ?? 1) < ROLE_RANK[minRole]) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
