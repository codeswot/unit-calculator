import Link from "next/link";
import { SITE } from "@/lib/site";
import { AuthNav } from "./auth-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-[13px] font-bold text-background"
          >
            ₦
          </span>
          {SITE.name}
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/how-it-works"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            How it works
          </Link>
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
