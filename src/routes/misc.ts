import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAdmin, verifyLoggedIn } from '../middlewares/authMiddleware';
import CustomServer from '../server/server';
import { format } from 'mysql';
import Logger, { LogType } from '../util/logger';
import connection from '../db/connection';

const misc = express();

misc.post('/validate_token', (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _: string | jwt.JwtPayload | undefined) => {
    if (error) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Invalid token'
        }
      });
    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: true
      });
    }
  });
});

misc.post('/validate_user_token', (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _: string | jwt.JwtPayload | undefined) => {
    if (error) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Invalid token'
        }
      });
    }

    const payload: any = jwt.decode(token);

    if (!payload.user) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Unauthorized'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      isTokenValid: true
    });
  });
});

misc.post('/promote_all', verifyLoggedIn, verifyAdmin, async (request: Request, response: Response) => {
  const students = CustomServer.instance.getStudents();
  for (let i = 0; i < students.length; i++) {
    const currentStudent = students[i];

    if (currentStudent.informacion.grado < 3) {
      const grado = currentStudent.informacion.grado + 1;

      const informacion = { ...currentStudent.informacion };
      informacion.grado = grado;

      const query = format('UPDATE alumnos SET informacion = ? WHERE id = ?', [JSON.stringify(informacion), currentStudent.id,]);

      try {
        await connection.query(query);
        currentStudent.informacion.grado = grado;
      } catch (error: any) {
        Logger.log(`Fatal error ${error}`, LogType.ERROR);
        return response.status(200).json({
          requestStatus: 'ERROR',
          actionStatusCode: 1
        });
      }

    } else {
      const query = format('UPDATE alumnos SET estado = 1 WHERE id = ?', [currentStudent.id]);
      try {
        await connection.query(query);
        currentStudent.estado = 1;
      } catch (error: any) {
        Logger.log(`Fatal error ${error}`, LogType.ERROR);
        return response.status(200).json({
          requestStatus: 'ERROR',
          actionStatusCode: 1
        });
      }
    }
  }

  CustomServer.instance.ioServer.emit('update-element', { type: 0, list: CustomServer.instance.getStudents() });

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    actionStatusCode: 0
  });
});

export default misc;
