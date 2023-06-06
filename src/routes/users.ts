import express, { Request, response, Response } from 'express';
import bcrypt from 'bcrypt';
import { format, MysqlError } from 'mysql';
import { instanceOfRegisterUserRequestBody } from '../data/registerUserRequest';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn } from '../middlewares/authMiddleware';
import CustomServer from '../server/server';
import { User } from '../data/user';

const users = express();

users.get('/users', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getUsers()
  });
  // const query = 'SELECT idUsuario, nombreUsuario, nombres, pApellido, sApellido, role, estado FROM usuarios;';

  // connection.query(query, async (error: MysqlError, result: any[]) => {
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
  //   })
  // });
});

users.get('/user/:id', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getUserById(Number.parseInt(request.params.id))
  });

  // connection.query(format('SELECT idUsuario, nombreUsuario, nombres, pApellido, sApellido, role, estado FROM usuarios WHERE idUsuario = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }

  //   if (result.length < 1) {
  //     return response.status(200).json({
  //       requestStatus: 'SUCCESS',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'No user found for given id'
  //       }
  //     })
  //   }

  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     user: result[0]
  //   })
  // });
});

users.post('/users', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {

  if (instanceOfRegisterUserRequestBody(request.body)) {
    const body = request.body;
    const password = bcrypt.hashSync(body.password, 10);
    connection.query(format(`INSERT INTO usuarios VALUES (0, ?, ?, ?, ?, ?, ?, 0);`, [body.nombreUsuario, password, body.nombres, body.pApellido, body.sApellido, body.role]), (error: MysqlError, result: any) => {
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

        const newUser: User = {
          idUsuario: result.insertId,
          nombreUsuario: body.nombreUsuario,
          nombres: body.nombres,
          pApellido: body.pApellido,
          sApellido: body.sApellido,
          role: body.role,
          status: 0
        };

        CustomServer.instance.getUsers().push(newUser);

        CustomServer.instance.ioServer.emit('add-element', { type: 3, list: CustomServer.instance.getUsers() });

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

users.delete('/user/:id', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {

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

      const index = CustomServer.instance.deleteUserById(Number.parseInt(request.params.id));

      CustomServer.instance.ioServer.emit('remove-element', { type: 3, index, list: CustomServer.instance.getUsers() });

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

users.delete('/users/', verifyLoggedIn, verifyAdmin, async (request: Request, response: Response) => {

  const ids = request.body.ids;
  if (ids && Array.isArray(ids)) {
    ids.sort((a: number, b: number) => a - b);

    const indexes: Number[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];

      try {
        await connection.query(format('DELETE FROM usuarios WHERE idUsuario = ?', [id]));

        CustomServer.instance.deleteUserById(id);

      } catch (error: any) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          deleteStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }
    }

    CustomServer.instance.ioServer.emit('remove-elements', { type: 3, list: CustomServer.instance.getUsers() });

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      deleteStatusCode: 0
    });

  } else {
    return response.status(400).json({
      requestStatus: 'ERROR',
      deleteStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
});

export default users;
