export const toWeekdayString = (weekday: number) => {
  if (weekday === 1) {
    return "Montag";
  }
  if (weekday === 2) {
    return "Dienstag";
  }
  if (weekday === 3) {
    return "Mittwoch";
  }
  if (weekday === 4) {
    return "Donnerstag";
  }
  if (weekday === 5) {
    return "Freitag";
  }
  if (weekday === 6) {
    return "Samstag";
  }
  if (weekday === 7) {
    return "Sonntag";
  }
  console.log("weekday :>> ", weekday);
  throw new Error();
};
