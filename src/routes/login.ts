import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { connection } from '../db/connection';
import { User } from '../data/user';

const login = express();

login.post('/login', (request: Request, response: Response) => {
  const { identifier, password, loginType } = request.body;

  if (!identifier || !password || !loginType) {
    return response.status(400).json({
      requestStatus: 'ERROR',
      loginStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
  const table = loginType === 0 ? 'usuarios' : 'estudiantes';
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

    if (result.length < 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1
      });
    }

    const codeComparison = await bcrypt.compare(code, result[0].codigo);

    if (!codeComparison) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        loginStatusCode: 1
      });
    }

    const tempUser: User = {
      idUsuario: -1,
      nombreUsuario: 'tempUser',
      nombres: '',
      pApellido: '',
      sApellido: '',
      role: 10,
      state: true
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
