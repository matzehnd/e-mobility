import * as fs from "fs";
import { Session } from "./Session";
import moment from "moment-timezone";
import { highTarifConfigs } from "./highTarifConfigs";

export const readSessionsFromFile = async (
  chargerId: string
): Promise<Array<Session>> => {
  const file = await fs.promises.readFile(
    `./assets/chargerSessions_${chargerId}.json`,
    "utf8"
  );
  const data = JSON.parse(file) as {
    carConnected: string;
    carDisconnected: string;
    kiloWattHours: number;
    pricePerKwhExcludingVat: number;
    pricePrKwhIncludingVat: number;
    costExcludingVat: number;
    costIncludingVat: number;
    actualDurationSeconds: number;
    firstEnergyTransferPeriodStarted: string;
    lastEnergyTransferPeriodEnd: string;
    id: number;
  }[];

  return data.map(
    (entry) =>
      new Session(
        highTarifConfigs,
        chargerId,
        moment(entry.firstEnergyTransferPeriodStarted),
        moment(entry.lastEnergyTransferPeriodEnd),
        entry.kiloWattHours,
        entry.actualDurationSeconds
      )
  );
};
