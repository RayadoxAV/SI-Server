import express, { Request, Response } from 'express';
import { verifyLoggedIn } from '../middlewares/authMiddleware';

const users = express();

users.get('/users', verifyLoggedIn, (request: Request, response: Response) => {
  return response.status(200).json({
    requestStatus: 'SUCCESS'
  });
});

export default users;
