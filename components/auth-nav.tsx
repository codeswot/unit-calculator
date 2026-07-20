"use client";

import Link from "next/link";
import { useAuth } from "./auth-provider";

export function AuthNav() {
  const { session } = useAuth();

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm text-muted transition-colors hover:text-foreground"
    >
      Save your band
    </Link>
  );
}
