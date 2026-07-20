"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteAccount,
  loadOrCreateProfile,
  upsertProfile,
  type Profile,
} from "@/lib/profile";
import { getSupabaseClient } from "@/lib/supabase/client";
import { categoryLabels } from "@/lib/tariffs/labels";
import { bandSchema, meterCategorySchema } from "@/lib/tariffs/schema";
import type { StateRates } from "@/lib/tariffs/view";
import { useRequireAuth } from "./use-require-auth";

export function SettingsClient({ allRates }: { allRates: StateRates[] }) {
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [state, setState] = useState("");
  const [band, setBand] = useState("");
  const [category, setCategory] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!session) {
      return;
    }
    let active = true;
    loadOrCreateProfile(session.user.id, allRates).then((next) => {
      if (!active) {
        return;
      }
      setProfile(next);
      setState(next.state);
      setBand(next.band);
      setCategory(next.meter_category);
    });
    return () => {
      active = false;
    };
  }, [session, allRates]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!session) {
      return;
    }
    setPending(true);
    setSaved(false);
    const rates =
      allRates.find((entry) => entry.state === state) ?? allRates[0];
    await upsertProfile({
      id: session.user.id,
      state,
      disco: rates.discoId,
      band,
      meterCategory: category,
    });
    setPending(false);
    setSaved(true);
  }

  async function removeAccount() {
    if (
      !window.confirm(
        "Delete your account and all saved data? This cannot be undone.",
      )
    ) {
      return;
    }
    await deleteAccount();
    await getSupabaseClient().auth.signOut();
    router.push("/");
  }

  if (loading || (session && !profile)) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-5 py-20 text-muted">
        Loading settings…
      </main>
    );
  }
  if (!session || !profile) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <form onSubmit={save} className="flex flex-col gap-5">
        <Field label="State">
          <select
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-foreground"
          >
            {allRates.map((entry) => (
              <option key={entry.state} value={entry.state}>
                {entry.stateLabel} — {entry.discoShortName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Band">
          <select
            value={band}
            onChange={(event) => setBand(event.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-foreground"
          >
            {bandSchema.options.map((value) => (
              <option key={value} value={value}>
                Band {value}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Meter type"
          hint="Homes and small businesses use the standard meter. Change this only for an industrial or maximum-demand meter."
        >
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-foreground"
          >
            {meterCategorySchema.options.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
          {saved ? <span className="text-sm text-muted">Saved.</span> : null}
        </div>
      </form>

      <section className="flex flex-col gap-2 border-t border-border pt-6">
        <h2 className="text-sm font-medium text-muted">Danger zone</h2>
        <p className="text-sm text-muted">
          Delete your account and every saved band and purchase. This cannot be
          undone.
        </p>
        <button
          type="button"
          onClick={removeAccount}
          className="mt-1 self-start rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:border-foreground"
        >
          Delete account
        </button>
      </section>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
