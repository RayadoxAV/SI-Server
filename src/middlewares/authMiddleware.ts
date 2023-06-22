import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../data/user';

export const verifyLoggedIn = (request: Request, response: Response, nextFunction: NextFunction) => {
  const bearerHeader = request.headers['authorization'];

  if (bearerHeader) {
    const bearerToken = bearerHeader.split(' ')[1];

    jwt.verify(bearerToken, process.env.SEED!!, (error, _) => {
      if (error) {
        return response.status(401).json({
          requestStatus: 'ERROR',
          error: {
            message: 'Invalid token'
          }
        });
      }

      nextFunction();
    });
  } else {
    return response.status(403).json({
      requestStatus: 'ERROR',
      error: {
        message: 'Invalid authorization header'
      }
    });
  }
};

export const verifyTeacher = (request: Request, response: Response, nextFunction: NextFunction) => {
  const bearerHeader = request.headers['authorization'];

  const bearerToken = bearerHeader?.split(' ')[1];

  if (bearerToken) {
    const payload: any = jwt.decode(bearerToken);
    if (!payload.user) {
      return response.status(403).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Unauthorized'
        }
      });
    }

    if (payload.user.role < 5 && payload.user.status == 0) {
      nextFunction();
    } else {
      return response.status(403).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Unauthorized'
        }
      });
    }
  }
};

export const verifyUser = (request: Request, response: Response, nextFunction: NextFunction) => {
  const bearerHeader = request.headers['authorization'];

  const bearerToken = bearerHeader?.split(' ')[1];

  if (bearerToken) {
    const payload: any = jwt.decode(bearerToken);
    if (!payload.user) {
      return response.status(403).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Unauthorized'
        }
      });
    }

    if (payload.user.role < 3 && payload.user.status == 0) {
      nextFunction();
    } else {
      return response.status(403).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Unauthorized'
        }
      });
    }
  }
};

export const verifyAdmin = (request: Request, response: Response, nextFunction: NextFunction) => {
  const bearerHeader = request.headers['authorization'];

  const bearerToken = bearerHeader?.split(' ')[1];

  if (bearerToken) {
    const payload: any = jwt.decode(bearerToken);

    if (payload) {
      const user: User = payload.user;
      if ((user.role === 0 || user.role === 1) && payload.user.status == 0) {
        nextFunction();
      } else {
        return response.status(403).json({
          requestStatus: 'ERROR',
          error: {
            message: 'Unauthorized'
          }
        });
      }
    } else {
      return response.status(401).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Invalid token'
        }
      });
    }
  }
};

export const verifyRole = (request: Request, response: Response, nextFunction: NextFunction) => {
  const bearerHeader = request.headers['authorization'];

  const bearerToken = bearerHeader?.split(' ')[1];

  if (bearerToken) {
    const payload: any = jwt.decode(bearerToken);
    if (payload) {
      const user: User = payload.user;
      const role: number = request.body.declaredRole;
      if (user.role === role && user.status) {
        nextFunction();
      } else {
        return response.status(403).json({
          requestStatus: 'ERROR',
          error: {
            message: 'Unauthorized'
          }
        });
      }
    } else {
      return response.status(401).json({
        requestStatus: 'ERROR',
        error: {
          message: 'Invalid token'
        }
      });
    }
  }
}
