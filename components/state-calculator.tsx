"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/calculator/money";
import { bandTaglines } from "@/lib/tariffs/labels";
import type { Band } from "@/lib/tariffs/schema";
import { findBandRate, type StateRates } from "@/lib/tariffs/view";
import { useStoredValue } from "@/lib/use-stored-value";
import { Calculator } from "./calculator";

const BAND_KEY = "uc.band";
const STATE_KEY = "uc.state";

type StateCalculatorProps = {
  rates: StateRates;
  initialBand?: Band;
};

function matchBand(rates: StateRates, value: string | null): Band | null {
  const entry = rates.bands.find((candidate) => candidate.band === value);
  return entry ? entry.band : null;
}

export function StateCalculator({ rates, initialBand }: StateCalculatorProps) {
  const [override, setOverride] = useState<Band | null>(initialBand ?? null);
  const [storedBand, setStoredBand] = useStoredValue(BAND_KEY);
  const [, setStoredState] = useStoredValue(STATE_KEY);

  useEffect(() => {
    setStoredState(rates.state);
  }, [rates.state, setStoredState]);

  const band =
    override ?? matchBand(rates, storedBand) ?? rates.bands[0].band;

  function choose(next: Band) {
    setOverride(next);
    setStoredBand(next);
  }

  const active = findBandRate(rates, band);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-2">
        {rates.bands.map((entry) => {
          const isActive = entry.band === band;
          return (
            <button
              key={entry.band}
              type="button"
              aria-pressed={isActive}
              onClick={() => choose(entry.band)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                isActive
                  ? "border-foreground bg-surface"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-medium">Band {entry.band}</span>
                <span className="text-sm text-muted">
                  {bandTaglines[entry.band]} · min {entry.minSupplyHours}h/day
                </span>
              </span>
              <span className="font-mono text-sm tabular-nums text-muted">
                {formatNaira(entry.rateKobo)}
              </span>
            </button>
          );
        })}
      </div>
      <Calculator rateKobo={active.rateKobo} vatRate={rates.vatRate} />
    </div>
  );
}
