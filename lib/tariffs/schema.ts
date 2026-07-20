import { z } from "zod";

export const discoIdSchema = z.enum(["KAEDC", "KEDCO", "AEDC"]);
export const bandSchema = z.enum(["A", "B", "C", "D", "E"]);
export const meterCategorySchema = z.enum(["NON_MD", "MD1", "MD2"]);
export const stateSlugSchema = z.enum([
  "kaduna",
  "kebbi",
  "sokoto",
  "zamfara",
  "kano",
  "katsina",
  "jigawa",
  "abuja",
  "niger",
  "kogi",
  "nasarawa",
]);

const bandRateSchema = z.object({
  minSupplyHours: z.number().int().positive(),
  rates: z.object({
    NON_MD: z.number().positive(),
    MD1: z.number().positive(),
    MD2: z.number().positive(),
  }),
});

export const tariffScheduleSchema = z.object({
  effectiveFrom: z.iso.date(),
  source: z.string().min(1),
  vatRate: z.number().min(0).max(1),
  bands: z.object({
    A: bandRateSchema,
    B: bandRateSchema,
    C: bandRateSchema,
    D: bandRateSchema,
    E: bandRateSchema,
  }),
});

export const discoSchema = z.object({
  id: discoIdSchema,
  name: z.string().min(1),
  shortName: z.string().min(1),
  states: z.array(stateSlugSchema).nonempty(),
  bandCheckerUrl: z.url(),
  lifelineRate: z.number().positive(),
  schedules: z.array(tariffScheduleSchema).nonempty(),
});

export const tariffFileSchema = z.object({
  version: z.string().min(1),
  discos: z.array(discoSchema).nonempty(),
});

export type DiscoId = z.infer<typeof discoIdSchema>;
export type Band = z.infer<typeof bandSchema>;
export type MeterCategory = z.infer<typeof meterCategorySchema>;
export type StateSlug = z.infer<typeof stateSlugSchema>;
export type BandRate = z.infer<typeof bandRateSchema>;
export type TariffSchedule = z.infer<typeof tariffScheduleSchema>;
export type Disco = z.infer<typeof discoSchema>;
export type TariffFile = z.infer<typeof tariffFileSchema>;
