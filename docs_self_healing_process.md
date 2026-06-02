# Self-healing reminder workflow (OpenClaw/Eios style)

## Goal
Automatically remind maintainers when deployment-critical configuration or code artifacts are missing.

## 1) Detect
- On every deploy, open `/health-config` and validate required env keys.
- On CI, run `pnpm --filter @workspace/sandbox-ai run build` and fail on errors.

## 2) Classify
- **Config missing** (e.g. `VITE_CLERK_PUBLISHABLE_KEY` when `VITE_AUTH_MODE=clerk`).
- **Artifact missing** (route/page/module referenced but not found).
- **Type/build breakage** (TypeScript/build errors).

## 3) Notify owner
- Config missing -> notify DevOps/release owner.
- Artifact missing -> notify feature owner/repo maintainer.
- Build/type breakage -> notify author of latest PR and reviewer.

## 4) Auto-remediation checklist
- If auth env missing in non-production: set `VITE_AUTH_MODE=public` as temporary fallback.
- If auth env missing in production: block release and require secret injection.
- If artifact missing: create placeholder file + TODO with owner and deadline.

## 5) Prevent regressions
- Add a PR checklist item: “Did you verify `/health-config` and auth mode behavior?”
- Keep a short runbook for required variables per environment.
