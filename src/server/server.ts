import express from 'express';
import { createServer, Server } from 'http';

import { Student } from '../data/student';
import { Control } from '../data/control';
import { Document } from '../data/document';
import { User } from '../data/user';

class CustomServer { 
  private static _instance: CustomServer;

  public app: express.Application;
  public port: number;

  private httpServer: Server;

  // Server data
  private students: Student[];
  private controls: Control[];
  private documents: Document[];
  private users: User[];

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;

    this.httpServer = createServer(this.app);

    this.students = [];
    this.controls = [];
    this.documents = [];
    this.users = [];
  }

  public static get instance(): CustomServer {
    return this._instance || (this._instance = new this());
  }

  public startServer(callback: any): void {
    this.httpServer.listen(this.port, callback);
  }
}

export default CustomServer;
