import Link from "next/link";
import { REPORT_RATE_URL, SITE } from "@/lib/site";

const links = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-8 text-sm text-muted">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={REPORT_RATE_URL}
            className="transition-colors hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report a wrong rate
          </a>
        </nav>
        <p>
          Built by{" "}
          <a
            href={SITE.author.url}
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            codeswot
          </a>
          . Estimates only — actual vending may differ due to debt recovery or
          meter charges.
        </p>
      </div>
    </footer>
  );
}
