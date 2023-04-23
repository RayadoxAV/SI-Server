import { MysqlError } from "mysql";
import connection from "../db/connection";

export async function getNextRegistrationNumber(enrollmentYear?: string) {
  if (enrollmentYear) {
    const query = `SELECT COUNT(id) as cantidad FROM alumnos WHERE matricula LIKE '${enrollmentYear.substring(2)}%'`;

    const count = await connection.query(query);

    const paddedNumber = String(count[0].cantidad + 1).padStart(4, '0');

    return paddedNumber;
  } else {
    const date = new Date();

    let year = '';
    if (date.getMonth() < 6) {
      year = (date.getFullYear() - 1).toString().substring(2);    
    } else {
      year = date.getFullYear().toString().substring(2);    
    }


    const query = `SELECT COUNT(id) as cantidad FROM alumnos WHERE matricula LIKE '${year}%'`;

    const count = await connection.query(query);

    const paddedNumber = String(count[0].cantidad + 1).padStart(4, '0');

    return paddedNumber;
  }
}
