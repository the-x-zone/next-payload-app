# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                    # Start dev server (no fast refresh)
pnpm build                  # Build for production (runs next-sitemap postbuild)
pnpm start                  # Serve production build
pnpm lint                   # Run ESLint
pnpm lint:fix               # Run ESLint with auto-fix

# Testing
pnpm test:int               # Run Vitest integration tests (tests/int/**/*.int.spec.ts)
pnpm test:e2e               # Run Playwright E2E tests (tests/e2e/, requires dev server)
pnpm test                   # Run both int and e2e

# Payload CLI
pnpm payload generate:types     # Regenerate payload-types.ts after schema changes
pnpm payload generate:importmap # Regenerate admin import map after adding custom components
pnpm payload migrate:create     # Create a new Postgres migration
pnpm payload migrate            # Run pending migrations (required before starting in prod)
```

TypeScript validation: `tsc --noEmit`

## Architecture

This is a **Payload CMS + Next.js monorepo** — both the CMS backend and the frontend website run in a single Next.js instance via `@payloadcms/next`.

### Route Groups

- `src/app/(frontend)/` — Public-facing website (Next.js App Router)
- `src/app/(payload)/` — Payload admin panel at `/admin` and REST/GraphQL API at `/api`

### Key Source Directories

```
src/
├── payload.config.ts        # Main Payload config (collections, globals, plugins, DB)
├── payload-types.ts         # Auto-generated — never edit manually
├── collections/             # Pages, Posts, Media, Categories, Users
├── globals/                 # Header, Footer (in src/Header/, src/Footer/)
├── blocks/                  # Layout builder blocks (Hero, Content, Media, CTA, Archive)
├── fields/                  # Reusable field configs (e.g. defaultLexical)
├── access/                  # Access control functions
├── hooks/                   # Payload hook functions
├── plugins/                 # Payload plugin config (SEO, search, redirects, form builder, nested docs)
├── heros/                   # Hero block variants
├── components/              # React components (admin customizations + frontend UI)
├── providers/               # React context providers
└── utilities/               # Shared helpers
```

### Database

Uses `@payloadcms/db-postgres`. In development, `push: true` is set by default — schema changes apply automatically without migrations. **Set `push: false` when pointing at a production database.**

### Content Model

- **Pages** and **Posts**: draft/version enabled, layout-builder enabled (blocks)
- **Media**: upload collection with pre-configured sizes and focal point
- **Categories**: nested via `plugin-nested-docs`
- **Users**: auth-enabled, controls admin panel access
- **Header / Footer**: globals with on-demand revalidation hooks

### Plugins Configured

`src/plugins/index.ts` wires up: SEO, search, redirects, form-builder, nested-docs, and the scheduled-publish jobs queue.

## Critical Payload Patterns

**After any schema change**, run `pnpm payload generate:types` to keep `payload-types.ts` in sync.

**After adding or modifying custom admin components**, run `pnpm payload generate:importmap`.

**Always pass `req` to nested Payload operations inside hooks** to maintain transaction atomicity.

**Local API bypasses access control by default.** When passing `user`, always add `overrideAccess: false`:
```ts
await payload.find({ collection: 'posts', user: req.user, overrideAccess: false })
```

**Prevent infinite hook loops** with a context flag:
```ts
if (context.skipHooks) return
await payload.update({ ..., context: { skipHooks: true }, req })
```

**Custom admin components** are registered as file paths (not imports) in collection/global configs. The `@/` alias resolves relative to `src/` (set via `importMap.baseDir`).

## Postgres Migrations

Migrations are required in production. Workflow:
1. Make schema changes in collection/global configs
2. `pnpm payload migrate:create` — generates SQL migration files
3. Commit migration files alongside config changes
4. On the server, run `pnpm payload migrate` before `pnpm start`

## Cron / Scheduled Publishing

Jobs queue is configured in `payload.config.ts`. The `/api/payload-jobs/run` endpoint accepts either an authenticated session or a `Bearer <CRON_SECRET>` header (set via `CRON_SECRET` env var). On Vercel, daily cron is the minimum on free plans.

## Environment Variables

Required: `DATABASE_URL`, `PAYLOAD_SECRET`
Optional: `CRON_SECRET` (for triggering jobs from Vercel Cron or external schedulers), `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`, `R2_PUBLIC_URL` (Cloudflare R2 media storage)

## Reference Docs

Deep-dive documentation lives in `docs/`. Read these when working on the relevant area:

| File | Topic |
|------|-------|
| `docs/payload-overview.md` | Architecture and core concepts |
| `docs/security-critical.mdc` | Access control bypass, transaction safety, hook loops |
| `docs/collections.md` | Collection patterns, auth, uploads, drafts, globals |
| `docs/fields.md` | All field types, conditional fields, virtual fields, validation |
| `docs/field-type-guards.md` | TypeScript field type utilities |
| `docs/access-control.md` | Collection/field-level access, RBAC, row-level security |
| `docs/access-control-advanced.md` | Cross-collection permissions, dynamic roles, multi-tenant |
| `docs/hooks.md` | Lifecycle hooks, hook context, common recipes |
| `docs/queries.md` | Local API, query operators, AND/OR, performance |
| `docs/endpoints.md` | Custom REST endpoints, auth, error handling |
| `docs/adapters.md` | Database and storage adapters |
| `docs/components.md` | Custom admin components, server vs client, styling |
| `docs/plugin-development.md` | Creating Payload plugins |
