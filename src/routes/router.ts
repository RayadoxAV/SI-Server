import express, { Request, Response } from 'express';

import login from './login';
import users from './users';

const router = express();
router.use(login);
router.use(users);

router.get('/', (request: Request, response: Response) => {
  response.status(200).json({
    status: 'SUCCESS'
  })
});

export default router;
