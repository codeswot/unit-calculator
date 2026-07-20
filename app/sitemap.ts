import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { tariffs } from "@/lib/tariffs/data";
import { listStates } from "@/lib/tariffs/resolver";
import { bandOrder } from "@/lib/tariffs/view";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const states = listStates(tariffs);
  const paths = [
    "",
    "/how-it-works",
    "/about",
    "/privacy",
    ...states.map((state) => `/${state}`),
    ...states.flatMap((state) =>
      bandOrder.map((band) => `/${state}/band/${band.toLowerCase()}`),
    ),
  ];

  return paths.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
  }));
}
