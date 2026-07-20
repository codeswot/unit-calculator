import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StateCalculator } from "@/components/state-calculator";
import { StateSwitcher } from "@/components/state-switcher";
import { tariffs } from "@/lib/tariffs/data";
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Served by {rates.discoName}</p>
          <StateSwitcher states={listStates(tariffs)} current={state} />
        </div>
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
    </main>
  );
}
