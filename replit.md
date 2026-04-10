# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (no user API key needed)

## Artifacts

### Sandbox.ai (artifacts/sandbox-ai)
- **Type**: React + Vite web app
- **Preview path**: `/` (root)
- **Description**: Full-stack AI platform with chat, code, and image generation modes
- **Pages**: Landing page (`/`), Chat interface (`/chat`, `/chat/:id`)
- **Features**:
  - Real-time streaming AI chat (SSE)
  - Code mode with syntax highlighting (react-syntax-highlighter)
  - Image generation mode (gpt-image-1)
  - Multi-model support (GPT-5.2, GPT-5.3 Codex, GPT-5-mini, o4-mini)
  - Conversation history stored in PostgreSQL
  - Dark mode by default

### API Server (artifacts/api-server)
- **Type**: Express 5 API
- **Preview path**: `/api`
- **Routes**: `/api/healthz`, `/api/openai/conversations`, `/api/openai/conversations/:id/messages`, `/api/openai/generate-image`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## DB Schema

- `conversations` — id, title, mode (chat|code|image), model, createdAt, updatedAt
- `messages` — id, conversationId, role (user|assistant), content, createdAt

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
