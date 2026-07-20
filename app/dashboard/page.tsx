import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { tariffs } from "@/lib/tariffs/data";
import { buildAllStateRates } from "@/lib/tariffs/view";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default function DashboardPage() {
  return <DashboardClient allRates={buildAllStateRates(tariffs)} />;
}
