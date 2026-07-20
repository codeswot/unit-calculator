import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How electricity bands, per-unit rates, and 7.5% VAT decide how many units your naira buys in Nigeria.",
  alternates: { canonical: "/how-it-works" },
};

const faqs = [
  {
    question: "How much is 1 unit of electricity in Nigeria?",
    answer:
      "It depends on your band. Band A is ₦209.50 per unit; Bands B to E are cheaper and vary by DisCo. Pick your state to see your exact rate.",
  },
  {
    question: "Why did I get fewer units than I expected?",
    answer:
      "Vending adds 7.5% VAT, which is removed before units are calculated. Debt recovery and meter service charges can reduce it further.",
  },
  {
    question: "What does my band mean?",
    answer:
      "Your band sets both your minimum daily supply hours and your per-unit rate. Band A gets the most hours; Band E the fewest.",
  },
  {
    question: "Is this calculator free?",
    answer: "Yes. It is completely free, with no login required, and open source.",
  },
];

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function HowItWorksPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="text-lg text-muted">
          Your bill is decided by two things: your band and the 7.5% VAT added at
          the vending point.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Bands</h2>
        <p className="text-muted">
          Every meter is on a band from A to E. The band sets your minimum daily
          supply hours and the price you pay per unit (kWh). Band A homes get 20+
          hours a day at a flat premium rate; lower bands get fewer hours at lower
          rates.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">The VAT math</h2>
        <p className="text-muted">
          When you buy units, 7.5% VAT is taken out first, then the rest is
          converted to units at your rate:
        </p>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 font-mono text-sm text-muted">
          energy = amount ÷ 1.075
          <br />
          units = energy ÷ rate
        </div>
        <p className="text-muted">
          So ₦5,000 on Band A (₦209.50/unit) is ₦348.84 VAT + ₦4,651.16 energy =
          about 22.2 units.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Why receipt units differ
        </h2>
        <p className="text-muted">
          Estimates here cover VAT only. Your actual token may be lower because of
          debt recovery, fixed meter maintenance charges, or a rate change since
          this page was updated. Always treat the result as an estimate.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Frequently asked
        </h2>
        <dl className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-1">
              <dt className="font-medium">{faq.question}</dt>
              <dd className="text-muted">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <JsonLd data={faqPage} />
    </main>
  );
}
