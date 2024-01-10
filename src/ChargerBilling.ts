import { Moment } from "moment-timezone";
import { Measurements } from "./Measurements";
import { Session } from "./Session";
import { SessionDistribution } from "./SessionDistribution";
import { CurrencyPrice } from "./CurrencyPrice";

export class ChargerBilling {
  public billingSessionDistributions: SessionDistribution[];
  public period: { from: Moment; to: Moment };
  public amountOfMonts: number;

  constructor(
    public readonly charger: string,
    period: { from: Moment; to: Moment },
    public readonly allSessions: Session[],
    public readonly allMeasurements: Measurements,
    public readonly prices: {
      HT: number;
      NT: number;
      monthly: { label: string; price: number }[];
    }
  ) {
    this.period = {
      from: period.from.startOf("month"),
      to: period.to.endOf("month"),
    };
    this.amountOfMonts = this.period.from.diff(this.period.to, "months", false);
    this.billingSessionDistributions =
      this.calculateBillingSessionDistribution();
  }

  get totalEnergy(): number {
    return this.billingSessionDistributions.reduce(
      (prev, curr) => prev + curr.session.energy,
      0
    );
  }
  get HTEnergy(): number {
    return this.billingSessionDistributions.reduce(
      (prev, curr) => prev + curr.getHTEnergy(),
      0
    );
  }

  get HTAmount(): CurrencyPrice {
    return new CurrencyPrice(this.HTEnergy * this.prices.HT);
  }
  get NTEnergy(): number {
    return this.billingSessionDistributions.reduce(
      (prev, curr) => prev + curr.getNTEnergy(),
      0
    );
  }

  get NTAmount(): CurrencyPrice {
    return new CurrencyPrice(this.NTEnergy * this.prices.NT);
  }

  private calculateBillingSessionDistribution(): SessionDistribution[] {
    const sessionDistributions = this.allSessions.map(
      (session) => new SessionDistribution(session, this.allMeasurements)
    );
    return sessionDistributions.filter(
      (sessionDistributions) =>
        sessionDistributions.session.start.isAfter(this.period.from) &&
        sessionDistributions.session.start.isBefore(this.period.to)
    );
  }
}
