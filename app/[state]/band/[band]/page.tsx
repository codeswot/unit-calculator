import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StateCalculator } from "@/components/state-calculator";
import { formatNaira } from "@/lib/calculator/money";
import { tariffs } from "@/lib/tariffs/data";
import { bandTaglines } from "@/lib/tariffs/labels";
import { listStates } from "@/lib/tariffs/resolver";
import {
  bandSchema,
  stateSlugSchema,
  type Band,
  type StateSlug,
} from "@/lib/tariffs/schema";
import { bandOrder, buildStateRates, findBandRate } from "@/lib/tariffs/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return listStates(tariffs).flatMap((state) =>
    bandOrder.map((band) => ({ state, band: band.toLowerCase() })),
  );
}

function parseState(param: string): StateSlug | null {
  const result = stateSlugSchema.safeParse(param);
  return result.success ? result.data : null;
}

function parseBand(param: string): Band | null {
  const result = bandSchema.safeParse(param.toUpperCase());
  return result.success ? result.data : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; band: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const state = parseState(resolved.state);
  const band = parseBand(resolved.band);
  if (!state || !band) {
    return {};
  }
  const rates = buildStateRates(tariffs, state);
  const entry = findBandRate(rates, band);
  const year = new Date().getFullYear();
  const title = `Band ${band} Electricity Tariff ${rates.stateLabel} ${year}`;
  const description = `Band ${band} in ${rates.stateLabel} is ${formatNaira(
    entry.rateKobo,
  )} per unit, with at least ${entry.minSupplyHours} hours of supply a day. Convert naira to units instantly.`;
  return {
    title,
    description,
    alternates: { canonical: `/${state}/band/${band.toLowerCase()}` },
    openGraph: { title, description, url: `/${state}/band/${band.toLowerCase()}` },
  };
}

export default async function BandPage({
  params,
}: {
  params: Promise<{ state: string; band: string }>;
}) {
  const resolved = await params;
  const state = parseState(resolved.state);
  const band = parseBand(resolved.band);
  if (!state || !band) {
    notFound();
  }
  const rates = buildStateRates(tariffs, state);
  const entry = findBandRate(rates, band);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <nav className="text-sm text-muted">
        <Link
          href={`/${state}`}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {rates.stateLabel}
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Band {band}</span>
      </nav>

      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Band {band} electricity tariff in {rates.stateLabel}
        </h1>
        <p className="text-muted">
          {bandTaglines[band]} — at least {entry.minSupplyHours} hours of supply
          a day, served by {rates.discoName}.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface px-6 py-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Current rate
        </p>
        <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">
          {formatNaira(entry.rateKobo)}
          <span className="ml-2 text-lg font-normal text-muted">per unit</span>
        </p>
        <p className="mt-3 text-sm text-muted">
          Vending adds 7.5% VAT. Use the calculator below to see units after VAT.
        </p>
      </section>

      <StateCalculator rates={rates} initialBand={band} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">
          Other bands in {rates.stateLabel}
        </h2>
        <div className="flex flex-wrap gap-2">
          {rates.bands
            .filter((other) => other.band !== band)
            .map((other) => (
              <Link
                key={other.band}
                href={`/${state}/band/${other.band.toLowerCase()}`}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
              >
                Band {other.band}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
