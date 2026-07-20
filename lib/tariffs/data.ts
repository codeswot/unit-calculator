import rawTariffs from "@/tariffs.json";
import { tariffFileSchema, type TariffFile } from "./schema";

export const tariffs: TariffFile = tariffFileSchema.parse(rawTariffs);
