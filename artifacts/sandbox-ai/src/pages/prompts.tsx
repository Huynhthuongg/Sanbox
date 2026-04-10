import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, TrendingUp, Users, Settings, Code2, Megaphone, Briefcase, Brain, Smartphone } from "lucide-react";

function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" stroke="url(#prLg)" strokeWidth="2" fill="none" />
      <polygon points="16,7 23,11 23,21 16,25 9,21 9,11" fill="url(#prLg)" opacity="0.25" />
      <defs>
        <linearGradient id="prLg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00d0ff" />
          <stop offset="100%" stopColor="#00a3cc" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  mode: "chat" | "code" | "image" | "flutter";
  prompt: string;
  tags: string[];
}

const PROMPTS: Prompt[] = [
  {
    id: "sales-page",
    title: "Sales Page Writer",
    description: "Generate a high-converting long-form sales page using the Problem-Agitate-Solution framework with benefit stacking, social proof, and urgency elements.",
    category: "Marketing",
    mode: "chat",
    tags: ["sales", "copywriting", "conversion"],
    prompt: `You are a senior copywriter with 15 years of experience writing high-converting sales pages. I need a complete long-form sales page.

My product/service: [describe your product or service]
Target audience: [who are your ideal customers]
Main pain point you solve: [the core problem]
Price: [your price point]

Write a full sales page using the PAS framework (Problem → Agitate → Solution) including:
1. Headline + subheadline
2. Problem section (describe their current pain in their own words)
3. Agitate section (cost of inaction)
4. Solution introduction
5. Benefit bullets (Feature → Benefit → Outcome)
6. Social proof / testimonials section
7. Price anchoring + pricing section
8. Guarantee (named, specific, unconditional)
9. FAQ / objection handling (5 questions)
10. Final CTA
11. P.S. line

Make it feel personal, not mass-produced. Every sentence must earn its place.`,
  },
  {
    id: "marketing-strategy",
    title: "30-Day Marketing Strategy",
    description: "Get a complete brand foundation, 30-day content calendar, 3 Meta ad variations, 5-email welcome sequence, and weekly execution checklist.",
    category: "Marketing",
    mode: "chat",
    tags: ["marketing", "content", "social media"],
    prompt: `You are a senior marketing strategist and creative director with 15 years of experience building digital-first brands.

About my business:
- What I do: [describe your business in 1-2 sentences]
- Target audience: [ideal customer description]
- Monthly marketing budget: [your budget]
- Biggest challenge right now: [your main challenge]

Build me:
1. Brand foundation: voice in 3 words, positioning statement, 3 messaging pillars, 50-word brand story
2. 30-day content calendar: 5 posts/week across Instagram, LinkedIn, and email (platform, content type, topic, hook, outline)
3. 3 Meta ad copy variations for my main offer (pain point angle, transformation angle, social proof angle)
4. 5-email welcome sequence (subject line, preview text, full body)
5. Weekly execution checklist (under 5 hours), 3 key metrics to track, 1 high-leverage growth tactic

Focus on inbound leads over vanity engagement. Every piece of content must tie back to one of the 3 messaging pillars.`,
  },
  {
    id: "cold-dm",
    title: "Cold Outreach DM Sequence",
    description: "Write a 3-message personalized outreach sequence based on deep prospect research. Never sounds mass-sent. Built for LinkedIn, Instagram, X, or email.",
    category: "Sales",
    mode: "chat",
    tags: ["outreach", "sales", "DM", "LinkedIn"],
    prompt: `You are an outbound sales expert who has written cold messages that generated over $2M in pipeline revenue. You never send generic messages.

About my outreach:
- What I sell: [your product/service]
- Price point: [your price]
- Ideal prospect: [describe them in detail]
- Platform: [LinkedIn / Instagram / X / Email]

Create for me:
1. A 7-point prospect research checklist (what to look up, where to find it, what to look for)
2. Message 1 (under 50 words): No pitch. One specific observation about their business. One thoughtful question.
3. Message 2 (under 40 words, day 3 follow-up): Add value without asking anything.
4. Message 3 (under 60 words, day 8 follow-up): Soft pitch connecting to their specific situation. Clear next step. Ends with a question.
5. 3 complete variations for different prospect types in my niche
6. 10 rules never to break when sending cold DMs
7. A scoring rubric (1-5 scale) for personalization, value, clarity, and CTA

Make every message feel handcrafted.`,
  },
  {
    id: "business-validator",
    title: "Brutal Business Idea Validator",
    description: "Get a ruthless VC-style stress test of your business idea. Identify fatal flaws before you waste time and money building something nobody wants.",
    category: "Strategy",
    mode: "chat",
    tags: ["startup", "validation", "business idea"],
    prompt: `You are a Brutal Business Idea Validator — a ruthless venture capitalist with 25+ years of experience who has seen thousands of startups fail. You identify fatal flaws before entrepreneurs waste their time and money.

My business idea: [describe your idea in detail]

Stress-test my idea across these dimensions:
1. Market reality: Is there genuine demand, or am I assuming demand?
2. Competition: Who already does this, and why would customers switch?
3. Unit economics: Can this ever be profitable at scale?
4. Founder-market fit: Why am I the right person to build this?
5. Timing: Why now? What changed to make this possible?
6. Moat: What stops a better-funded competitor from copying this in 6 months?
7. Fatal flaw check: What is the single most likely reason this fails?

Be precise and data-driven. Do not soften bad news. End with: a 1-10 viability score, the 3 things that must be true for this to work, and the one thing I should validate before spending another dollar.`,
  },
  {
    id: "competitor-analysis",
    title: "Competitor Analysis Report",
    description: "Generate a data-driven report comparing your online performance to competitors across traffic, SEO, social following, and key KPIs.",
    category: "Strategy",
    mode: "chat",
    tags: ["SEO", "competitor", "analysis", "KPIs"],
    prompt: `You are an expert in data-driven competitor analysis with deep experience in digital benchmarking.

My business context:
- My website/product: [your site or product name]
- Main competitors: [list 3-5 competitors]
- My industry/niche: [describe your market]
- The KPIs I care most about: [traffic, conversions, social following, SEO rankings, etc.]

Create a structured competitor analysis covering:
1. Competitive landscape overview (who dominates, who is rising)
2. SEO comparison: domain authority, top keywords, content gaps I can exploit
3. Content strategy analysis: what formats and topics are winning
4. Social media positioning: audience size, engagement rates, best-performing content
5. Pricing and positioning map
6. Their biggest weaknesses I can exploit
7. 3 specific opportunities I can act on this month
8. 90-day action plan to close the gap with the market leader

End with a competitive moat assessment: where am I genuinely differentiated vs. where am I commoditized?`,
  },
  {
    id: "hr-performance",
    title: "Performance Review System",
    description: "Design a complete performance management framework: evaluation criteria, rating scales, calibration process, feedback guides, and career pathing templates.",
    category: "HR & People",
    mode: "chat",
    tags: ["HR", "performance", "management", "team"],
    prompt: `You are an HR strategist specializing in performance management for growing companies.

My context:
- Company size: [number of employees]
- Company stage: [seed / Series A / growth / established]
- Current performance management: [what you do now, e.g., ad hoc reviews, annual reviews]
- Role families to evaluate: [engineering, sales, marketing, ops, etc.]

Design a complete performance review system including:
1. Review cadence (annual + quarterly structure)
2. Evaluation dimensions with specific criteria per role family
3. Rating scale (definitions for each level, avoiding grade inflation)
4. Calibration process for consistency across managers
5. Bias elimination checklist
6. Performance-to-compensation and advancement linkage
7. Development planning for high performers
8. Underperformer management process

Deliver as templates:
- Self-assessment guide
- Manager evaluation form
- Feedback conversation guide
- Development plan template
- Calibration matrix

Make it fair, transparent, and focused on growth.`,
  },
  {
    id: "ai-automation",
    title: "AI Automation Audit",
    description: "Identify which repetitive tasks are costing your team the most time and get step-by-step setup guides for automating each one with specific AI tools.",
    category: "Operations",
    mode: "chat",
    tags: ["automation", "productivity", "AI tools", "efficiency"],
    prompt: `You are an operations consultant who specializes in helping businesses automate repetitive work using AI tools. You've saved companies 20+ hours per week on average.

My situation:
- Business type: [describe your business]
- Team size: [number of people]
- Tasks eating our time:
  1. [Task 1 — e.g., responding to customer emails]
  2. [Task 2 — e.g., creating social media content]
  3. [Task 3 — e.g., generating weekly reports]
  4. [Task 4 — optional]
  5. [Task 5 — optional]

For each task:
- Rate automation potential (high / medium / low) with reasoning
- Recommend the specific AI tool (ChatGPT, Claude, Zapier, Make, etc.)
- Give a step-by-step setup guide I can follow today
- Estimate hours saved per week
- Flag any risks or limitations

Prioritize by impact: start with the highest ROI tasks (most time saved, least setup effort). End with a 30-day implementation roadmap and the total estimated hours I can reclaim per month.`,
  },
  {
    id: "project-tracker",
    title: "Project Plan Generator",
    description: "Turn a project brief or scope document into a fully structured task breakdown with phases, priorities, owners, dependencies, and timelines.",
    category: "Operations",
    mode: "chat",
    tags: ["project management", "planning", "tasks"],
    prompt: `You are a senior project manager with experience delivering complex projects on time and on budget.

My project:
- Project name: [name]
- Project description: [what are we building/delivering]
- Timeline: [start date to end date, or total duration]
- Team members: [list names and roles]
- Budget: [if relevant]
- Brief or scope: [paste your project brief, or describe what needs to happen]

Create a complete project plan:
1. Phase breakdown (Planning → Design → Build → Review → Launch or custom phases)
2. Full task list per phase with: task name (action verb), owner, due date, priority (Urgent/High/Medium/Low), dependencies, and acceptance criteria
3. Critical path identification (which tasks block everything else)
4. Risk register (top 5 risks with mitigation strategies)
5. Weekly milestone checkpoints
6. Definition of done for the project

Format the task list so it's ready to paste into Notion, Asana, or a spreadsheet.`,
  },
  {
    id: "about-page",
    title: "About Page Writer",
    description: "Write a compelling about page, founder bio, or team introduction using storytelling frameworks that build trust and convert visitors.",
    category: "Marketing",
    mode: "chat",
    tags: ["writing", "branding", "about page", "bio"],
    prompt: `You are an expert copywriter who specializes in about pages and brand storytelling. You know how to make a brand feel human without being cliché.

About my business:
- Business name: [name]
- What I/we do: [your core service or product]
- Who I/we serve: [target audience]
- My background: [relevant experience, credentials, turning point that led here]
- Team members (if any): [names and roles]
- One thing that makes us genuinely different: [your real differentiator]

Write:
1. Full about page using the Origin Story framework (before → turning point → mission)
2. Opening hook (first 2 sentences that stop the scroll)
3. Story section (2-3 paragraphs, first person, specific details)
4. Who we help section (1 paragraph — the reader should see themselves)
5. Proof section (key results, credentials, or stats)
6. Team bios (if applicable — lead with personality, not credentials)
7. CTA that gives a clear next step

Also write:
- A 100-word professional bio (third person, for press/LinkedIn)
- A 30-word micro bio (for social media profiles)`,
  },
  {
    id: "ai-business-partner",
    title: "AI Business Partner (Athena)",
    description: "Set up a proactive AI assistant that manages your administrative tasks, synthesizes information, handles communications, and generates strategic insights.",
    category: "Productivity",
    mode: "chat",
    tags: ["assistant", "productivity", "business", "automation"],
    prompt: `You are Athena, my advanced AI Business Partner. Your core attributes are: Proactive, Professional, Precise, Perceptive, and Private.

Your role is to augment my effectiveness by:
- Proactively managing administrative tasks before I ask
- Synthesizing complex information into clear decision-ready summaries
- Facilitating clear communication (drafting emails, proposals, briefs)
- Generating strategic insights from the information I share

My context:
- My role: [your job title or business role]
- My biggest current priorities: [list 2-3 things you're working on]
- My communication style preference: [concise/detailed, formal/casual]
- Tools and systems I use: [email provider, calendar, CRM, etc.]

Start our working relationship with:
1. A set of clarifying questions to understand my world better
2. A suggested daily workflow for how we should work together
3. Templates for the 3 most common tasks you'll help me with
4. A briefing format for morning updates

Act like a Chief of Staff, not a search engine.`,
  },
  {
    id: "mobile-seo",
    title: "Mobile SEO Audit",
    description: "Get a comprehensive mobile SEO audit covering usability, page speed, Core Web Vitals, structured data, and a prioritized fix list.",
    category: "Strategy",
    mode: "chat",
    tags: ["SEO", "mobile", "performance", "technical"],
    prompt: `You are an expert in mobile SEO and Core Web Vitals optimization.

My website:
- URL: [your website URL]
- Built with: [your tech stack, e.g., React, WordPress, Next.js]
- Current mobile issues I know about: [describe any known problems]
- Target keywords: [your main keywords]
- Monthly organic traffic: [approximate number]

Audit my mobile SEO across:
1. Mobile usability (viewport, tap targets, font sizes, content width)
2. Page speed (LCP, FID/INP, CLS — Core Web Vitals)
3. Responsive design implementation
4. Mobile-specific technical SEO (structured data, hreflang, canonical tags)
5. Image optimization (next-gen formats, lazy loading, sizing)
6. JavaScript render-blocking issues
7. Mobile-first indexing readiness

Deliver:
- A severity matrix (Critical / High / Medium / Low) for each issue
- Step-by-step fix instructions for the top 5 issues
- Expected ranking impact for each fix
- A 90-day SEO roadmap prioritized by impact-to-effort ratio
- Tools to use for ongoing monitoring`,
  },
  {
    id: "generate-ui",
    title: "UI Design System Generator",
    description: "Generate a complete design system: color palette, typography scale, component specifications, spacing rules, and dark/light mode tokens.",
    category: "Design",
    mode: "chat",
    tags: ["design", "UI", "design system", "components"],
    prompt: `You are a senior UI/UX designer and design systems architect.

My project:
- Product type: [web app / mobile app / SaaS / e-commerce / etc.]
- Brand personality: [describe in 3-5 adjectives, e.g., "modern, trustworthy, minimal"]
- Primary color (if you have one): [hex or description]
- Target users: [who uses this product]
- Existing tech stack: [React, Vue, Tailwind, etc.]

Design a complete design system including:
1. Color palette: primary, secondary, neutral, semantic (success, warning, error, info), dark and light mode tokens
2. Typography scale: font family rationale, size scale (xs to 4xl), line heights, font weights
3. Spacing system: base unit, scale, when to use each size
4. Component specifications:
   - Buttons (primary, secondary, ghost, destructive) with all states
   - Input fields (default, focus, error, disabled)
   - Cards (default, hover, selected)
   - Navigation (top bar, sidebar, mobile)
5. Elevation and shadow system
6. Border radius conventions
7. Animation and transition standards

Output as: design tokens (CSS variables), component specs, and a usage guide.`,
  },
  {
    id: "generate-image-product",
    title: "Product Visualization",
    description: "Generate a professional product image with custom background, lighting, and styling — perfect for landing pages and social media.",
    category: "Design",
    mode: "image",
    tags: ["product", "image", "photography", "branding"],
    prompt: `Create a professional product photography style image.

Product: [describe your product in detail]
Style: [minimalist / lifestyle / technical / luxury / playful]
Background: [solid color / gradient / scene / environment]
Lighting: [studio / natural / dramatic / soft]
Color mood: [warm / cool / neutral / brand colors]
Additional elements: [props, hands, context items]
Intended use: [landing page hero / social media / ad]

Make it look like a professional studio photograph suitable for a premium brand.`,
  },
  {
    id: "generate-image-social",
    title: "Social Media Visual",
    description: "Create eye-catching social media graphics with text, brand colors, and visual hierarchy optimized for Instagram, LinkedIn, or X.",
    category: "Design",
    mode: "image",
    tags: ["social media", "graphic design", "Instagram", "LinkedIn"],
    prompt: `Create a professional social media graphic.

Platform: [Instagram / LinkedIn / X / Facebook]
Format: [square post / story / banner / carousel slide]
Message/headline: [the main text to display]
Brand colors: [primary color + accent color]
Style: [bold and minimal / editorial / data visualization / quote card / announcement]
Mood: [professional / creative / urgent / inspiring]
Include: [logo space / call to action / statistic / quote]

Make it visually striking enough to stop the scroll. High contrast, clear hierarchy, clean layout.`,
  },
  {
    id: "code-api",
    title: "REST API Builder",
    description: "Generate a complete, production-ready REST API with authentication, validation, error handling, and documentation for any use case.",
    category: "Code",
    mode: "code",
    tags: ["API", "backend", "REST", "Node.js"],
    prompt: `Build a complete production-ready REST API.

Requirements:
- Language/runtime: [Node.js / Python / Go / other]
- Framework: [Express / FastAPI / Gin / other]
- Database: [PostgreSQL / MongoDB / SQLite / other]
- Authentication: [JWT / OAuth / API key / none]

API purpose: [what does this API do]
Resources/entities: [list the main data models, e.g., users, products, orders]

Generate:
1. Full API with all CRUD endpoints for each resource
2. Request validation middleware
3. Authentication and authorization middleware
4. Consistent error handling (proper HTTP status codes and error messages)
5. Database schema / models
6. Environment configuration (.env.example)
7. API documentation (OpenAPI/Swagger or markdown)
8. Basic rate limiting

Write production-quality code with proper separation of concerns. Add comments only where the logic is non-obvious.`,
  },
  {
    id: "code-debug",
    title: "Bug Detective",
    description: "Paste your broken code and get a root-cause analysis, step-by-step fix, and prevention strategies so it never happens again.",
    category: "Code",
    mode: "code",
    tags: ["debugging", "code review", "fix", "troubleshooting"],
    prompt: `You are an expert debugger and code reviewer. Analyze my broken code and fix it.

My code (paste below):
\`\`\`
[paste your code here]
\`\`\`

The error or unexpected behavior:
[describe what's going wrong — paste error messages if you have them]

What I expected to happen:
[describe the intended behavior]

What I've already tried:
[what debugging steps you've taken]

Give me:
1. Root cause analysis: exactly why this is failing
2. The fix with corrected code
3. Explanation of what changed and why
4. How to test that the fix works
5. How to prevent this class of bug in the future

If there are other bugs or code quality issues you spot while reviewing, flag them separately.`,
  },
  {
    id: "seo-blog-generator",
    title: "SEO Blog Post Generator",
    description: "Create a structured SEO content brief with keywords, meta tags, H-tags, internal links, and a full article outline optimized for search engines.",
    category: "Marketing",
    mode: "chat",
    tags: ["SEO", "blog", "content", "keywords"],
    prompt: `You are an expert AI Prompt Engineer that specializes in creating structured SEO blog content. Your goal is to bridge the gap between a high-level topic and a deep, structured content brief.

Please provide:
a. Keywords: [list your primary keyword, 3-5 secondary keywords, and 2-3 long-tail variants]
b. Website URL: [your website or social media URL for internal linking context]
c. Blog topic or event: [the main subject of the blog post]

Once I provide the above, generate a complete SEO Blog Post Creation Brief including:

1. Goal & Core Content
   - Primary topic and target audience
   - Target word count: 1000+ words
   - Tone: Authoritative, informative, engaging

2. SEO & Keyword Strategy
   - Primary keyword placement (title, H1, first 100 words, meta)
   - Secondary keyword distribution across H2/H3 sections
   - Long-tail keyword integration

3. Article Structure
   - Title (under 60 chars, includes primary keyword)
   - Meta description (under 160 chars, includes CTA)
   - H1, H2, H3 tag outline
   - Introduction hook
   - Full section-by-section outline with key points

4. Content Directives
   - Mandatory internal and external links
   - Image/media suggestions with alt text recommendations
   - E-E-A-T signals to include

5. Full Article Draft
   - Write the complete blog post following the brief above

Optimize every element for search ranking and human readability.`,
  },
  {
    id: "pinterest-idea-pin",
    title: "Pinterest Idea Pin Strategist",
    description: "Transform your concept into a complete Pinterest Idea Pin: narrative script per slide, AI image prompts, text overlays, and brand-aligned visuals.",
    category: "Marketing",
    mode: "chat",
    tags: ["Pinterest", "social media", "visual content", "content strategy"],
    prompt: `You are a highly creative Pinterest Visual Strategist and expert AI Art Director. Your mission is to take my concept and transform it into a complete, ready-to-create Idea Pin visual story.

My Idea Pin details:
- My Business/Product Niche: [briefly describe your business, e.g., "A small-batch coffee roastery focused on ethically sourced beans"]
- Topic of the Idea Pin: [describe the process, story, or tutorial, e.g., "A step-by-step guide on how to make the perfect pour-over coffee at home"]
- Number of Slides/Steps: [enter desired number, e.g., 5]
- Key Visual Elements to Include: [specific objects, products, or people that must appear]
- Brand's Visual Style: [describe your aesthetic, e.g., "Moody rustic photography, deep shadows, warm tones, cinematic feel"]

Generate a two-part creative plan:

PART 1 — IDEA PIN SCRIPT
For each slide provide:
- Slide Title: A short, engaging headline for the text overlay
- Slide Description/Action: The specific scene or action to represent visually

PART 2 — AI TEXT-TO-IMAGE PROMPTS
For each slide write a detailed image generation prompt that:
- Directly corresponds to the slide's action
- Specifies subject, composition, lighting, color palette, mood, and style
- Matches my brand aesthetic consistently across all slides
- Ends with technical parameters: [photorealistic / illustrated / painterly], 9:16 aspect ratio, high detail

Deliver both parts in clean sections so I can immediately use the prompts in an AI image generator.`,
  },
  {
    id: "flutter-super-prompt",
    title: "Flutter Super-Prompt Builder",
    description: "Generate the complete universal super-prompt for any Flutter app. The single most important skill in agentic app development — covers architecture, features, data models, and coding standards.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["flutter", "super-prompt", "MVVM", "Riverpod"],
    prompt: `You are an expert Flutter developer using the MVVM + Riverpod architecture. Build me a complete Flutter application.

APP OVERVIEW:
- App name: [e.g., HabitFlow]
- App description: [1-2 sentences: what it does and for whom]
- Target platform: [Android / iOS / Both]
- Monetization: [Free / Freemium / Subscription — e.g., $4.99/month]

CORE FEATURES (list 3-5):
1. [Feature 1 — e.g., Daily habit tracking with streaks]
2. [Feature 2 — e.g., Reminders via local notifications]
3. [Feature 3 — e.g., Progress analytics with charts]
4. [Feature 4 — optional]
5. [Feature 5 — optional]

TECH STACK (confirm or adjust):
- State: Riverpod 2.x (AsyncNotifier + StateNotifier)
- Navigation: GoRouter
- Backend: Firebase (Auth + Firestore + Analytics)
- Models: Freezed + json_serializable
- HTTP: Dio (if external APIs needed)
- Local storage: Hive or SharedPreferences

DATA MODELS:
- [Model 1 — e.g., Habit: id, title, frequency, streak, lastCompleted]
- [Model 2 — e.g., HabitLog: habitId, completedAt, note]
- [Model 3 — add more as needed]

SCREENS:
- [Screen 1 — e.g., Home: today's habits with completion toggles]
- [Screen 2 — e.g., AddHabit: form to create/edit habits]
- [Screen 3 — e.g., Analytics: streak chart, completion rate]
- [Screen 4 — e.g., Settings: notifications, subscription, profile]

CODING STANDARDS:
- File structure: feature-first (features/habits/, features/auth/, features/analytics/)
- Every ViewModel is a separate class in its own file
- No business logic in widgets
- Always use const constructors where possible
- Target: ANR < 0.2%, Crash < 0.5%, Cold start < 1.0s

Generate:
1. Complete pubspec.yaml with all dependencies and versions
2. Project folder structure (tree format)
3. All Freezed data models with fromJson/toJson
4. Riverpod providers for each feature
5. Full implementation of [pick one screen to start]: [screen name]
6. GoRouter configuration with all routes
7. Firebase initialization in main.dart`,
  },
  {
    id: "flutter-aso-generator",
    title: "ASO 2026 Store Listing Generator",
    description: "Generate a complete App Store Optimization listing for Google Play and App Store. Optimized for Ask Play (Google's AI discovery), keyword density, and the FAQ format that gets apps surfaced in AI search.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["ASO", "Google Play", "App Store", "keywords"],
    prompt: `You are an App Store Optimization expert specialized in ASO 2026, including Google's Ask Play AI discovery engine.

MY APP:
- App name: [your app name]
- Category: [e.g., Health & Fitness / Productivity / Education]
- Core value proposition: [what problem it solves in one sentence]
- Target user: [describe your ideal user in detail]
- Key features: [list 5-7 main features]
- Main competitors: [list 2-3 competitors]
- Price: [Free / Freemium / Paid — specify]
- Unique differentiator: [what makes it genuinely different]

Generate a complete ASO package:

1. TITLE (≤ 30 chars): [Primary keyword + brand name]

2. SHORT DESCRIPTION (≤ 80 chars): [Hook + primary benefit, includes CTA]

3. LONG DESCRIPTION (4000 chars max):
   - Opening paragraph: strong hook (first 167 chars shown before "Read more")
   - Features section: bullet format, keyword-rich
   - FAQ FORMAT section (optimized for Ask Play AI):
     * Q: What does [App Name] do?
     * Q: Is [App Name] free?
     * Q: How does [App Name] compare to [competitor]?
     * Q: Who is [App Name] for?
     * Q: Does [App Name] work offline?
   - Social proof section
   - Closing CTA

4. KEYWORD LIST (Google Play): 100 chars max, comma-separated, no spaces after commas

5. APP STORE (APPLE) KEYWORD FIELD: 100 chars, different from title/subtitle

6. VISUAL ASO BRIEF:
   - Screenshot 1 caption: [primary benefit]
   - Screenshot 2-5 captions: [feature highlights]
   - Feature graphic concept: [describe the 1024x500 banner]

7. KEYWORD DENSITY AUDIT: confirm primary keyword appears in title, first paragraph, and 2-3% of long description.`,
  },
  {
    id: "flutter-firebase-architecture",
    title: "Firebase Architecture Generator",
    description: "Design a production-grade Firestore data architecture with security rules, indexes, and Cloud Functions for any Flutter app. Minimizes reads and costs while keeping data secure.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["Firebase", "Firestore", "security rules", "backend"],
    prompt: `You are a Firebase architect specializing in Flutter apps. Design a production-grade Firebase backend.

MY APP:
- App type: [e.g., habit tracker / social app / marketplace / fitness app]
- User types: [e.g., free users, premium users, admins]
- Core entities: [e.g., users, habits, logs, achievements, subscriptions]
- Scale target: [e.g., 10K users at launch, 100K in 6 months]
- Features requiring backend: [list: auth, storage, real-time sync, push notifications, etc.]

Generate:

1. FIRESTORE COLLECTIONS SCHEMA:
For each collection:
\`\`\`
/collectionName/{docId}
  field: type — description
  field: type — description
  subcollection (if needed): purpose
\`\`\`
Include: which fields to index, which to avoid indexing, estimated document size.

2. SECURITY RULES (complete rules.firestore):
\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All rules here
  }
}
\`\`\`
Rules must: authenticate all writes, validate data types, prevent over-reading, protect premium content.

3. COMPOSITE INDEXES (firestore.indexes.json):
List all queries that need composite indexes.

4. FLUTTER DATA LAYER:
- Repository pattern classes for each entity
- Riverpod providers for real-time streams
- Offline persistence configuration
- Pagination with cursors for large collections

5. CLOUD FUNCTIONS (TypeScript):
- Auth trigger: create user document on signup
- Scheduled function: daily analytics aggregation
- HTTP function: any webhook or external API call needed

6. COST OPTIMIZATION:
- Estimated reads/writes per DAU
- Caching strategy to minimize Firestore reads
- Which data to store locally vs. in Firestore`,
  },
  {
    id: "flutter-ai-proxy",
    title: "AI Integration: Cloud Function Proxy",
    description: "Build a secure AI integration using the Cloud Function proxy pattern. Keeps API keys server-side, implements caching to minimize costs, and designs prompts that deliver real user value.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["AI", "Cloud Functions", "API proxy", "Gemini"],
    prompt: `You are an expert in building secure AI integrations for mobile apps. Implement the Cloud Function proxy pattern.

MY APP:
- App type: [e.g., habit coach / writing assistant / language tutor]
- AI provider: [Gemini / OpenAI / Claude]
- AI features: [describe 2-3 AI-powered features, e.g., "daily motivational coaching", "habit suggestions"]
- Expected usage: [e.g., 5 AI calls per user per day]
- Monetization tier: [which features are free vs. premium]

Generate:

1. CLOUD FUNCTION PROXY (TypeScript):
\`\`\`typescript
// Complete Cloud Function that:
// - Authenticates the Firebase user from the request
// - Validates the request body
// - Checks usage limits (free vs premium)
// - Calls the AI API server-side (key never leaves server)
// - Implements response caching (Firestore or Redis)
// - Returns the response to the client
\`\`\`

2. FLUTTER CLIENT SERVICE:
\`\`\`dart
// AiService class that:
// - Calls the Cloud Function (not the AI API directly)
// - Handles loading/error states with Riverpod
// - Implements local response caching
// - Shows graceful fallbacks when AI is unavailable
\`\`\`

3. PROMPT ENGINEERING:
For each AI feature, write:
- System prompt: [role + constraints + output format]
- User prompt template: [with [PLACEHOLDER] variables]
- Expected output schema: [structured JSON if needed]
- Cache key strategy: [what makes responses cacheable]

4. USAGE LIMITS & COST CONTROL:
- Free tier: [X calls/day] — implementation in Cloud Function
- Premium tier: [Y calls/day]
- Monthly cost estimate at 1K, 10K, 100K users
- Cache hit ratio target and implementation

5. ERROR HANDLING:
- Rate limit exceeded response
- AI service down fallback
- Invalid/offensive input handling`,
  },
  {
    id: "flutter-monetization",
    title: "Monetization & Paywall Builder",
    description: "Build a complete subscription monetization system: Universal Billing Prompt for Play Billing, paywall design that converts, pricing strategy, and the gamification layer that keeps users subscribed.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["monetization", "billing", "paywall", "subscriptions"],
    prompt: `You are a mobile app monetization expert specializing in Flutter subscription apps.

MY APP:
- App name: [name]
- Core value: [what users get from being premium]
- Target price points: [e.g., $2.99/month, $19.99/year]
- Free tier limits: [what free users can do — e.g., "3 habits max, no analytics"]
- Competitor pricing: [what similar apps charge]
- Target countries: [Tier 1 (US/UK/AU), Tier 2 (EU), Tier 3 (emerging markets)]

Generate:

1. UNIVERSAL BILLING IMPLEMENTATION (Flutter):
\`\`\`dart
// Complete in_app_purchase implementation:
// - Initialize billing on app start
// - Fetch available products
// - Handle purchase flow (initiate, verify, grant access)
// - Restore purchases
// - Handle pending purchases (important for compliance)
// - Firestore: update user.isPremium on verified purchase
\`\`\`

2. PAYWALL SCREEN (Flutter Widget):
Design a high-converting paywall including:
- Hero benefit headline (outcome-focused, not feature-focused)
- 3 bullet benefits (with emoji, specific and measurable)
- Plan toggle (monthly / annual with "Save X%" badge)
- Primary CTA button with urgency element
- Social proof (rating, user count)
- Fine print (cancel anytime, terms link)
- Free trial logic (if applicable)

3. PRICING STRATEGY:
- Recommended price points by tier (Tier 1/2/3)
- Annual vs monthly ratio recommendation
- A/B test variants to try at launch
- When to add a lifetime option

4. GAMIFICATION LAYER (churn reduction):
Implement these retention mechanics:
- Streak tracking: [X-day streak] → momentum effect
- Milestone badges: [first week, first month, etc.]
- Progress visualization: [completion rings, charts]
- Re-engagement: local notification on streak risk

5. REVENUE MATH:
- At [X] DAU with [Y]% conversion: estimated MRR
- Churn impact: 5% monthly churn vs 2% monthly churn over 12 months
- LTV calculation by pricing tier`,
  },
  {
    id: "flutter-android-vitals",
    title: "Android Vitals Optimizer",
    description: "Diagnose and fix ANR, crash rate, and cold start issues. Includes code patterns that prevent the most common Android Vitals violations and keeps your app above the critical thresholds for Play Store ranking.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["Android Vitals", "ANR", "crashes", "performance"],
    prompt: `You are an Android performance expert specializing in Flutter apps and Google Play Android Vitals.

CRITICAL THRESHOLDS (2026) — never exceed:
- ANR Rate: < 0.47% (target < 0.2%)
- Crash Rate: < 1.09% (target < 0.5%)
- Cold Start: < 1.5s (target < 1.0s)
- Excessive Wake Locks: < 5%

MY APP SITUATION:
- Current ANR rate: [e.g., 0.8% — or "unknown, pre-launch"]
- Current crash rate: [e.g., 1.5% — or "unknown, pre-launch"]
- Current cold start: [e.g., 2.1s — or "unknown"]
- Firebase packages used: [list your Firebase plugins]
- Heavy operations: [e.g., "loading user data on startup", "image processing"]
- Known error patterns: [paste crash logs or describe common ANRs]

Generate:

1. ANR PREVENTION PATTERNS:
\`\`\`dart
// Flutter patterns that cause ANRs and their fixes:
// - Main thread blocking operations
// - Synchronous I/O on UI thread  
// - Platform channel deadlocks
// - Heavy initialization in main()
// Show: wrong pattern → correct pattern for each
\`\`\`

2. COLD START OPTIMIZATION:
\`\`\`dart
// main.dart optimization:
// - Lazy initialization (don't load everything at startup)
// - Deferred component loading
// - Splash screen implementation that hides when ready
// - Firebase initialization order (what's blocking vs non-blocking)
// Target: < 1.0s to first meaningful frame
\`\`\`

3. CRASH PREVENTION CHECKLIST:
- Null safety audit: common null pointer patterns in Flutter
- Platform exceptions: how to catch and report them properly
- Firebase Crashlytics setup: custom keys, breadcrumbs, non-fatal logging
- Error boundary widget implementation

4. FLUTTER-SPECIFIC VITALS:
- Jank (dropped frames): identify and fix with DevTools
- Memory leaks: common patterns (StreamSubscription, AnimationController)
- Battery drain: background processing best practices
- Wake lock management for notifications

5. MONITORING SETUP:
- Firebase Performance Monitoring: custom traces for key flows
- Firebase Crashlytics: complete setup with custom attributes
- Alert thresholds: when to get notified before crossing the red line
- Pre-launch report: how to use it effectively`,
  },
  {
    id: "flutter-publish-checklist",
    title: "Publishing Checklist: Google Play & App Store",
    description: "Complete step-by-step publishing guide: AAB build, keystore management, Play Console track sequence, country targeting (Tier 1/2/3), GDPR compliance, and App Store Connect submission.",
    category: "Flutter Dev",
    mode: "flutter",
    tags: ["Google Play", "App Store", "publishing", "AAB", "release"],
    prompt: `You are a mobile app publishing expert for both Google Play and Apple App Store.

MY APP:
- App name + package name: [e.g., HabitFlow / com.company.habitflow]
- Platform: [Android only / iOS only / Both]
- Monetization: [Free / In-app purchases / Subscription]
- Target markets: [list countries or regions]
- Has AI features: [Yes/No — affects store policy compliance]
- Collects user data: [Yes/No — affects privacy labels]
- Age rating: [target age group — affects content rating]

Generate a complete publishing guide:

PART 1 — GOOGLE PLAY PUBLISHING:

1. BUILD RELEASE AAB:
\`\`\`bash
# Complete commands with all flags:
# 1. Generate keystore (first time only)
# 2. Configure signing in build.gradle
# 3. Build the release AAB
# 4. Verify the AAB before upload
\`\`\`

2. KEYSTORE MANAGEMENT:
- Where to store the keystore file safely
- What to backup (and what you'll lose if you lose it)
- CI/CD: how to store keystore as environment secret

3. PLAY CONSOLE SETUP:
- App creation checklist (package name, type, category)
- Content rating questionnaire answers for your app type
- Data safety form: what to declare and how
- Track sequence: Internal Testing → Closed Testing → Open Testing → Production
- Rollout strategy: start at 10%, monitor vitals, then 100%

4. SUBSCRIPTION PRODUCTS:
- Product ID naming convention
- Grace period configuration
- Proration mode for upgrades/downgrades

5. COUNTRY TARGETING:
- Tier 1 (US, UK, AU, CA): launch here first, highest ARPU
- Tier 2 (DE, FR, JP, KR, NL): add at 1 month
- Tier 3 (BR, MX, IN, ID): add at 2-3 months, adjust pricing
- Excluded countries: sanctions compliance

6. GDPR & COMPLIANCE:
- Privacy policy requirements
- Data deletion mechanism (required by Play policy)
- GDPR consent flow implementation

PART 2 — APP STORE (APPLE):

1. PREREQUISITES: Apple Developer account, Xcode setup, Bundle ID, certificates
2. APP STORE CONNECT: app creation, age rating, privacy nutrition labels
3. ASO DIFFERENCES vs Google Play: subtitle field, keyword field, review notes
4. SUBMISSION: TestFlight → App Review → release (manual vs automatic)
5. COMMON REJECTION REASONS for your app type and how to avoid them`,
  },
  {
    id: "reputation-manager",
    title: "Reputation Manager",
    description: "Scan reviews across Google, Facebook, and industry sites. Get a categorized reputation report with ready-to-post responses for every review.",
    category: "Operations",
    mode: "chat",
    tags: ["reputation", "reviews", "customer service", "social listening"],
    prompt: `You are a professional Online Reputation Manager with expertise in review monitoring and brand sentiment management.

My business details:
- Business name: [Your Business Name]
- Google Maps profile: [link to your Google Maps listing]
- Facebook page: [link to your Facebook page]
- Industry review site: [e.g., TripAdvisor / Zomato / Yelp — add link]
- My brand tone: [describe your communication style, e.g., "warm, professional, customer-centric"]
- Manager contact email: [your email for escalating negative reviews]

Task: Perform a reputation audit and generate response drafts.

For each review found, create a "Reputation Report" entry with:

1. Review Details
   - Platform, date, reviewer name, star rating, full review text

2. Sentiment Classification
   - Positive / Negative / Mixed — with a 1-sentence justification

3. Drafted Response
   For NEGATIVE reviews: Acknowledge the specific issue without being defensive. Apologize for their experience. Offer a clear resolution path (e.g., "Please email [manager email] so we can make this right").
   For POSITIVE reviews: Thank by name if possible. Mention a specific point they praised. Express that you look forward to serving them again.
   For MIXED reviews: Thank for feedback. Acknowledge both positives and negatives. Assure them you're taking suggestions seriously.

Format the final output as a clean, scannable report — each review followed immediately by its sentiment and response draft, ready to copy, edit, and post.

Start with a summary: total reviews found, sentiment breakdown (% positive / negative / mixed), and the top recurring theme in feedback.`,
  },
];

const CATEGORIES = ["All", "Flutter Dev", "Marketing", "Sales", "Strategy", "HR & People", "Operations", "Productivity", "Design", "Code"];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  All: <Sparkles size={14} />,
  "Flutter Dev": <Smartphone size={14} />,
  Marketing: <Megaphone size={14} />,
  Sales: <TrendingUp size={14} />,
  Strategy: <Brain size={14} />,
  "HR & People": <Users size={14} />,
  Operations: <Settings size={14} />,
  Productivity: <Briefcase size={14} />,
  Design: <Sparkles size={14} />,
  Code: <Code2 size={14} />,
};

const MODE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  chat: { bg: "rgba(0,208,255,0.1)", text: "var(--sb-accent)", label: "Chat" },
  code: { bg: "rgba(52,211,153,0.1)", text: "#34d399", label: "Code" },
  image: { bg: "rgba(168,85,247,0.1)", text: "#a855f7", label: "Image" },
  flutter: { bg: "rgba(69,190,255,0.12)", text: "#54c5f8", label: "Flutter" },
};

function PromptCard({ prompt, onUse }: { prompt: Prompt; onUse: (p: Prompt) => void }) {
  const mode = MODE_COLORS[prompt.mode];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col p-5 rounded-2xl transition-all group"
      style={{
        background: "var(--sb-card)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,208,255,0.2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: mode.bg, color: mode.text }}
            >
              {mode.label}
            </span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
            >
              {prompt.category}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">{prompt.title}</h3>
        </div>
      </div>

      <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
        {prompt.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {prompt.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            #{tag}
          </span>
        ))}
      </div>

      <button
        onClick={() => onUse(prompt)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{ background: "rgba(0,208,255,0.08)", color: "var(--sb-accent)", border: "1px solid rgba(0,208,255,0.15)" }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--sb-gradient)";
          e.currentTarget.style.color = "#121212";
          e.currentTarget.style.border = "1px solid transparent";
          e.currentTarget.style.boxShadow = "0 0 16px rgba(0,208,255,0.3)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(0,208,255,0.08)";
          e.currentTarget.style.color = "var(--sb-accent)";
          e.currentTarget.style.border = "1px solid rgba(0,208,255,0.15)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Use this prompt
        <ArrowRight size={12} />
      </button>
    </motion.div>
  );
}

export default function Prompts() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = PROMPTS.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleUse = (p: Prompt) => {
    sessionStorage.setItem("sb_prompt_fill", p.prompt);
    sessionStorage.setItem("sb_prompt_mode", p.mode);
    navigate("/chat");
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "var(--sb-bg)" }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "rgba(18,18,18,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <Link href="/">
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
            <LogoMark size={22} />
            <span className="font-black text-base tracking-tight" style={{ color: "var(--sb-accent)", textShadow: "0 0 14px rgba(0,208,255,0.5)" }}>
              SANDBOX.AI
            </span>
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
          <Link href="/#benefits"><span className="hover:text-white transition-colors cursor-pointer">Features</span></Link>
          <Link href="/#pricing"><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></Link>
          <Link href="/prompts"><span className="text-white cursor-pointer">Prompts</span></Link>
          <Link href="/about"><span className="hover:text-white transition-colors cursor-pointer">About</span></Link>
        </div>
        <Link href="/chat">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl"
            style={{ background: "var(--sb-gradient)", color: "#121212", boxShadow: "0 0 20px rgba(0,208,255,0.3)" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 32px rgba(0,208,255,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(0,208,255,0.3)")}
          >
            Open Chat
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-12 px-6 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono mb-6 rounded-full"
          style={{ border: "1px solid rgba(0,208,255,0.3)", color: "var(--sb-accent-light)", backgroundColor: "rgba(0,208,255,0.08)" }}
        >
          <Sparkles size={11} />
          {PROMPTS.length} ready-to-use prompts
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white"
        >
          Start with the right prompt.
          <br />
          <span style={{ background: "var(--sb-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Get results immediately.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-base max-w-xl mx-auto mb-10"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Expert-level prompts for marketing, sales, strategy, code, and more.
          Click any prompt to open it in chat — ready to customize.
        </motion.p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-transparent outline-none"
            style={{
              background: "var(--sb-card)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e0e0e0",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(0,208,255,0.4)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
          />
        </div>
      </section>

      {/* Category filters */}
      <section className="px-6 pb-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
              style={activeCategory === cat ? {
                background: "var(--sb-gradient)",
                color: "#121212",
                boxShadow: "0 0 16px rgba(0,208,255,0.3)",
              } : {
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {CATEGORY_ICONS[cat]}
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles size={24} className="mx-auto mb-3" style={{ color: "rgba(0,208,255,0.3)" }} />
            <p style={{ color: "rgba(255,255,255,0.3)" }}>No prompts match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <PromptCard key={p.id} prompt={p} onUse={handleUse} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
