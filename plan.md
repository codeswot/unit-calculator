# Nigeria Unit Calculator — Implementation Plan (v2, multi-DisCo)

Free, open-source electricity unit calculator. Launch coverage: **KAEDC,
KEDCO, AEDC** — Kaduna, Kebbi, Sokoto, Zamfara, Kano, Katsina, Jigawa,
FCT/Abuja, Niger, Kogi, Nasarawa. Built by codeswot (codeswot.me).

---

## 1. Product Definition

**One-liner:** Instantly convert between naira and electricity units for
your state and band — and optionally track what you spend.

**Jobs to be done:**

1. "I have 42.3 units left — how much is that in naira?"
2. "How many units will ₦5,000 give me?" / "How much will 399.5 units cost?"
3. "What band am I on and what do I pay per unit?"
4. "How much have I spent this month?" (accounts only)

**Principles:**

- Calculator 100% free and public, forever. No login wall, no paywall.
- Signup optional; exists only to save state/band across devices and track
  purchases. CTA: "Save your band & track spending — free."
- Dead simple: users pick their **state**, never a DisCo acronym. State →
  DisCo resolution is internal.
- One input, one toggle, one giant live result. One-handed on 360px over 3G.
- Open source (MIT). The repo is a portfolio artifact.

---

## 2. Tariff Data

### 2.1 Source of truth

The **NERC May 2026 Supplementary MYTO Orders** (effective 1 May 2026),
per-DisCo PDFs on nerc.gov.ng. Paragraph 18 of each order confirms rates
are **frozen** at the levels payable since Jul 2024 (Band A) and Dec 2022
(Bands B–E) — i.e. the "Jul 2024 – May 2026" column in Table 3 is the
currently payable rate, carried forward by the May 2026 order.

- KAEDC: nerc.gov.ng/wp-content/uploads/2026/05/KAEDC_MYTO_MAY_2026.pdf ✅ transcribed
- KEDCO: nerc.gov.ng/wp-content/uploads/2026/05/KEDCO_MYTO_MAY_2026.pdf ✅ transcribed
- AEDC: same batch — ✅ transcribed ("A - MD2 Special" folded into MD2, identical pricing)

DisCo websites lag (KE's site says "Effective July 2024" — same figures,
stale framing). Always rate-source from the latest NERC order. Rates are
subject to monthly pass-through adjustments per the orders, so re-check on
each NERC publication cycle.

### 2.2 Data model — rates are data, never code

All rates live in a versioned `tariffs.json` static asset, fetched at
runtime, cached with a version stamp. Historical schedules retained so past
purchases stay accurate against the rate that applied at the time.

```ts
type DiscoId = 'KAEDC' | 'KEDCO' | 'AEDC';
type Band = 'A' | 'B' | 'C' | 'D' | 'E';
type MeterCategory = 'NON_MD' | 'MD1' | 'MD2';

type TariffSchedule = {
  effectiveFrom: string;
  source: string;
  vatRate: number;
  bands: Record<Band, {
    minSupplyHours: number;
    rates: Record<MeterCategory, number>;
  }>;
};

type Disco = {
  id: DiscoId;
  name: string;
  shortName: string;
  states: StateSlug[];
  bandCheckerUrl: string;
  schedules: TariffSchedule[];
};

type StateSlug =
  | 'kaduna' | 'kebbi' | 'sokoto' | 'zamfara'
  | 'kano' | 'katsina' | 'jigawa'
  | 'abuja' | 'niger' | 'kogi' | 'nasarawa';

type TariffFile = {
  version: string;
  discos: Disco[];
};
```

State → DisCo is a derived lookup built from `Disco.states`. Zod-validate
the whole file at load; resolve active schedule by `effectiveFrom`.

Confirmed rates (₦/kWh, NERC May 2026 orders — all in tariffs.json v2026-05-01.2):

| Band (hrs) | KAEDC Non-MD/MD1/MD2   | KEDCO Non-MD/MD1/MD2   | AEDC Non-MD/MD1/MD2    |
|------------|------------------------|------------------------|------------------------|
| A (20h)    | 209.50 flat            | 209.50 flat            | 209.50 flat            |
| B (16h)    | 62.63 / 66.34 / 68.78  | 65.29 / 68.13 / 71.11  | 63.35 / 76.15 / 76.15  |
| C (12h)    | 51.12 / 52.88 / 55.52  | 47.57 / 49.51 / 54.01  | 51.79 / 63.44 / 63.44  |
| D (8h)     | 35.41 / 46.40 / 46.40  | 32.02 / 47.58 / 47.58  | 33.95 / 55.82 / 55.82  |
| E (4h)     | 35.41 / 46.40 / 46.40  | 31.88 / 47.58 / 47.58  | 33.95 / 55.82 / 55.82  |

Notes:

- **Lifeline class (₦4.00/kWh)** exists in all orders — stored as
  `lifelineRate` per DisCo in the JSON; excluded from v1 UI.
- **D/E inversion:** Non-MD is cheaper than MD1/MD2 in Bands D and E. UI
  copy must never imply MD rates are "premium = higher band"; another
  reason households default to NON_MD silently.
- tariffs.json carries a `pending` array for untranscribed DisCos. Build
  guard: page generation must fail (or skip + warn) for any state whose
  DisCo is still in `pending` — never ship a state without rates.

### 2.3 The math

Vending (money → units) includes 7.5% VAT; remaining-balance valuation does
not. Two formulas — never conflate.

```
Vending:
  energyAmount = amountPaid / (1 + vatRate)
  units        = energyAmount / rate

Cost of N units at the till:
  cost = units × rate × (1 + vatRate)

Value of units remaining on meter:
  value = units × rate
```

Show the breakdown on vending results:
"₦5,000 = ₦348.84 VAT + ₦4,651.16 energy = 22.2 units @ ₦209.50".

Rules:

- All money math in kobo (integers); format at the edges. Never float-add
  naira.
- Display: ₦5,000.00 formatting, 2dp money, 1dp units.
- Disclaimer under results + footer: estimates only; actual vending may
  differ due to debt recovery or meter service charges.
- Pure engine: `convert(input: { discoId, band, category, direction, value },
  file: TariffFile)`. Exhaustive tests: VAT rounding edges, decimal units
  (399.5), zero/negative guards, kobo precision, per-DisCo rate resolution,
  effective-date schedule selection.

### 2.4 MD handling — protect simplicity

Default `NON_MD` silently everywhere. Public calculator asks state + band
only. Settings hides categories behind "Business or industrial meter?
Change meter type" with one-line explanations.

---

## 3. Stack

| Concern    | Choice                                              |
|------------|-----------------------------------------------------|
| Framework  | Next.js 14+ App Router, TypeScript (strict), `output: 'export'` — pure static build, no runtime server |
| SSG/SEO    | `generateStaticParams` stamps state/band pages from tariffs.json; Metadata API for per-page titles/OG/JSON-LD; built-in sitemap convention |
| Validation | Zod at every external boundary                        |
| Backend    | Supabase only: email OTP auth, Postgres, RLS. No custom backend — the app has no domain layer to justify one |
| Styling    | Tailwind. Large type, large touch targets             |
| PWA        | serwist (or next-pwa); calculator + cached tariffs work offline |
| Hosting    | Cloudflare Pages (Lagos edge) serving the static `out/` folder |
| Payments   | None. It's free.                                      |

Coding standard: zero comments, strict TS, no `any`, conventional commits,
tests on the engine, no secrets in git (public repo).

---

## 4. Data Model (Supabase)

```
profiles
  id              uuid PK, FK -> auth.users
  state           text NOT NULL
  disco           text NOT NULL
  band            text CHECK (band in ('A','B','C','D','E'))
  meter_category  text NOT NULL DEFAULT 'NON_MD'
  display_name    text
  created_at      timestamptz DEFAULT now()

purchases
  id                     uuid PK DEFAULT gen_random_uuid()
  user_id                uuid FK -> profiles.id
  amount_kobo            bigint NOT NULL
  units_received         numeric(10,2) NOT NULL
  disco_at_purchase      text NOT NULL
  band_at_purchase       text NOT NULL
  category_at_purchase   text NOT NULL
  rate_at_purchase_kobo  bigint NOT NULL
  purchased_at           timestamptz NOT NULL
  created_at             timestamptz DEFAULT now()
```

Snapshots survive band/state edits and tariff revisions. RLS: own rows
only. Monthly spend aggregated client-side. One-click account deletion
(NDPA).

---

## 5. Pages & Routes

### Public — prerendered, all generated from tariffs.json at build time

| Route                  | Purpose |
|------------------------|---------|
| `/`                    | State picker + calculator. Geo-suggest nothing; just a friendly state grid. Remembers choice in localStorage. |
| `/{state}`             | State calculator page, DisCo resolved ("Kaduna — served by Kaduna Electric"). 11 pages. |
| `/{state}/band/{a-e}`  | Rate, supply hours, calculator preset. 55 pages — the long-tail SEO engine ("band b tariff kano", "abuja band a rate"). |
| `/how-it-works`        | Bands, VAT math, why receipt units differ. FAQ format. |
| `/about`               | Why I built this, built-in-Kaduna line, codeswot.me + repo links. |
| `/privacy`             | Email only, deletion available. |

11 state pages + 55 band pages, all stamped from one template + the JSON.
Adding a DisCo later = edit tariffs.json, rebuild.

### Authenticated — client-rendered

| Route        | Purpose |
|--------------|---------|
| `/dashboard` | Band card huge at top ("Kaduna · **Band B** — ₦xx.xx/unit, min 16hrs/day") with Edit. Calculator, month spend, recent purchases below. |
| `/settings`  | State, band, meter type (hidden link), delete account. |

---

## 6. UX Spec

- Onboarding: state first (grid of 11, big touch targets), then band with
  meaning ("Band A — light almost all day, 20+ hrs"). Link the resolved
  DisCo's band checker for the unsure.
- Calculator: segmented toggle `[ Naira → Units | Units → Naira ]`, numeric
  input (`inputmode="decimal"`), live result, no button.
- Preset chips: ₦1,000 / ₦2,000 / ₦5,000 / ₦10,000.
- Anonymous state+band persist in localStorage; merged into profile on
  signup.
- Copy: plain English, Hausa-friendly phrasing (strong fit — nearly the
  whole coverage map is Hausa-speaking). Hausa toggle later; write v1 copy
  to translate cleanly.
- Test throttled 3G, 360px, installed PWA.

---

## 7. SEO & Distribution

1. Prerendered HTML for all 70+ public pages.
2. Per-page meta with state + year: "Band A Electricity Tariff Kano 2026 —
   Unit Calculator".
3. JSON-LD: `WebApplication` on `/` with
   `author: { "@type": "Person", "name": "Mubarak (codeswot)", "url": "https://codeswot.me" }`;
   `FAQPage` on /how-it-works targeting literal queries ("How much is 1
   unit of electricity in Abuja?").
4. WhatsApp-first OG image (app UI + sample result). Consider per-state OG
   text overlay — forwarded links that say the reader's own state convert
   better.
5. sitemap.xml (all state/band pages), canonicals, semantic HTML,
   Lighthouse 95+.
6. Freshness: on NERC revisions, update tariffs.json AND page copy
   effective dates. "Updated for [Month Year]" on band pages.
7. Own domain (.ng or .com.ng); codeswot.me features it and links back.

---

## 8. Open Source & Personal Branding

- MIT, public repo, README explaining tariff-as-versioned-data, the VAT
  math, and how to PR a tariff update (this makes rate maintenance
  community-assisted).
- Footer everywhere: "Built by codeswot" → codeswot.me. Never in the hero.
- "Report wrong rate" link → prefilled GitHub issue with state/band
  context. Fast fixes ARE the marketing.
- Launch thread (X/Nostr): problem, VAT gotcha, tariff-as-data, DisCo≠state
  trivia, screenshots, link. Write-up on codeswot.me targeting the same
  queries.

---

## 9. Build Phases

### Phase 0 — Rate transcription ✅ COMPLETE
- [x] KAEDC Table 3 transcribed and cross-checked against KE website
- [x] KEDCO Table 3 transcribed
- [x] AEDC Table 3 transcribed ("A - MD2 Special" class folded into MD2 —
      identical pricing)
- [x] tariffs.json v2026-05-01.2: all three DisCos, 11 states, lifeline
      rates, structurally validated

### Phase 1 — Calculator (a weekend)
- tariffs.json + Zod schema + state→DisCo resolver + schedule resolver
- Pure conversion engine + exhaustive tests
- Landing + state pages + band pages via generateStaticParams, how-it-works,
  about
- Static export, Metadata API meta/JSON-LD/OG, sitemap, PWA, deploy
- Public repo + README. **Launch thread here.**

### Phase 2 — Accounts (a few evenings)
- Supabase auth, profiles (state/disco/band), RLS
- Dashboard band card + edit; settings; localStorage merge on signup

### Phase 3 — Spending tracker
- Manual purchase logging with full snapshot fields
- Monthly totals + simple per-month bars
- No token parsing or vending APIs in v1

### Later / maybe
- Remaining 8 DisCos (pure data work now)
- Hausa toggle; low-unit PWA reminder
- Vending affiliate (VTpass/Buypower) once traffic justifies

---

## 10. Pre-Launch Checklist

- [ ] AEDC rates transcribed; all three DisCos verified digit by digit
      against the NERC PDFs
- [ ] VAT rate (7.5%) confirmed current
- [ ] Engine tests green incl. kobo rounding, 399.5 decimals, per-DisCo
      resolution, effective-date selection
- [ ] Result matches a real Kaduna vending receipt (expected: ₦5,000 on
      KAEDC Band B Non-MD ≈ 74.3 units); verify one Kano + one Abuja
      receipt via friends
- [ ] Lighthouse ≥95 mobile; 3G + 360px pass; PWA calculates offline
- [ ] OG previews look right in WhatsApp
- [ ] Disclaimer + privacy live; account deletion works
- [ ] "Report wrong rate" issue template works
- [ ] Footer credit + JSON-LD author + codeswot.me backlink
- [ ] Repo public, README complete, no secrets in history