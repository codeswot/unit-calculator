# codeswot's — Engineering Rules

> These rules apply to every package in this repo, every PR, every commit.
> No exceptions. Debate when the rule itself is wrong; in the meantime, follow it.

---

## Code Quality

### No comments in code

Code is the documentation. If you feel the need to write a comment, the code is not clear enough. Rename the variable, extract the function, simplify the logic — until the comment is unnecessary.

The only legitimate inline comments explain **why**, not **what**: a hidden constraint, a workaround for a specific upstream bug (link the issue), a non-obvious invariant. If removing the comment wouldn't confuse a future reader, don't write it.

### Keep methods short

A function should do one thing. If you need to scroll to read it, it is too long. Aim for functions that fit on one screen. If a function is growing, extract the pieces into well-named helpers.

### Code should be self-explanatory

Variable names, function names, type names — they should tell the reader exactly what they are and what they do. Abbreviations are banned unless universally understood (`id`, `url`, `ctx`, `err`, `req`, `res`, `dto`).

### Public API documentation in shared packages

The "no comments" rule above is about **inline** comments inside implementations. For code under [packages/](packages/) — consumed by [apps/api/](apps/api/) and any future app via workspace imports — public API documentation is required, not optional. A consumer reads the public API through IDE hover, not by opening source.

- TSDoc (`/** ... */`) on every exported symbol from a package barrel: classes, functions, types, interfaces, constants. This includes [@stoneb00k/db](packages/db/), [@stoneb00k/types](packages/types/), [@stoneb00k/utils](packages/utils/).
- Internal (non-exported) symbols and test files remain comment-free.
- **Each doc describes only its own contract.** No pointers to external documents (Notion pages, RFCs, design docs by section number), no references to phases or layers (`"v2 will add..."`, `"used by the auth flow"`), no current-state framing (`"this stub..."`, `"for now..."`). External docs and project history rot; the package's exported surface is a contract that lives with the code.

App code (anything under [apps/](apps/)) is not consumed externally — TSDoc there is optional, and the "no inline comments" rule above governs.

---

## Principles

### DRY — Don't Repeat Yourself

Every piece of knowledge has a single, unambiguous representation. Same logic in two places → extract. Copy-paste → stop.

### YAGNI — You Aren't Gonna Need It

Don't build features or abstractions for requirements that don't exist yet. Build what is needed now. Extend when the need is real. Speculative generality is waste.

### SOLID

- **S** — Single Responsibility: one reason to change per class/module
- **O** — Open/Closed: open for extension, closed for modification
- **L** — Liskov Substitution: subtypes must be substitutable for their base types
- **I** — Interface Segregation: many specific interfaces over one general one
- **D** — Dependency Inversion: depend on abstractions, not concretions

---

## Architecture

### Modular monolith — feature modules own their slice

This is a NestJS modular monolith, not microservices. Each feature lives in its own module under [apps/api/src/](apps/api/src/) and exposes a narrow public surface (its module class, a service, maybe a few DTOs). Cross-module access goes through the exported provider, never by reaching into another module's internals or its private files.

When a feature graduates into its own service, it should be liftable as a unit — keep the boundary clean now so the split is mechanical later.

### Layered within a module

Inside a module:

```text
Controller / Resolver        ← HTTP edge — DTOs in, DTOs out
       ↓
Service                      ← business logic, transactions, orchestration
       ↓
Repository / Drizzle query   ← data access only
```

- Controllers do not call Drizzle directly. Always go through a service, which goes through a repository or query function.
- Services do not import HTTP types (`@Req`, `@Res`, Express types). The HTTP edge is the controller's concern.
- Repositories do not throw HTTP exceptions. They return domain results; the service translates to `BadRequestException` / `NotFoundException` / etc.

### Right design patterns

Use patterns when they solve a real problem, not to demonstrate knowledge. If a junior engineer can't understand it in five minutes, it's too clever. Prefer obvious code.

---

## Dependencies

### Use industry-standard packages

Before writing something from scratch, check for a well-maintained, widely-adopted library. Use it. Follow its docs exactly. Don't invent conventions the library already defines.

### Pin dependency versions

Every dependency is pinned and committed to [pnpm-lock.yaml](pnpm-lock.yaml). No floating ranges in `package.json` for production deps without a lockfile entry. If a critical lib needs to be hard-pinned across the workspace, use the `pnpm.overrides` block in the root [package.json](package.json) — see the existing `drizzle-orm` pin.

### Keep dependencies minimal

Every dependency is a liability — security surface, upgrade burden, license risk. Add one only when the alternative is writing significant, complex code yourself. Prefer extending an existing dep over adding a parallel one.

---

## Testing

### Always write tests

Every service, repository, guard, and pipe ships with tests. Bug fixes ship with a regression test that fails before the fix and passes after. Refactors keep existing tests green. Untested code is not committed.

### Test at the right level

- **Unit** — pure logic, validators, mappers, utility functions. Fast, no I/O.
- **Integration** — anything that touches Drizzle, Redis, or BullMQ. Hit real services in Docker, not mocks. Mocking the DB hides the things that actually break in prod (migrations, transaction semantics, constraint violations).
- **E2E** — critical HTTP flows through the whole stack. Sparingly; they're slow.

Pick the weakest level that proves the behavior.

### Tests run in `pnpm test` and the precommit gate

If they don't run there, they don't exist. CI runs the same gate. No `.skip`, no `xit`, no commented-out tests on `main` — fix it, open a GitHub issue, or delete it.

### Tests are first-class code

Same rules apply: no `any`, no `console.log`. Test names describe behavior, not function identifiers (`'rejects login when 2FA token is expired'`, not `'test_validateLogin'`).

---

## Language-Specific Rules

### TypeScript

- `strict` mode enabled in every `tsconfig.json` — extends [tsconfig.base.json](tsconfig.base.json), no per-file opt-outs
- No `any` — ever. Use `unknown` and narrow.
- No implicit `any` via missing type annotations on public function signatures
- No non-null assertions (`!`) — narrow properly with type guards or early returns
- No `as` casts except at trust boundaries (Zod-validated input, parsed JSON) — and even there, prefer the validator's inferred type
- No `enum` — use `as const` objects + union types
- ESM only (`"type": "module"`) — no CommonJS `require` in source

### NestJS

- `class-validator` + `class-transformer` on every DTO. No untyped request bodies.
- A guard on every protected route. No naked endpoints — if it's public, mark it explicitly with a `@Public()` decorator and a comment-less reason in the PR description.
- HTTP status semantics matter: 401 (no/invalid creds) vs 403 (authenticated but forbidden) vs 400 (malformed input) vs 422 (semantically invalid input). Pick the right exception class.
- Swagger decorators on every controller method — the OpenAPI doc is the contract.
- Configuration goes through [apps/api/src/config/app-config.service.ts](apps/api/src/config/app-config.service.ts). Required secrets are validated at boot; mismatches fail loudly. Do not read `process.env` directly in feature code.

### Drizzle / Postgres

- All DB access through Drizzle. No raw SQL unless an operation truly can't be expressed in the query builder — and then it lives behind a repository function with tests.
- Schema and migrations live in [@stoneb00k/db](packages/db/). Apps import the client and schema from the package; they do not define their own schema.
- Migrations route through `DATABASE_DIRECT_URL`, not pgbouncer. Use `pnpm --filter @stoneb00k/db migrate`. Running `drizzle-kit` ad-hoc against the pooled URL will break.
- Long-running transactions and `LISTEN`/`NOTIFY` need the direct URL too — pgbouncer is in transaction-pool mode.

### Secrets — env files

- Secrets live in `.env.local`, gitignored via `.env*`. This project does not use Infisical.
- Never commit real secrets. `.env.example` documents the required keys with placeholder values.
- `NEXT_PUBLIC_*` vars are shipped to the browser by design — only publishable/public keys belong there (e.g. the Supabase publishable key). Server-only secrets use unprefixed names and are never referenced from client code.

### Logging

- Use the Nest logger or the configured pino instance. No `console.log` / `console.error` in app code.
- Logs go to stdout as JSON. SigNoz scrapes them via OTLP. Don't write a side-channel log file.

### Naming — internal vs external

- Internal/code: `stoneb00k` (with zeros). Package names, repo names, internal identifiers.
- External/customer-facing: `Bookify`. Email domains, UI copy, support docs.
- Never `stonebook`.

---

## Coverage

Coverage thresholds will be enforced once the API has its first feature module merged. Until then, write tests as if the gate exists — domain services 80%+, repositories 80%+, controllers covered by integration tests on the happy path and the main error branches.

Coverage is a floor, not a goal. A 70% number that's 20% in the domain layer and 95% in trivial mappers is broken even if the headline passes. Read the breakdown.

---

## Workflow

### The precommit gate

Before every `git commit` / `git push` / opening a PR:

```bash
pnpm precommit    # format + lint:fix + typecheck
pnpm test         # if you touche code with test
```

CI runs the same checks. If precommit fails locally, fix it locally — don't push and let CI tell you.

The user runs `git commit` and `git push` themselves. Agents propose changes and run `pnpm precommit`; they do not commit.

### No git hooks

No husky, no lint-staged, no pre-commit hook scripts. The `pnpm precommit` script is the single, manual gate. Hooks add a hidden layer that breaks tooling and surprises contributors.

---

## What clean code looks like

```ts
// ✗ Wrong — comment explains what the code should explain itself
// Check if user has admin role before proceeding
if (user.roles.includes('admin')) { ... }

// ✓ Right — the predicate reads as English
if (userIsAdmin(user)) { ... }
```

```ts
// ✗ Wrong — method doing too many things
async processOrder(req: CreateOrderDto): Promise<Order> {
  // validate
  // fetch customer
  // call payment service
  // transform
  // save
  // notify
  // return
}

// ✓ Right — each concern extracted, the orchestration is readable top-to-bottom
async processOrder(dto: CreateOrderDto): Promise<Order> {
  const validated = this.validator.parse(dto);
  const customer = await this.customers.findOrThrow(validated.customerId);
  const payment = await this.payments.charge(customer, validated.amount);
  const order = await this.orders.create(validated, payment);
  await this.notifications.orderCreated(order);
  return order;
}
```

```ts
// ✗ Wrong — speculative abstraction (YAGNI)
class UniversalDataProcessorFactoryStrategy<T, U, V> { ... }

// ✓ Right — solve the actual problem
class OrderProcessor { ... }
```

---

## Non-Negotiable

- No real secrets in code or in commits — they stay in gitignored `.env.local`, never committed
- No commented-out code committed
- No `TODO` or `FIXME` on `main` — open a GitHub issue and link it in the PR
- No `console.log` in app code — use the logger
- No raw `process.env` reads outside the config service — use `AppConfigService`
- No DB access from controllers — always through a service
- No mocking the DB in integration tests — hit the Dockerized Postgres
- No skipping the precommit gate

---

> These rules exist to keep the codebase readable, maintainable, and extensible as it grows. When in doubt, optimise for the next engineer reading this code — usually future you.
