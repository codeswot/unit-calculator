import { describe, expect, it } from "vitest";
import { tariffs } from "@/lib/tariffs/data";
import {
  convert,
  costAtTill,
  valueRemaining,
  vend,
  type VendResult,
} from "./engine";
import { formatUnits } from "./money";

function vendResult(value: number, at?: Date): VendResult {
  const result = convert(
    {
      discoId: "KAEDC",
      band: "A",
      category: "NON_MD",
      direction: "MONEY_TO_UNITS",
      value,
      at,
    },
    tariffs,
  );
  if (result.direction !== "MONEY_TO_UNITS") {
    throw new Error("expected a vend result");
  }
  return result;
}

describe("vend", () => {
  it("splits a payment into energy and 7.5% VAT in kobo", () => {
    const breakdown = vend(500_000, 20_950, 0.075);
    expect(breakdown.energyKobo).toBe(465_116);
    expect(breakdown.vatKobo).toBe(34_884);
  });

  it("keeps energy plus VAT equal to the amount paid", () => {
    for (const amount of [100_000, 233_337, 500_000, 999_999]) {
      const breakdown = vend(amount, 6_263, 0.075);
      expect(breakdown.energyKobo + breakdown.vatKobo).toBe(amount);
    }
  });

  it("returns zero units for a zero or negative payment", () => {
    expect(vend(0, 20_950, 0.075).units).toBe(0);
    expect(vend(-500_000, 20_950, 0.075).units).toBe(0);
  });
});

describe("convert money to units", () => {
  it("matches a real ₦5,000 Band A KAEDC vend at 22.2 units", () => {
    const result = vendResult(5_000);
    expect(result.amountKobo).toBe(500_000);
    expect(result.energyKobo).toBe(465_116);
    expect(result.vatKobo).toBe(34_884);
    expect(formatUnits(result.units)).toBe("22.2");
  });

  it("gives ≈74.3 units for ₦5,000 on KAEDC Band B Non-MD", () => {
    const result = convert(
      {
        discoId: "KAEDC",
        band: "B",
        category: "NON_MD",
        direction: "MONEY_TO_UNITS",
        value: 5_000,
      },
      tariffs,
    );
    expect(formatUnits(result.units)).toBe("74.3");
  });

  it("guards zero and negative payments", () => {
    expect(vendResult(0).units).toBe(0);
    expect(vendResult(-1_000).units).toBe(0);
  });
});

describe("convert units to money", () => {
  it("prices a decimal quantity of units with VAT at the till", () => {
    const result = convert(
      {
        discoId: "KAEDC",
        band: "A",
        category: "NON_MD",
        direction: "UNITS_TO_MONEY",
        value: 399.5,
      },
      tariffs,
    );
    if (result.direction !== "UNITS_TO_MONEY") {
      throw new Error("expected a cost result");
    }
    expect(result.energyKobo).toBe(8_369_525);
    expect(result.totalKobo).toBe(8_997_239);
    expect(result.vatKobo).toBe(627_714);
  });

  it("keeps energy plus VAT equal to the till total", () => {
    const breakdown = costAtTill(74.3, 6_263, 0.075);
    expect(breakdown.energyKobo + breakdown.vatKobo).toBe(breakdown.totalKobo);
  });
});

describe("value of units remaining", () => {
  it("values remaining units without VAT", () => {
    expect(valueRemaining(42.3, 6_263).valueKobo).toBe(264_925);
  });
});

describe("rate resolution", () => {
  it("resolves different rates per DisCo for the same band", () => {
    const kedco = convert(
      {
        discoId: "KEDCO",
        band: "C",
        category: "NON_MD",
        direction: "MONEY_TO_UNITS",
        value: 1_000,
      },
      tariffs,
    );
    const aedc = convert(
      {
        discoId: "AEDC",
        band: "C",
        category: "NON_MD",
        direction: "MONEY_TO_UNITS",
        value: 1_000,
      },
      tariffs,
    );
    expect(kedco.rateKobo).toBe(4_757);
    expect(aedc.rateKobo).toBe(5_179);
  });

  it("throws when no schedule is effective at the given date", () => {
    expect(() => vendResult(5_000, new Date("2020-01-01"))).toThrow(
      /No active tariff schedule/,
    );
  });

  it("selects the schedule effective on the requested date", () => {
    const result = vendResult(5_000, new Date("2026-06-01"));
    expect(result.rateKobo).toBe(20_950);
  });
});
