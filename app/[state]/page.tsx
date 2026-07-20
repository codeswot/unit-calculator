import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StateCalculator } from "@/components/state-calculator";
import { tariffs } from "@/lib/tariffs/data";
import { stateLabels } from "@/lib/tariffs/labels";
import { listStates } from "@/lib/tariffs/resolver";
import { stateSlugSchema, type StateSlug } from "@/lib/tariffs/schema";
import { buildStateRates } from "@/lib/tariffs/view";

export const dynamicParams = false;

export function generateStaticParams() {
  return listStates(tariffs).map((state) => ({ state }));
}

function parseState(param: string): StateSlug | null {
  const result = stateSlugSchema.safeParse(param);
  return result.success ? result.data : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const state = parseState((await params).state);
  if (!state) {
    return {};
  }
  const rates = buildStateRates(tariffs, state);
  const year = new Date().getFullYear();
  const title = `Electricity Unit Calculator for ${rates.stateLabel} ${year}`;
  const description = `Convert naira to electricity units in ${rates.stateLabel}, served by ${rates.discoName}. Live per-band rates and instant vending estimates.`;
  return {
    title,
    description,
    alternates: { canonical: `/${state}` },
    openGraph: { title, description, url: `/${state}` },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const state = parseState((await params).state);
  if (!state) {
    notFound();
  }
  const rates = buildStateRates(tariffs, state);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <section className="flex flex-col gap-2">
        <p className="text-sm text-muted">Served by {rates.discoName}</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {rates.stateLabel} electricity unit calculator
        </h1>
        <p className="text-muted">
          Pick your band below. Not sure?{" "}
          <a
            href={rates.bandCheckerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Check your band with {rates.discoShortName}
          </a>
          .
        </p>
      </section>

      <StateCalculator rates={rates} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">
          Rate pages for {rates.stateLabel}
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {rates.bands.map((entry) => (
            <Link
              key={entry.band}
              href={`/${state}/band/${entry.band.toLowerCase()}`}
              className="rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-foreground"
            >
              <span className="font-medium">Band {entry.band}</span>
              <span className="block text-xs text-muted">
                min {entry.minSupplyHours}h/day
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">Other states</h2>
        <div className="flex flex-wrap gap-2">
          {listStates(tariffs)
            .filter((other) => other !== state)
            .map((other) => (
              <Link
                key={other}
                href={`/${other}`}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
              >
                {stateLabels[other]}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
