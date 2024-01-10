import moment, { Moment } from "moment-timezone";

interface part {
  from: Moment;
  to: Moment;
  duration: number;
  isHT: boolean;
  weekday: number;
}

export class Session {
  constructor(
    private readonly highTarifConfigs: {
      weekdays: number[];
      fromHour: number;
      toHour: number;
    }[],
    public readonly chargerId: string,
    public readonly start: Moment,
    public readonly end: Moment,
    public readonly energy: number,
    public readonly duration: number
  ) {}

  public getSessionParts(): Array<part> {
    let actualHTChange: Moment | undefined = this.start;
    const parts: Array<part> = [];
    while (!!actualHTChange) {
      const nextSessionPart = this.getNexSessionPart(actualHTChange);
      parts.push({
        from: actualHTChange,
        to: nextSessionPart.nextHTChange || this.end,
        duration: nextSessionPart.duration,
        isHT: nextSessionPart.isHT,
        weekday: this.getWeekday(actualHTChange),
      });
      actualHTChange = nextSessionPart.nextHTChange;
    }
    return parts;
  }

  private getNexSessionPart(time: Moment): {
    isHT: boolean;
    duration: number;
    nextHTChange: Moment | undefined;
  } {
    const config = this.getConfig(time);
    const isHT = this.isHt(time, config);
    const nextHTChange = this.getNextHTChange(time);

    if (this.end.isBefore(nextHTChange)) {
      return {
        isHT,
        nextHTChange: undefined,
        duration: this.end.diff(time, "seconds"),
      };
    }

    return {
      isHT,
      nextHTChange,
      duration: nextHTChange.diff(time, "seconds"),
    };
  }

  private getConfig(time: Moment) {
    const weekday = this.getWeekday(time);
    const config = this.highTarifConfigs.find((config) =>
      config.weekdays.includes(weekday)
    );
    if (!config) {
      return;
    }

    return { fromHour: config.fromHour, toHour: config.toHour };
  }

  private getWeekday(time: Moment): number {
    return time.tz("Europe/Zurich").isoWeekday();
  }

  private isHt(
    time: Moment,
    config: { fromHour: number; toHour: number } | undefined
  ) {
    if (!config) {
      return false;
    }
    const hour = time.tz("Europe/Zurich").hour();

    return hour >= config.fromHour && hour < config.toHour;
  }

  private getNextHTChange(time: Moment): Moment {
    const day = moment(time).tz("Europe/Zurich").startOf("day");
    const config = this.getConfig(time);
    if (config) {
      const hour = time.tz("Europe/Zurich").hours();
      if (hour < config.fromHour) {
        return moment(day).add(config.fromHour, "hours");
      }
      if (hour >= config.fromHour && hour < config.toHour) {
        return moment(day).add(config.toHour, "hours");
      }
    }
    return moment(day).add(1, "day");
  }

  private sumParts(parts: Array<part>): {
    HT: number;
    NT: number;
    total: number;
  } {
    const HT = parts.reduce((prev, curr) => {
      if (curr.isHT) {
        return prev + curr.duration;
      }
      return prev;
    }, 0);
    const NT = parts.reduce((prev, curr) => {
      if (!curr.isHT) {
        return prev + curr.duration;
      }
      return prev;
    }, 0);

    return {
      HT,
      NT,
      total: HT + NT,
    };
  }
}
