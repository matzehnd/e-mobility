import { Moment } from "moment";
import { Measurements } from "./Measurements";
import { Session } from "./Session";

interface distPart {
  from: Moment;
  to: Moment;
  duration: number;
  isHT: boolean;
  weekday: number;
  energy: number;
}

export class SessionDistribution {
  private distParts: distPart[] | undefined;
  constructor(
    public readonly session: Session,
    public readonly measurements: Measurements
  ) {}

  public getHTEnergy(): number {
    const htParts = this.getDistParts().filter((part) => part.isHT);
    return htParts.reduce((prev, curr) => prev + curr.energy, 0);
  }

  public getNTEnergy(): number {
    const htParts = this.getDistParts().filter((part) => !part.isHT);
    return htParts.reduce((prev, curr) => prev + curr.energy, 0);
  }

  public getDistParts(): Array<distPart> {
    if (!this.distParts) {
      this.calcDistParts();
    }
    if (!this.distParts) {
      throw new Error("distParts not yet calculated");
    }
    return this.distParts;
  }

  public calcDistParts() {
    if (this.distParts) {
      return;
    }
    const sessionParts = this.session.getSessionParts();
    let billedEnergy = 0;
    const distParts = sessionParts.map((part) => {
      const unBilledEnergy = this.session.energy - billedEnergy;
      const energy = this.measurements.billEnergy(
        part.from,
        part.to,
        unBilledEnergy
      );
      billedEnergy += energy;
      return {
        ...part,
        energy,
      };
    });
    const unBilledEnergy = this.session.energy - billedEnergy;
    if (unBilledEnergy > 0) {
      const billedDistParts = distParts
        .filter((part) => part.energy > 0)
        .sort((a, b) => b.from.diff(a.from));
      if (billedDistParts.length > 0) {
        billedDistParts[0].energy += unBilledEnergy;
      }
    }
    this.distParts = distParts.filter((part) => part.energy > 0);
  }
}
