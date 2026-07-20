import type {
  Band,
  BandRate,
  Disco,
  DiscoId,
  MeterCategory,
  StateSlug,
  TariffFile,
  TariffSchedule,
} from "./schema";

export function listStates(file: TariffFile): StateSlug[] {
  return file.discos.flatMap((disco) => disco.states);
}

export function findDiscoByState(
  file: TariffFile,
  state: StateSlug,
): Disco | undefined {
  return file.discos.find((disco) => disco.states.includes(state));
}

export function getDiscoByState(file: TariffFile, state: StateSlug): Disco {
  const disco = findDiscoByState(file, state);
  if (!disco) {
    throw new Error(`No DisCo covers state "${state}"`);
  }
  return disco;
}

export function getDiscoById(file: TariffFile, id: DiscoId): Disco {
  const disco = file.discos.find((candidate) => candidate.id === id);
  if (!disco) {
    throw new Error(`No DisCo with id "${id}"`);
  }
  return disco;
}

export function resolveActiveSchedule(
  disco: Disco,
  at: Date = new Date(),
): TariffSchedule {
  const active = disco.schedules
    .filter((schedule) => Date.parse(schedule.effectiveFrom) <= at.getTime())
    .sort((a, b) => Date.parse(b.effectiveFrom) - Date.parse(a.effectiveFrom))
    .at(0);
  if (!active) {
    throw new Error(
      `No active tariff schedule for ${disco.id} at ${at.toISOString()}`,
    );
  }
  return active;
}

export function getBandRate(schedule: TariffSchedule, band: Band): BandRate {
  return schedule.bands[band];
}

export function getRateNaira(
  schedule: TariffSchedule,
  band: Band,
  category: MeterCategory,
): number {
  return schedule.bands[band].rates[category];
}
