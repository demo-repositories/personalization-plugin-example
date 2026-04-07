# Next.js example: `@sanity/personalization-plugin`

This repository is an **implementation example** of [`@sanity/personalization-plugin`](https://github.com/sanity-io/sanity-plugin-personalization) in a **Next.js** app inside a Turborepo monorepo. It shows **field-level** and **page-level** experiments wired from Sanity Studio through to the web app.

🎬 [Watch the video walkthrough](https://www.loom.com/share/3e1314575b23434eb0aa35ccad9b9592) to see how the plugin works.

## Personalization in this repo

This repo uses `@sanity/personalization-plugin` for **field-level** experiments 🧩 (variant values on fields) and **page-level** experiments 🗺️ (variant pages per route).

- **Where experiments + variants are defined**: [`apps/studio/utils/experiments.ts`](apps/studio/utils/experiments.ts) (IDs like `blog-title`, variants like `control`, `variant-a`).
- **Studio plugin wiring**: [`apps/studio/sanity.config.ts`](apps/studio/sanity.config.ts) (`fieldLevelExperiments({ fields, experiments })`).
- **Variant source in Web** 🍪: MurmurHash-based deterministic assignment using a stable `userId` (see [`apps/web/src/lib/experiments.ts`](apps/web/src/lib/experiments.ts) and [`apps/web/src/proxy.ts`](apps/web/src/proxy.ts)). The `ab-test` cookie stores `{ userGroup, userId }` and is used for routing and queries.
  - **userId resolution**: Logged-in session ID → persisted `ab-user-id` cookie (anonymous) → new UUID. Deterministic variant from `MurmurHash3(userId).result() % variants.length` for better distribution.
  - **On login**: Implement `getUserIdFromSession()` in experiments.ts and update the `ab-user-id` cookie to the real user ID so assignment stays consistent across sessions.

### Field-level experiments 🧩 (example: Blog title)

- **Schema**: `blog.newTitle` is an `experimentString` field in [`apps/studio/schemaTypes/documents/blog.ts`](apps/studio/schemaTypes/documents/blog.ts).
- **Queries**: GROQ picks the variant value via `$experiment` + `$variant` (see `experimentTitleFragment` in [`apps/web/src/lib/sanity/query.ts`](apps/web/src/lib/sanity/query.ts)).
- **Pages**: pass `params: { experiment: "blog-title", variant }` (see [`apps/web/src/app/blog/page.tsx`](apps/web/src/app/blog/page.tsx), [`apps/web/src/app/blog/[...slug]/page.tsx`](apps/web/src/app/blog/[...slug]/page.tsx))

### Page-level experiments 🗺️ (example: Route → alternate page)

- **CMS document**: `routeExperiment` stores a `targetRoute`, `isActive`, and an `experimentPage` (default + per-variant pages) in [`apps/studio/schemaTypes/documents/route-experiment.ts`](apps/studio/schemaTypes/documents/route-experiment.ts).
- **Runtime**: proxy fetches active route experiments, selects a page for the user variant, and rewrites while passing `pageId` (see [`apps/web/src/proxy.ts`](apps/web/src/proxy.ts) + [`apps/web/src/lib/route-experiments.ts`](apps/web/src/lib/route-experiments.ts)).
- **Homepage variants**: rewritten to `/home/[variant]` and rendered via `pageId` when provided (see [`apps/web/src/app/home/[variant]/page.tsx`](apps/web/src/app/home/[variant]/page.tsx))

> Important: `experimentId` + `variantId` must match across Studio experiment definitions, cookie values, and query params.

## Deployment

#### Configure GitHub Actions secrets:

For Sanity Studio deployment, add these repository secrets:

- `SANITY_DEPLOY_TOKEN`: Your Sanity deployment token
- `SANITY_STUDIO_PROJECT_ID`: Your Sanity project ID
- `SANITY_STUDIO_DATASET`: Your dataset name (e.g., 'production')
- `SANITY_STUDIO_TITLE`: Your Studio title
- `SANITY_STUDIO_PRESENTATION_URL`: URL where your frontend is hosted

## Features

Beyond the personalization example, the monorepo includes:

### Monorepo structure

- Apps: web (Next.js frontend) and studio (Sanity Studio)
- Shared packages: UI components, TypeScript config, ESLint config
- Turborepo for build orchestration and caching

### Frontend (web)

- Next.js App Router with TypeScript
- Shadcn UI components with Tailwind CSS
- Server Components and Server Actions
- SEO optimization with metadata
- Blog system with rich text editor
- Table of contents generation
- Responsive layouts

### Content management (Studio)

- Sanity Studio v3
- Custom document types (Blog, FAQ, Pages)
- Visual editing integration
- Structured content with schemas
- Live preview capabilities
- Asset management
