<div align="center">

<br/>

<img src="docs/logo.png" width="110" alt="Sandbox.ai Logo" />

<br/>

<h1>
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=800&size=36&pause=1000&color=00D0FF&center=true&vCenter=true&width=500&lines=SANDBOX.AI;THE+AI+COMMAND+CENTER" alt="Sandbox.ai" />
</h1>

<p align="center">
  <strong>Một workspace. Bốn AI mode. Không giới hạn khả năng.</strong><br/>
  <sub>Agent • Vscode • Chat • Sns — tất cả trong một dark UI cực đỉnh</sub>
</p>

<br/>

<p align="center">
  <a href="https://sanbox-2026.replit.app/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-sanbox--2026.replit.app-00d0ff?style=for-the-badge&logoColor=white" alt="Live Demo"/>
  </a>
  &nbsp;
  <a href="https://github.com/Huynhthuongg/Sanbox">
    <img src="https://img.shields.io/github/stars/Huynhthuongg/Sanbox?style=for-the-badge&color=f59e0b&logo=github" alt="Stars"/>
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white"/>
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-336791?style=flat-square&logo=postgresql&logoColor=white"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat-square&logo=clerk&logoColor=white"/>
  &nbsp;
  <img src="https://img.shields.io/badge/OpenAI-GPT--5.2-412991?style=flat-square&logo=openai&logoColor=white"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite&logoColor=white"/>
</p>

<br/>

<a href="https://sanbox-2026.replit.app/">
  <img src="docs/preview.jpg" width="780" alt="Sandbox.ai Preview" />
</a>

</div>

---

## ✦ Tại sao Sandbox.ai?

> ChatGPT Plus **$20** + GitHub Copilot **$10** + Midjourney **$10** = **$40+/tháng** cho 3 tool rời rạc.  
> **Sandbox.ai** làm cả 4 mode trong một workspace — giao diện tối, streaming thời gian thực, lịch sử vĩnh viễn.

---

## ⚡ Bốn AI Mode

<table>
  <thead>
    <tr>
      <th align="center">Mode</th>
      <th align="center">Model</th>
      <th>Mô tả</th>
      <th align="center">Màu sắc</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center"><strong>💬 Chat</strong></td>
      <td align="center"><code>GPT-5.2</code></td>
      <td>Lý luận sâu, multi-turn context, streaming thời gian thực. Deep Think mode dùng <code>o4-mini</code></td>
      <td align="center"><img src="https://img.shields.io/badge/-00d0ff-00d0ff?style=flat-square"/></td>
    </tr>
    <tr>
      <td align="center"><strong>⌨️ Code</strong></td>
      <td align="center"><code>GPT-5.3 Codex</code></td>
      <td>Syntax highlight tự động, copy 1-click, code block với language tag chính xác</td>
      <td align="center"><img src="https://img.shields.io/badge/-34d399-34d399?style=flat-square"/></td>
    </tr>
    <tr>
      <td align="center"><strong>🎨 Image</strong></td>
      <td align="center"><code>gpt-image-1</code></td>
      <td>Tạo ảnh HD 1024×1024 từ mô tả. Lưu vĩnh viễn vào lịch sử hội thoại</td>
      <td align="center"><img src="https://img.shields.io/badge/-a855f7-a855f7?style=flat-square"/></td>
    </tr>
    <tr>
      <td align="center"><strong>📱 Flutter</strong> <sup>NEW</sup></td>
      <td align="center"><code>GPT-5.2 Expert</code></td>
      <td>MVVM + Riverpod · Firebase · ASO 2026 · Android Vitals · RevenueCat monetization</td>
      <td align="center"><img src="https://img.shields.io/badge/-54c5f8-54c5f8?style=flat-square"/></td>
    </tr>
  </tbody>
</table>

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                        SANDBOX.AI                           │
│                    pnpm Monorepo (TS)                       │
└─────────────────────────────────────────────────────────────┘
          │                              │
    ┌─────▼─────────┐            ┌───────▼──────────┐
    │  Frontend     │            │   API Server     │
    │  React + Vite │            │   Express 5      │
    │  Port: $PORT  │◄──SSE─────►│   Port: 8080     │
    │               │            │                  │
    │  Pages:       │            │  Routes:         │
    │  / (Landing)  │            │  /api/healthz    │
    │  /chat        │            │  /openai/conv.   │
    │  /dashboard   │            │  /openai/msg.    │
    │  /pricing     │            │  /admin/*        │
    │  /admin       │            │  /generate-img   │
    │  /settings    │            └──────┬───────────┘
    │  /onboarding  │                   │
    └───────────────┘            ┌──────▼───────────┐
           │                    │   PostgreSQL      │
    ┌──────▼──────────┐         │   Drizzle ORM     │
    │  Clerk Auth     │         │                  │
    │  JWT Tokens     │         │  Tables:          │
    │  RBAC Roles     │         │  conversations   │
    │  Plan Gating    │         │  messages        │
    └─────────────────┘         └──────────────────┘
```

---

## 🔐 RBAC + Plan-based Feature Gating

```typescript
// 3 Roles
type Role = "user" | "moderator" | "admin";

// 3 Plans
type Plan = "free" | "pro" | "enterprise";

// Feature gates
canUse("dashboard")   → moderator+ only
canUse("admin")       → admin only
canUse("deepThink")   → pro/enterprise
canUse("imageGen")    → pro/enterprise
```

| Feature | Free | Pro | Enterprise | Moderator | Admin |
|---------|:----:|:---:|:----------:|:---------:|:-----:|
| Chat Mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Code Mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| Image Mode | ❌ | ✅ | ✅ | ✅ | ✅ |
| Deep Think | ❌ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td valign="top" width="33%">

### Frontend
- **React 19** + TypeScript
- **Vite 6** (dev server + HMR)
- **Tailwind CSS 4** + shadcn/ui
- **Framer Motion** (animations)
- **Clerk** (auth + session)
- **React Router v7**
- **react-syntax-highlighter**
- **Orval** (type-safe API hooks)
- **@stripe/stripe-js** (checkout)

    </td>
    <td valign="top" width="33%">

### Backend
- **Express 5** + TypeScript
- **Drizzle ORM** + drizzle-zod
- **PostgreSQL** (Replit DB)
- **Zod v4** validation
- **@clerk/express** middleware
- **OpenAI SDK** (streaming SSE)
- **stripe** (payment + webhooks)
- **pino** (structured logging)
- **esbuild** (CJS bundle)

    </td>
    <td valign="top" width="33%">

### Tooling
- **pnpm** workspaces (monorepo)
- **TypeScript 5.9** (project refs)
- **Orval** API codegen (OpenAPI → hooks + Zod)
- **drizzle-kit push** (schema sync)
- **ESLint** + strict TS
- **Node.js 24**

    </td>
  </tr>
</table>

---

## 📁 Cấu trúc dự án

```
sanbox/
├── artifacts/
│   ├── sandbox-ai/          # React + Vite web app
│   │   └── src/
│   │       ├── pages/       # Landing, Chat, Dashboard, Pricing, Admin...
│   │       ├── components/  # ChatInput, ChatArea, Sidebar, FeatureGate...
│   │       └── hooks/       # use-permissions, use-chat, use-conversations
│   │
│   └── api-server/          # Express 5 API
│       └── src/
│           ├── routes/
│           │   ├── openai/  # conversations + messages (streaming SSE)
│           │   └── admin/   # RBAC management endpoints
│           └── middlewares/
│               └── requireAuth.ts   # Clerk JWT validation
│
├── lib/
│   ├── api-client-react/    # Orval-generated hooks + customFetch (auth)
│   ├── api-spec/            # OpenAPI spec → codegen source of truth
│   ├── api-zod/             # Generated Zod schemas
│   ├── db/                  # Drizzle schema + migrations
│   └── integrations-openai-ai-server/  # OpenAI client (server-side)
│
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 🚀 Cài đặt và chạy local

### Yêu cầu
- **Node.js ≥ 24**
- **pnpm ≥ 9**
- **PostgreSQL** database
- Tài khoản **Clerk** (lấy publishable + secret key)
- Replit AI Integrations (OpenAI proxy) — hoặc API key của bạn

### Bước 1: Clone

```bash
git clone https://github.com/Huynhthuongg/Sanbox.git
cd Sanbox
pnpm install
```

### Bước 2: Biến môi trường

Tạo file `.env` ở root:

```env
# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sandboxai

# OpenAI (hoặc dùng Replit AI Integrations)
OPENAI_API_KEY=sk-...
```

### Bước 3: Khởi tạo database

```bash
pnpm --filter @workspace/db run push
```

### Bước 4: Chạy dev server

```bash
# Terminal 1 — API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (port tự động)
pnpm --filter @workspace/sandbox-ai run dev
```

Mở trình duyệt: `http://localhost:5173`

---

## 📋 Các lệnh quan trọng

```bash
# Typecheck toàn bộ monorepo
pnpm run typecheck

# Build tất cả packages
pnpm run build

# Tái tạo API hooks từ OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema (dev)
pnpm --filter @workspace/db run push

# Build API server (production)
pnpm --filter @workspace/api-server run build
```

---

## 🌟 Tính năng nổi bật

<table>
  <tr>
    <td>🔄 <strong>Real-time streaming</strong></td>
    <td>Server-Sent Events (SSE) — phản hồi xuất hiện từng chữ như terminal thực</td>
  </tr>
  <tr>
    <td>🧠 <strong>Deep Think mode</strong></td>
    <td>Bật <em>Think</em> để dùng <code>o4-mini</code> với chain-of-thought reasoning</td>
  </tr>
  <tr>
    <td>🎨 <strong>Image generation</strong></td>
    <td><code>gpt-image-1</code> tạo ảnh HD 1024×1024, lưu vĩnh viễn trong lịch sử</td>
  </tr>
  <tr>
    <td>📱 <strong>Flutter Expert mode</strong></td>
    <td>MVVM + Riverpod, Firebase, ASO 2026, Android Vitals, RevenueCat</td>
  </tr>
  <tr>
    <td>💾 <strong>Persistent history</strong></td>
    <td>Toàn bộ hội thoại lưu PostgreSQL — đăng nhập lại vẫn còn đủ</td>
  </tr>
  <tr>
    <td>🔐 <strong>RBAC + Plan gating</strong></td>
    <td>3 roles × 3 plans — <code>publicMetadata</code> trên Clerk, không cần DB users table</td>
  </tr>
  <tr>
    <td>📊 <strong>Dashboard 6 tabs</strong></td>
    <td>Overview · Usage · Models · History · API Keys · Team (moderator+)</td>
  </tr>
  <tr>
    <td>🛡️ <strong>Auth-check screen</strong></td>
    <td>Animated 4-step session verification thay vì blank screen khi Clerk load</td>
  </tr>
  <tr>
    <td>💳 <strong>Stripe payment integration</strong></td>
    <td>Checkout Session cho Pro plan ($19/tháng · $14/tháng annual), Billing Portal, Webhook handler</td>
  </tr>
  <tr>
    <td>⚙️ <strong>Settings redesign</strong></td>
    <td>Sidebar sticky + single-scroll page (Profile · AI Config · Preferences) — IntersectionObserver active nav</td>
  </tr>
  <tr>
    <td>🔒 <strong>Pro plan lock</strong></td>
    <td>Sandbox Pro card hiển thị "Coming Soon" với toast animation — mở khóa khi Stripe Live</td>
  </tr>
  <tr>
    <td>🌐 <strong>Type-safe API</strong></td>
    <td>OpenAPI spec → Orval codegen → React hooks + Zod schemas, zero drift</td>
  </tr>
  <tr>
    <td>🎯 <strong>Zero mock data</strong></td>
    <td>Mọi thứ đều real — PostgreSQL, OpenAI, Clerk. Không có placeholder nào</td>
  </tr>
</table>

---

## 📄 Pages

| Route | Mô tả | Auth yêu cầu |
|-------|--------|:------------:|
| `/` | Landing page + animated terminal hero | — |
| `/chat` | New conversation (chọn mode) | ✅ |
| `/chat/:id` | Tiếp tục hội thoại | ✅ |
| `/dashboard` | Analytics + quản lý (6 tabs) | Moderator+ |
| `/admin` | RBAC management, user control | Admin |
| `/pricing` | Free / Pro / Enterprise plans | — |
| `/settings` | Profile · AI Config · Preferences — sidebar navigation | ✅ |
| `/onboarding` | Wizard 4 bước cho user mới | ✅ |
| `/auth-check` | Animated session verification | — |

---

## 🎨 Design System

```css
/* Design tokens */
--bg:      #050507;   /* Nền chính */
--accent:  #00d0ff;   /* Cyan — Chat mode */
--green:   #34d399;   /* Code mode */
--purple:  #a855f7;   /* Image mode */
--flutter: #54c5f8;   /* Flutter mode */
--yellow:  #f59e0b;   /* Warning / Pro badge */
--card:    #0c0c14;   /* Card background */
--border:  rgba(255,255,255,0.07);
```

Font chữ: **JetBrains Mono** (monospace) + **Inter** (sans-serif)

---

## 📬 Liên hệ

| Kênh | Địa chỉ |
|------|---------|
| 📧 Email | [Admin@huynhthuong.online](mailto:Admin@huynhthuong.online) |
| 💬 Facebook | [facebook.com/Sandbox.ai](https://www.facebook.com/share/1CTzTTYNh4/?mibextid=wwXIfr) |

---

## 🤝 Đóng góp

Pull requests luôn được chào đón! Để đóng góp lớn, vui lòng mở issue trước để thảo luận về thay đổi bạn muốn thực hiện.

```bash
# Fork → Clone → Branch mới
git checkout -b feature/ten-tinh-nang

# Commit
git commit -m "feat: thêm tính năng X"

# Push & Pull Request
git push origin feature/ten-tinh-nang
```

---

<div align="center">

<br/>

**Built with ❤️ using React, Express, PostgreSQL & OpenAI**

<br/>

<a href="https://sanbox-2026.replit.app/">
  <img src="https://img.shields.io/badge/Try_it_live-→_sanbox--2026.replit.app-00d0ff?style=for-the-badge" alt="Live Demo"/>
</a>

<br/><br/>

<sub>© 2026 Sandbox.ai · The AI Command Center</sub>

</div>
