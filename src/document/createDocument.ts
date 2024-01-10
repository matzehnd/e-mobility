import { Moment } from "moment";

export const createDocument = (data: {
  address: {
    firstName: string;
    lastName: string;
    street: string;
    plz: string;
    city: string;
  };
  charger: string;
  period: { from: Moment; to: Moment };
  billing: {
    
  }
}): string => {
  return "hallo";
};
