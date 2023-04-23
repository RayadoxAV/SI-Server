import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import connection from '../db/connection';
import { verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';
import { instanceOfAddControlRequestBody } from '../data/addControlRequest';
import { error } from 'console';

const controls = express();

controls.get('/controls', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  const query = format('SELECT * FROM controles ORDER BY idAlumno', []);

  connection.query(query, (error: MysqlError, result: any) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        queryStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      result
    });
  })
});

controls.get('/control/:type', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  const query = format('SELECT * FROM controles WHERE tipoControl = ?', [request.params.type]);
  connection.query(query, (error: MysqlError, result: any) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        queryStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      result
    });
  });
}); 

controls.post('/controls', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
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
