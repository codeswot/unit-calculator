"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function sendCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { error: sendError } = await getSupabaseClient().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setPending(false);
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setStep("code");
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { error: verifyError } = await getSupabaseClient().auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setPending(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6">
      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-border bg-surface px-4 py-3 outline-none focus:border-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send me a code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">
              Enter the code sent to {email}
            </span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              className="rounded-xl border border-border bg-surface px-4 py-3 font-mono text-lg tracking-widest tabular-nums outline-none focus:border-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Use a different email
          </button>
        </form>
      )}
      {error ? (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : null}
    </div>
  );
}
