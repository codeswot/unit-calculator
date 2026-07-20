import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this calculator stores: nothing by default. Optional accounts hold only your email, and can be deleted anytime.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
      <p className="text-muted">
        The calculator works entirely in your browser. Your state and band choice
        are stored only on your device, in local storage, and never sent anywhere.
      </p>
      <p className="text-muted">
        If you choose to create an account to save your band across devices and
        track spending, the only personal data held is your email address.
        Everything else is your own band and purchase history.
      </p>
      <p className="text-muted">
        You can delete your account and all associated data at any time, in one
        click, from settings.
      </p>
    </main>
  );
}
