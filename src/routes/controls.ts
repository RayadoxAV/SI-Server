import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import connection from '../db/connection';
import { verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';
import { instanceOfAddControlRequestBody } from '../data/addControlRequest';
import { error } from 'console';
import CustomServer from '../server/server';
import { Control } from '../data/control';

const controls = express();

controls.get('/controls', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getControls()
  });

  // const query = format('SELECT * FROM controles ORDER BY idAlumno', []);

  // connection.query(query, (error: MysqlError, result: any) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }

  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     result
  //   });
  // });
});

controls.get('/control/:type', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  // return response.status(500).json({});

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getControlsByType(Number.parseInt(request.params.type))
  });

  // const query = format('SELECT * FROM controles WHERE tipoControl = ?', [request.params.type]);
  // connection.query(query, (error: MysqlError, result: any) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }

  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     result
  //   });
  // });
}); 

controls.post('/controls', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  // return response.status(500).json({});

  const body = request.body;

  if (instanceOfAddControlRequestBody(body)) {
    const query = format('INSERT INTO controles VALUES (NULL, ?, ?);', [body.idAlumno, body.controlType]);
    connection.query(query, (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }

      if (result.affectedRows === 1) {

        const newControl: Control = {
          id: result.insertId,
          idAlumno: body.idAlumno,
          tipo: body.controlType
        };

        CustomServer.instance.getControls().push(newControl);
        CustomServer.instance.ioServer.emit('add-element', { type: 1, list: CustomServer.instance.getControls() });

        return response.status(200).json({
          requestStatus: 'SUCCESS',
          registerStatusCode: 0,
          insertId: result.insertId
        });
      } else {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }
    })
  } else {
    return response.status(400).json({
      requestStatus: 'ERROR',
      registerStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
});

export default controls;
