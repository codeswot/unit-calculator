"use client";

import { useMemo, useState } from "react";
import {
  costAtTill,
  vend,
  type CalcDirection,
} from "@/lib/calculator/engine";
import { formatNaira, formatUnits, nairaToKobo } from "@/lib/calculator/money";

type CalculatorProps = {
  rateKobo: number;
  vatRate: number;
};

const presets = [1000, 2000, 5000, 10000];

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function Calculator({ rateKobo, vatRate }: CalculatorProps) {
  const [direction, setDirection] = useState<CalcDirection>("MONEY_TO_UNITS");
  const [amountInput, setAmountInput] = useState("");
  const [unitsInput, setUnitsInput] = useState("");

  const rateLabel = `${formatNaira(rateKobo)} / unit`;
  const raw = direction === "MONEY_TO_UNITS" ? amountInput : unitsInput;
  const value = parseAmount(raw);

  const vendResult = useMemo(
    () => vend(nairaToKobo(value), rateKobo, vatRate),
    [value, rateKobo, vatRate],
  );
  const costResult = useMemo(
    () => costAtTill(value, rateKobo, vatRate),
    [value, rateKobo, vatRate],
  );

  const isMoney = direction === "MONEY_TO_UNITS";
  const hasResult = value > 0;

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Conversion direction"
        className="flex rounded-full border border-border bg-subtle p-1"
      >
        <DirectionTab
          active={isMoney}
          label="Naira → Units"
          onClick={() => setDirection("MONEY_TO_UNITS")}
        />
        <DirectionTab
          active={!isMoney}
          label="Units → Naira"
          onClick={() => setDirection("UNITS_TO_MONEY")}
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4 focus-within:border-foreground">
        {isMoney ? (
          <span className="text-2xl font-medium text-muted">₦</span>
        ) : null}
        <input
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          aria-label={isMoney ? "Amount in naira" : "Number of units"}
          value={raw}
          onChange={(event) => {
            const next = event.target.value;
            if (isMoney) {
              setAmountInput(next);
            } else {
              setUnitsInput(next);
            }
          }}
          className="w-full bg-transparent font-mono text-3xl tracking-tight tabular-nums outline-none placeholder:text-border"
        />
        {isMoney ? null : (
          <span className="text-lg font-medium text-muted">units</span>
        )}
      </label>

      {isMoney ? (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmountInput(String(preset))}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              ₦{preset.toLocaleString("en-NG")}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rounded-2xl bg-foreground px-6 py-8 text-background">
        <p className="text-xs font-medium uppercase tracking-widest text-background/60">
          {isMoney ? "You get" : "You pay"}
        </p>
        <p className="mt-2 font-mono text-5xl font-semibold tracking-tight tabular-nums">
          {isMoney
            ? `${formatUnits(vendResult.units)}`
            : formatNaira(costResult.totalKobo)}
          {isMoney ? (
            <span className="ml-2 text-2xl font-normal text-background/70">
              units
            </span>
          ) : null}
        </p>
        <p className="mt-4 text-sm text-background/70">
          {!hasResult
            ? `At ${rateLabel}`
            : isMoney
              ? `${formatNaira(vendResult.energyKobo)} energy + ${formatNaira(vendResult.vatKobo)} VAT · ${rateLabel}`
              : `${formatNaira(costResult.energyKobo)} energy + ${formatNaira(costResult.vatKobo)} VAT · ${rateLabel}`}
        </p>
      </div>
    </div>
  );
}

type DirectionTabProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function DirectionTab({ active, label, onClick }: DirectionTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-surface text-foreground shadow-sm"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
