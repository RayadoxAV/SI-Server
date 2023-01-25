import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const misc = express();

misc.post('/validate_token', (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _ : string | jwt.JwtPayload | undefined) => {
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

misc.post('/validate_user_token' , (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _ : string | jwt.JwtPayload | undefined) => {
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

export default misc;
