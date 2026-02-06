# Next.js Monorepo with Sanity CMS

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo.

## Features

### Monorepo Structure

- Apps: web (Next.js frontend) and studio (Sanity Studio)
- Shared packages: UI components, TypeScript config, ESLint config
- Turborepo for build orchestration and caching

### Frontend (Web)

- Next.js App Router with TypeScript
- Shadcn UI components with Tailwind CSS
- Server Components and Server Actions
- SEO optimization with metadata
- Blog system with rich text editor
- Table of contents generation
- Responsive layouts

### Content Management (Studio)

- Sanity Studio v3
- Custom document types (Blog, FAQ, Pages)
- Visual editing integration
- Structured content with schemas
- Live preview capabilities
- Asset management

### Personalization experiments (page-level + field-level) 🧪

This repo uses `@sanity/personalization-plugin` for **field-level** experiments 🧩 (variant values on fields) and **page-level** experiments 🗺️ (variant pages per route).

- **Where experiments + variants are defined**: [`apps/studio/utils/experiments.ts`](apps/studio/utils/experiments.ts) (IDs like `blog-title`, variants like `control`, `variant-a`).
- **Studio plugin wiring**: [`apps/studio/sanity.config.ts`](apps/studio/sanity.config.ts) (`fieldLevelExperiments({ fields, experiments })`).
- **Variant source in Web** 🍪: `ab-test` cookie `userGroup` is used for routing and passed to queries (see [`apps/web/src/lib/experiments.ts`](apps/web/src/lib/experiments.ts) and [`apps/web/src/proxy.ts`](apps/web/src/proxy.ts))

#### Field-level experiments 🧩 (example: Blog title)

- **Schema**: `blog.newTitle` is an `experimentString` field in [`apps/studio/schemaTypes/documents/blog.ts`](apps/studio/schemaTypes/documents/blog.ts).
- **Queries**: GROQ picks the variant value via `$experiment` + `$variant` (see `experimentTitleFragment` in [`apps/web/src/lib/sanity/query.ts`](apps/web/src/lib/sanity/query.ts)).
- **Pages**: pass `params: { experiment: "blog-title", variant }` (see [`apps/web/src/app/blog/page.tsx`](apps/web/src/app/blog/page.tsx), [`apps/web/src/app/blog/[...slug]/page.tsx`](apps/web/src/app/blog/[...slug]/page.tsx))

#### Page-level experiments 🗺️ (example: Route → alternate page)

- **CMS document**: `routeExperiment` stores a `targetRoute`, `isActive`, and an `experimentPage` (default + per-variant pages) in [`apps/studio/schemaTypes/documents/route-experiment.ts`](apps/studio/schemaTypes/documents/route-experiment.ts).
- **Runtime**: proxy fetches active route experiments, selects a page for the user variant, and rewrites while passing `pageId` (see [`apps/web/src/proxy.ts`](apps/web/src/proxy.ts) + [`apps/web/src/lib/route-experiments.ts`](apps/web/src/lib/route-experiments.ts)).
- **Homepage variants**: rewritten to `/home/[variant]` and rendered via `pageId` when provided (see [`apps/web/src/app/home/[variant]/page.tsx`](apps/web/src/app/home/[variant]/page.tsx))

> Important: `experimentId` + `variantId` must match across Studio experiment definitions, cookie values, and query params.

### Deployment

#### Configure GitHub Actions secrets:

For Sanity Studio deployment, add these repository secrets:

- `SANITY_DEPLOY_TOKEN`: Your Sanity deployment token
- `SANITY_STUDIO_PROJECT_ID`: Your Sanity project ID
- `SANITY_STUDIO_DATASET`: Your dataset name (e.g., 'production')
- `SANITY_STUDIO_TITLE`: Your Studio title
- `SANITY_STUDIO_PRESENTATION_URL`: URL where your frontend is hosted
