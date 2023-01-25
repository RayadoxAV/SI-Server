import express, { Request, response, Response } from 'express';
import bcrypt from 'bcrypt';
import { format, MysqlError } from 'mysql';
import { instanceOfRegisterUserRequestBody } from '../data/registerUserRequest';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn } from '../middlewares/authMiddleware';

const users = express();

users.get('/users', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  const query = 'SELECT idUsuario, nombreUsuario, nombres, pApellido, sApellido, role, state FROM usuarios;';

  connection.query(query, async (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        loginStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      users: result
    })
  });
});

users.get('/user/:id', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  // const query = ?';

  connection.query(format('SELECT idUsuario, nombreUsuario, nombres, pApellido, sApellido, role, state FROM usuarios WHERE idUsuario = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        loginStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    if (result.length < 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        queryStatusCode: 1,
        error: {
          message: 'No user found for given id'
        }
      })
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      user: result[0]
    })
  });
});

users.post('/users', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  console.log(request.body);

  if (instanceOfRegisterUserRequestBody(request.body)) {
    const body = request.body;
    const password = bcrypt.hashSync(body.password, 10);
    connection.query(format(`INSERT INTO usuarios VALUES (NULL, ?, ?, ?, ?, ?, ?, 1);`, [body.nombreUsuario, password, body.nombres, body.pApellido, body.sApellido, body.role]), (error: MysqlError, result: any[]) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }
    });

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      registerStatusCode: 0
    });
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

users.delete('/user/:id',verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  connection.query(format('DELETE FROM usuarios WHERE idUsuario = ?', [request.params.id]), (error: MysqlError, result: any) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        deleteStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    if (result.affectedRows === 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        deleteStatusCode: 0
      });
    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        deleteStatusCode: 1
      });
    }
  });
});

export default users;
