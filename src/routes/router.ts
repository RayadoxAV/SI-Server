import express, { Request, Response } from 'express';

import login from './login';
import students from './students';
import users from './users';
import misc from './misc';

const router = express();
router.use(login);
router.use(students);
router.use(users);
router.use(misc);

router.get('/', (request: Request, response: Response) => {
  response.status(200).json({
    requestStatus: 'SUCCESS'
  });
});

export default router;
