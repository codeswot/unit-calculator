import {
  getDiscoById,
  getRateNaira,
  resolveActiveSchedule,
} from "@/lib/tariffs/resolver";
import type {
  Band,
  DiscoId,
  MeterCategory,
  TariffFile,
} from "@/lib/tariffs/schema";
import { nairaToKobo } from "./money";

export type CalcDirection = "MONEY_TO_UNITS" | "UNITS_TO_MONEY";

export type CalcRequest = {
  discoId: DiscoId;
  band: Band;
  category: MeterCategory;
  direction: CalcDirection;
  value: number;
  at?: Date;
};

export type VendResult = {
  direction: "MONEY_TO_UNITS";
  rateKobo: number;
  vatRate: number;
  amountKobo: number;
  energyKobo: number;
  vatKobo: number;
  units: number;
};

export type CostResult = {
  direction: "UNITS_TO_MONEY";
  rateKobo: number;
  vatRate: number;
  units: number;
  energyKobo: number;
  vatKobo: number;
  totalKobo: number;
};

export type CalcResult = VendResult | CostResult;

export type VendBreakdown = {
  energyKobo: number;
  vatKobo: number;
  units: number;
};

export type CostBreakdown = {
  energyKobo: number;
  vatKobo: number;
  totalKobo: number;
};

export type ValueBreakdown = {
  valueKobo: number;
};

function positiveOrZero(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function vend(
  amountKobo: number,
  rateKobo: number,
  vatRate: number,
): VendBreakdown {
  const amount = positiveOrZero(amountKobo);
  const energyKobo = Math.round(amount / (1 + vatRate));
  const vatKobo = amount - energyKobo;
  const units = rateKobo > 0 ? energyKobo / rateKobo : 0;
  return { energyKobo, vatKobo, units };
}

export function costAtTill(
  units: number,
  rateKobo: number,
  vatRate: number,
): CostBreakdown {
  const quantity = positiveOrZero(units);
  const energyKobo = Math.round(quantity * rateKobo);
  const totalKobo = Math.round(quantity * rateKobo * (1 + vatRate));
  const vatKobo = totalKobo - energyKobo;
  return { energyKobo, vatKobo, totalKobo };
}

export function valueRemaining(
  units: number,
  rateKobo: number,
): ValueBreakdown {
  const quantity = positiveOrZero(units);
  return { valueKobo: Math.round(quantity * rateKobo) };
}

export function convert(request: CalcRequest, file: TariffFile): CalcResult {
  const disco = getDiscoById(file, request.discoId);
  const schedule = resolveActiveSchedule(disco, request.at);
  const rateKobo = nairaToKobo(
    getRateNaira(schedule, request.band, request.category),
  );
  const vatRate = schedule.vatRate;

  if (request.direction === "MONEY_TO_UNITS") {
    const amountKobo = nairaToKobo(positiveOrZero(request.value));
    const breakdown = vend(amountKobo, rateKobo, vatRate);
    return {
      direction: "MONEY_TO_UNITS",
      rateKobo,
      vatRate,
      amountKobo,
      energyKobo: breakdown.energyKobo,
      vatKobo: breakdown.vatKobo,
      units: breakdown.units,
    };
  }

  const units = positiveOrZero(request.value);
  const breakdown = costAtTill(units, rateKobo, vatRate);
  return {
    direction: "UNITS_TO_MONEY",
    rateKobo,
    vatRate,
    units,
    energyKobo: breakdown.energyKobo,
    vatKobo: breakdown.vatKobo,
    totalKobo: breakdown.totalKobo,
  };
}
