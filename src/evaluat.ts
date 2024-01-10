import { SessionDistribution } from "./SessionDistribution";
import { readMeasurementsFromFile } from "./readMeasurementsFromFile";
import { readSessionsFromFile } from "./readSessionsFromFile";
import { toWeekdayString } from "./toWeekdayString";
import { writeFile } from "./writeFile";

export const evaluate = async (chargerId: string) => {
  const sessions = await readSessionsFromFile(chargerId);
  const measurements = await readMeasurementsFromFile(chargerId);

  const sessionDistributions = sessions.map(
    (session) => new SessionDistribution(session, measurements)
  );

  const totHT = sessionDistributions.reduce(
    (prev, curr) => prev + curr.getHTEnergy(),
    0
  );
  const totNT = sessionDistributions.reduce(
    (prev, curr) => prev + curr.getNTEnergy(),
    0
  );
  const tot = sessionDistributions.reduce(
    (prev, curr) => prev + curr.session.energy,
    0
  );

  const data = sessionDistributions.map((dist) => [
    [
      dist.session.start.tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss"),
      dist.session.end.tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss"),
      dist.session.energy,
      dist.getHTEnergy(),
      dist.getNTEnergy(),
    ],
    ...dist
      .getDistParts()
      .map((part) => [
        part.from.tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss"),
        part.to.tz("Europe/Zurich").format("YYYY-MM-DD HH:mm:ss"),
        "",
        part.isHT ? part.energy : "",
        part.isHT ? "" : part.energy,
        toWeekdayString(part.weekday),
      ]),
    ["", "", "Kontrolle: Total - HT - NT", "HT (kWh)", "NT (kWh)"],
    [
      "",
      "",
      dist.getDistParts().reduce((prev, curr) => prev + curr.energy, 0) -
        dist.session.energy,
      dist
        .getDistParts()
        .filter((part) => part.isHT)
        .reduce((prev, curr) => prev + curr.energy, 0),
      dist
        .getDistParts()
        .filter((part) => !part.isHT)
        .reduce((prev, curr) => prev + curr.energy, 0),
    ],
    [""],
  ]);
  const res = [
    ...data.flat(1),
    ["", "", "Total (kWh)", "HT (kWh)", "NT (kWh)"],
    ["", "", tot, totHT, totNT],
    [
      "",
      "",
      "Kontrolle: Total - NT - HT (kWh)",
      "HT * 0.1678 * 0.1701 => CHF",
      "NT * 0.1281 * 0.0643 => CHF",
    ],
    [
      "",
      "",
      totHT + totNT - tot,
      totHT * (0.1678 + 0.1701),
      totNT * (0.1281 + 0.0643),
    ],
  ];
  await writeFile(res);
};
