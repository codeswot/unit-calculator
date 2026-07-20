import { nairaToKobo } from "@/lib/calculator/money";
import { stateLabels } from "./labels";
import {
  getDiscoByState,
  listStates,
  resolveActiveSchedule,
} from "./resolver";
import {
  bandSchema,
  type Band,
  type DiscoId,
  type StateSlug,
  type TariffFile,
} from "./schema";

export type BandRateView = {
  band: Band;
  minSupplyHours: number;
  rateKobo: number;
};

export type StateRates = {
  state: StateSlug;
  stateLabel: string;
  discoId: DiscoId;
  discoName: string;
  discoShortName: string;
  bandCheckerUrl: string;
  vatRate: number;
  bands: BandRateView[];
};

export const bandOrder: Band[] = bandSchema.options;

export function buildStateRates(
  file: TariffFile,
  state: StateSlug,
  at: Date = new Date(),
): StateRates {
  const disco = getDiscoByState(file, state);
  const schedule = resolveActiveSchedule(disco, at);
  const bands = bandOrder.map((band) => ({
    band,
    minSupplyHours: schedule.bands[band].minSupplyHours,
    rateKobo: nairaToKobo(schedule.bands[band].rates.NON_MD),
  }));

  return {
    state,
    stateLabel: stateLabels[state],
    discoId: disco.id,
    discoName: disco.name,
    discoShortName: disco.shortName,
    bandCheckerUrl: disco.bandCheckerUrl,
    vatRate: schedule.vatRate,
    bands,
  };
}

export function buildAllStateRates(
  file: TariffFile,
  at: Date = new Date(),
): StateRates[] {
  return listStates(file).map((state) => buildStateRates(file, state, at));
}

export function findBandRate(
  rates: StateRates,
  band: Band,
): BandRateView {
  const match = rates.bands.find((entry) => entry.band === band);
  if (!match) {
    throw new Error(`Band ${band} missing from ${rates.state}`);
  }
  return match;
}
