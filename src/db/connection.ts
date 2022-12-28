import { Connection, createConnection, MysqlError } from 'mysql';
import Logger, { LogType } from '../util/logger';

function connect(): Connection {
  const connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.on('connection', (_: any) => {
    Logger.log('Database: Connection successful', LogType.SUCCESS);
  });

  connection.on('error', (error: any) => {
    Logger.log(`Database: ${error}`, LogType.ERROR);

    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      connect();
    } else if (error.code === 'ECONNRESET') {
      connect();
    } else {
      throw new Error(`Database: ${error.message} - ${error.code}`);
    }
  });

  return connection;
}

export const connection = connect();

