import express, { Request, Response } from 'express';

import login from './login';

import students from './students';
import documents from './documents';
import users from './users';
import misc from './misc';
import controls from './controls';

const router = express();
router.use(login);

router.use(students);
router.use(controls);
router.use(documents);
router.use(users);
router.use(misc);

router.get('/', (request: Request, response: Response) => {
  response.status(200).json({
    requestStatus: 'SUCCESS'
  });
});

export default router;
