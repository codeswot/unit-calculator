import { HomeCalculator } from "@/components/home-calculator";
import { JsonLd } from "@/components/json-ld";
import { SITE } from "@/lib/site";
import { tariffs } from "@/lib/tariffs/data";
import { buildAllStateRates } from "@/lib/tariffs/view";

const webApplication = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.title,
  url: SITE.url,
  description: SITE.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
  author: {
    "@type": "Person",
    name: "Mubarak (codeswot)",
    url: SITE.author.url,
  },
};

export default function Home() {
  const allRates = buildAllStateRates(tariffs);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          How much electricity does your naira buy?
        </h1>
        <p className="text-lg text-muted">
          Pick your state and band, then convert naira to units instantly. Free,
          instant, and no login needed.
        </p>
      </section>
      <HomeCalculator allRates={allRates} />
      <JsonLd data={webApplication} />
    </main>
  );
}
