import type { Band, MeterCategory, StateSlug } from "./schema";

export const stateLabels: Record<StateSlug, string> = {
  kaduna: "Kaduna",
  kebbi: "Kebbi",
  sokoto: "Sokoto",
  zamfara: "Zamfara",
  kano: "Kano",
  katsina: "Katsina",
  jigawa: "Jigawa",
  abuja: "Abuja (FCT)",
  niger: "Niger",
  kogi: "Kogi",
  nasarawa: "Nasarawa",
};

export const bandTaglines: Record<Band, string> = {
  A: "Power almost all day",
  B: "Most of the day",
  C: "Around half the day",
  D: "A few hours a day",
  E: "The fewest hours",
};

export const categoryLabels: Record<MeterCategory, string> = {
  NON_MD: "Home or small business",
  MD1: "Maximum demand (MD1)",
  MD2: "Maximum demand (MD2)",
};

export function stateLabel(state: StateSlug): string {
  return stateLabels[state];
}
