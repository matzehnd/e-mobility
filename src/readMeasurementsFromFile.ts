import * as fs from "fs";
import moment from "moment-timezone";
import { Measurement } from "./Measurement";
import { Measurements } from "./Measurements";

export const readMeasurementsFromFile = async (
  chargerId: string
): Promise<Measurements> => {
  const file = await fs.promises.readFile(
    `./assets/chargerEnergy_${chargerId}.json`,
    "utf8"
  );
  const data = JSON.parse(file) as {
    measurements: {
      value: number;
      measuredAt: string;
    }[];
  };

  const measurements = data.measurements.map(
    (entry) => new Measurement(entry.value, moment(entry.measuredAt))
  );
  return new Measurements(measurements);
};
