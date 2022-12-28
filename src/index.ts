import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import CustomServer from './server/server';
import router from './routes/router';

import Logger, { LogType} from './util/logger';

import cors from 'cors';

function start(): void {
  Logger.log('Initializing server...', LogType.INFO);
  const server = CustomServer.instance;

  server.app.use(express.urlencoded({ extended: true }));
  server.app.use(express.json());

  server.app.use(cors({ origin: true, credentials: true }));

  server.app.use(router);

  server.startServer(() => {
    Logger.log('Server successfully initialized', LogType.SUCCESS);
  });

}

start();
