import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { Request, Response, NextFunction } from "express";

const CLERK_FRONTEND_API = "https://loving-colt-32.clerk.accounts.dev";
const JWKS_URL = `${CLERK_FRONTEND_API}/.well-known/jwks.json`;
const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;

export function getServerAuth(req: Request): { userId: string | null } {
  const r = req as AnyReq;
  return { userId: r.__clerkUserId ?? null };
}

export function getServerClaims(req: Request): JWTPayload | null {
  const r = req as AnyReq;
  return r.__clerkClaims ?? null;
}

export async function clerkJwtMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const r = req as AnyReq;
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, JWKS, { clockTolerance: 60 });
      r.__clerkUserId = payload.sub ?? null;
      r.__clerkClaims = payload;
    } catch {
      r.__clerkUserId = null;
    }
  } else {
    r.__clerkUserId = null;
  }

  next();
}
