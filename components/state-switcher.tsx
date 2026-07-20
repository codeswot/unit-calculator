"use client";

import { useRouter } from "next/navigation";
import { stateLabels } from "@/lib/tariffs/labels";
import type { StateSlug } from "@/lib/tariffs/schema";

type StateSwitcherProps = {
  states: StateSlug[];
  current: StateSlug;
};

export function StateSwitcher({ states, current }: StateSwitcherProps) {
  const router = useRouter();

  return (
    <select
      aria-label="Change state"
      value={current}
      onChange={(event) => router.push(`/${event.target.value}`)}
      className="cursor-pointer rounded-full border border-border bg-transparent px-3 py-1 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
    >
      {states.map((state) => (
        <option key={state} value={state}>
          {stateLabels[state]}
        </option>
      ))}
    </select>
  );
}
