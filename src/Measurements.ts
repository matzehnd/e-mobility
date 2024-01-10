import moment, { Moment } from "moment";
import { Measurement } from "./Measurement";

export class Measurements {
  private usages: {
    from: Moment;
    to: Moment;
    totalEnergy: number;
    unBilledEnergy: number;
  }[] = [];

  constructor(measurements: Array<Measurement>) {
    const sorted = measurements.sort((a, b) => a.at.diff(b.at));
    const amountOfMeasurements = sorted.length;
    for (const [index, measurement] of sorted.entries()) {
      if (index >= amountOfMeasurements - 1) {
        break;
      }
      const nextMeasurement = sorted[index + 1];
      const energyToNextMeasurement = nextMeasurement.value - measurement.value;
      this.usages.push({
        from: measurement.at.startOf("hour"),
        to: nextMeasurement.at.startOf("hour"),
        unBilledEnergy: energyToNextMeasurement,
        totalEnergy: energyToNextMeasurement,
      });
    }
    if (this.usages.length !== amountOfMeasurements - 1) {
      throw new Error("unable to build energy");
    }
  }

  public billEnergy(from: Moment, to: Moment, energy: number) {
    const usages = this.usages.filter(
      (usage) => from.isBefore(usage.to) && to.isAfter(usage.from)
    );
    let billedEnergy = 0;
    for (const usage of usages) {
      const unBilledEnergy = energy - billedEnergy;
      if (unBilledEnergy > usage.unBilledEnergy) {
        billedEnergy += usage.unBilledEnergy;
        usage.unBilledEnergy = 0;
      } else {
        billedEnergy += unBilledEnergy;
        usage.unBilledEnergy -= unBilledEnergy;
      }
    }
    return billedEnergy;
  }
}
