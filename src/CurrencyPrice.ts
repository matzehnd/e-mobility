export class CurrencyPrice {
  constructor(private amount: number) {}

  get value() {
    return Math.round(this.amount * 100) / 100;
  }
}
