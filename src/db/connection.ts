import { createPool, Pool } from 'mysql';


let connection: any;

let intervalID: NodeJS.Timer;

function connect(): void {
  connection = createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.on('connection', (_: any) => {
    console.log('Database - Info: Connection succesful');
  });

  function keepAlive() {
    connection.getConnection((error: any, conn: any) => {
      if (error) {
        console.log('Database - Error: ', error.code);
        // switch (error.code) {
        //   case 'PROTOCOL_CONNECTION_LOST': {
        //     console.log('protocol_conn_lost');
        //     break;
        //   }
        //   case 'ECONNRESET': {
        //     console.log('econnreset');
        //     break;
        //   }
        //   case 'ECONNREFUSED': {
        //     console.log('econnrefused');
        //     break;
        //   }
        //   default: {
        //     console.log(error.code);
        //     break;
        //   }
        // }
        return;
      }
      conn.ping();
      conn.release();
    });
  }

  intervalID = setInterval(keepAlive, 5000);

}

connect();

export default connection;
