import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why this free, open-source Nigerian electricity unit calculator exists, and who built it.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="text-muted">
        Buying electricity in Nigeria should not require guesswork. Rates change,
        VAT is easy to forget, and the units on your receipt rarely match what you
        expected. This calculator turns naira into units — and back — using the
        current NERC-published rate for your state and band.
      </p>
      <p className="text-muted">
        Built in Kaduna by codeswot. It is free forever and needs no login.
      </p>
      <p className="text-muted">
        The rates live in an open, versioned data file. If a rate is wrong, anyone
        can report it or send a fix.
      </p>
      <div className="flex flex-wrap gap-3">
        <a
          href={SITE.author.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          codeswot.me
        </a>
        <a
          href={SITE.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:border-foreground"
        >
          View source
        </a>
      </div>
    </main>
  );
}
