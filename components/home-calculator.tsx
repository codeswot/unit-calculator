"use client";

import type { StateRates } from "@/lib/tariffs/view";
import { useStoredValue } from "@/lib/use-stored-value";
import { StateCalculator } from "./state-calculator";
import { StateGrid, type StateGridItem } from "./state-grid";

const STATE_KEY = "uc.state";

export function HomeCalculator({ allRates }: { allRates: StateRates[] }) {
  const [storedState, setStoredState] = useStoredValue(STATE_KEY);
  const current =
    allRates.find((rates) => rates.state === storedState) ?? null;

  const items: StateGridItem[] = allRates.map((rates) => ({
    state: rates.state,
    label: rates.stateLabel,
    discoShortName: rates.discoShortName,
  }));

  if (!current) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted">Pick your state</h2>
        <StateGrid items={items} />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-medium">{current.stateLabel}</span>
          <span className="text-sm text-muted">
            Served by {current.discoShortName}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStoredState("")}
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Change state
        </button>
      </div>
      <StateCalculator rates={current} />
    </div>
  );
}
