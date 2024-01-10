import * as fs from "fs";
import * as os from "os";
import { Moment } from "moment";

export const writeFile = async (
  data: Array<Array<string | number | Moment>>
) => {
  const text = data
    .map((line) =>
      line
        .map((value) => {
          if (typeof value === "number") {
            return `${value.toString()}`;
          }
          if (typeof value === "string") {
            return `"${value}"`;
          }
          return `"${value.toISOString()}"`;
        })
        .join(";")
    )
    .join(os.EOL);
  await fs.promises.writeFile("res.csv", text);
};
