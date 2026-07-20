import { getSupabaseClient } from "./supabase/client";
import type { ProfileRow } from "./supabase/types";
import type { StateRates } from "./tariffs/view";

export type Profile = ProfileRow;

export type ProfileDraft = {
  id: string;
  state: string;
  disco: string;
  band: string;
  meterCategory: string;
  displayName?: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    throw error;
  }
  return data;
}

export async function upsertProfile(draft: ProfileDraft): Promise<Profile> {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .upsert({
      id: draft.id,
      state: draft.state,
      disco: draft.disco,
      band: draft.band,
      meter_category: draft.meterCategory,
      display_name: draft.displayName ?? null,
    })
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await getSupabaseClient().rpc("delete_account");
  if (error) {
    throw error;
  }
}

export async function loadOrCreateProfile(
  userId: string,
  allRates: StateRates[],
): Promise<Profile> {
  const existing = await fetchProfile(userId);
  if (existing) {
    return existing;
  }
  const storedState = window.localStorage.getItem("uc.state");
  const storedBand = window.localStorage.getItem("uc.band");
  const rates =
    allRates.find((entry) => entry.state === storedState) ?? allRates[0];
  const band =
    rates.bands.find((entry) => entry.band === storedBand)?.band ??
    rates.bands[0].band;
  return upsertProfile({
    id: userId,
    state: rates.state,
    disco: rates.discoId,
    band,
    meterCategory: "NON_MD",
  });
}
