export const KOBO_PER_NAIRA = 100;

export function nairaToKobo(naira: number): number {
  return Math.round(naira * KOBO_PER_NAIRA);
}

export function koboToNaira(kobo: number): number {
  return kobo / KOBO_PER_NAIRA;
}

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatNaira(kobo: number): string {
  return nairaFormatter.format(koboToNaira(kobo));
}

export function formatUnits(units: number): string {
  return units.toLocaleString("en-NG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
