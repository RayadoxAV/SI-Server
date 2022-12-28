import express from 'express';
import { createServer, Server } from 'http';

class CustomServer { 
  private static _instance: CustomServer;

  public app: express.Application;
  public port: number;

  private httpServer: Server;

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;

    this.httpServer = createServer(this.app);
  }

  public static get instance(): CustomServer {
    return this._instance || (this._instance = new this());
  }

  public startServer(callback: any): void {
    this.httpServer.listen(this.port, callback);
  }
}

export default CustomServer;
