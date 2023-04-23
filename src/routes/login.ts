import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import connection from '../db/connection';
import { User } from '../data/user';

const login = express();

login.post('/login', (request: Request, response: Response) => {
  const { identifier, password, loginType } = request.body;
  if (!identifier || !password || loginType == undefined) {
    return response.status(400).json({
      requestStatus: 'ERROR',
      loginStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
  const table = loginType === 0 ? 'usuarios' : 'alumnos';
  const parameter = loginType === 0 ? 'nombreUsuario' : 'email';

  const query = format(`SELECT * FROM \`${table}\` WHERE \`${parameter}\` = ? `, [identifier]);

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

    if (result.length < 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1
      });
    }

    if (result[0].estado === 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1
      });
    }

    const passwordComparison = await bcrypt.compare(password, result[0].password);
  
    if (!passwordComparison) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1
      });
    } 

    const user: User = {
      idUsuario: result[0].idUsuario,
      nombreUsuario: result[0].nombreUsuario,
      nombres: result[0].nombres,
      pApellido: result[0].pApellido,
      sApellido: result[0].sApellido,
      role: result[0].role,
      estado: result[0].estado
    };

    const token = jwt.sign({
      user
    }, process.env.SEED!!, { expiresIn: process.env.TOKEN_EXPIRATION!! })

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      loginStatusCode: 0,
      user,
      token
    });
  });
});

login.post('/confirm_code', async (request: Request, response: Response) => {
  const { code } = request.body;
  
  if (!code) {
    return response.status(400).json({
      requestStatus: 'ERROR',
      loginStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }

  const query = format('SELECT * FROM `codigos`', []);

  connection.query(query, async (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        loginStatusCode: 1,
        error: {
          message: 'Internal server error',
          code: 500,
          type: 'intern'
        }
      });
    }

    const codeComparison = await bcrypt.compare(code, result[0].codigo);

    if (!codeComparison) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1,
        error: {
          message: 'Invalid access code',
          code: 200,
          type: 'extern'
        }
      });
    }

    const tempUser: User = {
      idUsuario: -1,
      nombreUsuario: 'tempUser',
      nombres: '',
      pApellido: '',
      sApellido: '',
      role: 10,
      estado: 0
    };

    const token = jwt.sign({
      tempUser
    }, process.env.SEED!!, { expiresIn: '4h' });
    
    response.status(200).json({
      requestStatus: 'SUCCESS',
      loginStatusCode: 0,
      token
    });
  });
});

export default login;
