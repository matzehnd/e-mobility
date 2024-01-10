import { Moment } from "moment";

export class Measurement {
  constructor(public readonly value: number, public readonly at: Moment) {}
}
