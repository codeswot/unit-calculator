import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Save your band and track spending. Free account, email only, no password.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 py-16">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Save your band & track spending
        </h1>
        <p className="text-muted">
          Free, email only, no password. We send a one-time code.
        </p>
      </section>
      <LoginForm />
    </main>
  );
}
