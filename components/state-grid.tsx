import Link from "next/link";
import type { StateSlug } from "@/lib/tariffs/schema";

export type StateGridItem = {
  state: StateSlug;
  label: string;
  discoShortName: string;
};

export function StateGrid({ items }: { items: StateGridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.state}
          href={`/${item.state}`}
          className="flex flex-col rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-foreground"
        >
          <span className="font-medium">{item.label}</span>
          <span className="text-xs text-muted">{item.discoShortName}</span>
        </Link>
      ))}
    </div>
  );
}
