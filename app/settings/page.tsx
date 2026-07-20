import type { Metadata } from "next";
import { SettingsClient } from "@/components/settings-client";
import { tariffs } from "@/lib/tariffs/data";
import { buildAllStateRates } from "@/lib/tariffs/view";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false },
};

export default function SettingsPage() {
  return <SettingsClient allRates={buildAllStateRates(tariffs)} />;
}
