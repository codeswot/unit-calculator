"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/calculator/money";
import { loadOrCreateProfile, type Profile } from "@/lib/profile";
import { getSupabaseClient } from "@/lib/supabase/client";
import { bandTaglines } from "@/lib/tariffs/labels";
import { bandSchema, type Band } from "@/lib/tariffs/schema";
import { findBandRate, type StateRates } from "@/lib/tariffs/view";
import { StateCalculator } from "./state-calculator";
import { useRequireAuth } from "./use-require-auth";

export function DashboardClient({ allRates }: { allRates: StateRates[] }) {
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }
    let active = true;
    loadOrCreateProfile(session.user.id, allRates).then((next) => {
      if (active) {
        setProfile(next);
      }
    });
    return () => {
      active = false;
    };
  }, [session, allRates]);

  async function signOut() {
    await getSupabaseClient().auth.signOut();
    router.push("/");
  }

  if (loading || (session && !profile)) {
    return <Centered>Loading your dashboard…</Centered>;
  }
  if (!session || !profile) {
    return null;
  }

  const rates =
    allRates.find((entry) => entry.state === profile.state) ?? allRates[0];
  const parsedBand = bandSchema.safeParse(profile.band);
  const band: Band = parsedBand.success ? parsedBand.data : rates.bands[0].band;
  const active = findBandRate(rates, band);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </div>

      <section className="rounded-2xl bg-foreground px-6 py-6 text-background">
        <p className="text-xs font-medium uppercase tracking-widest text-background/60">
          {rates.stateLabel} · {rates.discoShortName}
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">
          Band {band}
        </p>
        <p className="mt-1 text-sm text-background/70">
          {bandTaglines[band]} · {formatNaira(active.rateKobo)} / unit · min{" "}
          {active.minSupplyHours}h/day
        </p>
        <Link
          href="/settings"
          className="mt-4 inline-block text-sm text-background/80 underline underline-offset-4"
        >
          Edit band & state
        </Link>
      </section>

      <StateCalculator rates={rates} initialBand={band} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted">This month</h2>
        <div className="rounded-2xl border border-border bg-surface px-5 py-6 text-muted">
          No purchases logged yet. Spending tracking is coming soon.
        </div>
      </section>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-5 py-20 text-muted">
      {children}
    </main>
  );
}
