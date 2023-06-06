import { MysqlError } from "mysql";
import connection from "../db/connection";
import Logger, { LogType } from "./logger";

export async function getNextRegistrationNumber(enrollmentYear?: string) {
  if (enrollmentYear) {
    try {
      const query = `SELECT matricula FROM alumnos WHERE matricula LIKE '${enrollmentYear.substring(2)}%'`;
      const results = await connection.query(query);

      let biggestYet = -1;

      for (let i = 0; i < results.length; i++) {
        const number = Number.parseInt(results[i].matricula);
        if (number > biggestYet) {
          biggestYet = number;
        }
      }

      if (biggestYet === -1) {
        return String(1).padStart(4, '0');
      }

      return `${biggestYet + 1}`.substring(4);

    } catch (error: any) {
      Logger.log(`Fatal error ${error}`, LogType.ERROR);
    }
  } else {
    try {
      const date = new Date();

      let year = '';
      if (date.getMonth() < 6) {
        year = (date.getFullYear() - 1).toString().substring(2);
      } else {
        year = date.getFullYear().toString().substring(2);
      }

      const query = `SELECT matricula FROM alumnos WHERE matricula LIKE '${year}%'`;
      const results = await connection.query(query);
      let biggestYet = -1;

      for (let i = 0; i < results.length; i++) {
        const number = Number.parseInt(results[i].matricula);
        if (number > biggestYet) {
          biggestYet = number;
        }
      }

      if (biggestYet === -1) {
        return String(1).padStart(4, '0');
      }
      return `${biggestYet + 1}`.substring(4);


    } catch (error: any) {
      Logger.log(`Fatal error ${error}`, LogType.ERROR);
    }
    // const query = `SELECT COUNT(id) as cantidad FROM alumnos WHERE matricula LIKE '${year}%'`;

    // const count = await connection.query(query);

    // const paddedNumber = String(count[0].cantidad + 1).padStart(4, '0');

    // return paddedNumber;
  }
}
