import express from 'express';
import { createServer, Server } from 'http';
import socketio, { Socket } from 'socket.io';

import { Student } from '../data/student';
import { Control } from '../data/control';
import { Document } from '../data/document';
import { User } from '../data/user';
import Logger, { LogType } from '../util/logger';
import connection from '../db/connection';
import { getNextRegistrationNumber } from '../util/sql';

class CustomServer {
  private static _instance: CustomServer;

  public app: express.Application;
  public port: number;

  private httpServer: Server;

  public ioServer: socketio.Server;

  // Server data
  private students: Student[];
  private controls: Control[];
  private documents: Document[];
  private users: User[];

  private constructor() {
    this.app = express();
    this.port = Number(process.env.PORT) || 3000;

    this.httpServer = createServer(this.app);

    this.ioServer = new socketio.Server(this.httpServer, { cors: { origin: '*' } });

    this.students = [];
    this.controls = [];
    this.documents = [];
    this.users = [];

  }

  private listenSockets() {
    Logger.log('Listening for socket connection', LogType.INFO);

    this.ioServer.on('connection', (socket: Socket) => {
      // console.log(socket.id);
    });
  }

  public static get instance(): CustomServer {
    return this._instance || (this._instance = new this());
  }

  public async startServer(callback: any): Promise<void> {
    this.httpServer.listen(this.port, callback);
    if (await this.populateLists()) {
      this.listenSockets();
    } else {
      Logger.log('Fatal error', LogType.ERROR);
    }

  }

  private async populateLists(): Promise<boolean> {
    try {
      const studentResults = await connection.query('SELECT id, matricula, nombres, pApellido, sApellido, fechaNac, CURP, telefono, informacion, estado FROM alumnos ORDER BY id ASC');

      for (let i = 0; i < studentResults.length; i++) {
        const result = studentResults[i];

        const student: Student = {
          id: result.id,
          matricula: result.matricula,
          nombres: result.nombres,
          pApellido: result.pApellido,
          sApellido: result.sApellido,
          fechaNac: result.fechaNac,
          CURP: result.CURP,
          telefono: result.telefono,
          informacion: JSON.parse(result.informacion),
          estado: result.estado
        };

        this.students.push(student);
      }

      const controlResults = await connection.query('SELECT * FROM controles ORDER BY id ASC');

      for (let i = 0; i < controlResults.length; i++) {
        const result = controlResults[i];

        const control: Control = {
          id: result.id,
          idAlumno: result.idAlumno,
          tipo: result.tipo
        };

        this.controls.push(control);
      }

      const documentResults = await connection.query('SELECT * FROM documentos ORDER BY idAlumno ASC');

      for (let i = 0; i < documentResults.length; i++) {
        const result = documentResults[i];

        const document: Document = {
          id: result.id,
          idAlumno: result.idAlumno,
          tipo: result.tipo,
          informacion: JSON.parse(result.informacion),
          fecha: result.fecha
        };

        this.documents.push(document);
      }

      const userResults = await connection.query('SELECT idUsuario, nombreUsuario, nombres, pApellido, sApellido, role, status FROM usuarios ORDER BY idUsuario ASC');

      for (let i = 0; i < userResults.length; i++) {
        const result = userResults[i];

        const user: User = {
          idUsuario: result.idUsuario,
          nombreUsuario: result.nombreUsuario,
          nombres: result.nombres,
          pApellido: result.pApellido,
          sApellido: result.sApellido,
          role: result.role,
          status: result.status
        };
        this.users.push(user);
      }

      return true;

    } catch (error: any) {
      Logger.log(`Fatal error ${error.sqlMessage}`, LogType.ERROR);
      return false;
    }
  }

  public getStudents(): Student[] {
    return this.students;
  }

  public getStudentById(id: number): Student | undefined {


    function search(array: Student[], id: any, start: number, end: number): Student | undefined {
      if (start > end) {
        return;
      }

      const middle = Math.floor((start + end) / 2);

      if (array[middle].id == id) {
        return array[middle];
      }

      if (array[middle].id > id) {
        return search(array, id, start, middle - 1);
      } else {
        return search(array, id, middle + 1, end);
      }
    }

    const student = search(this.students, id, 0, this.students.length - 1);

    return student;
  }

  public getStudentIndexById(id: number): number {

    function search(array: Student[], id: any, start: number, end: number): number {
      if (start > end) {
        return -1;
      }

      const middle = Math.floor((start + end) / 2);

      if (array[middle].id == id) {
        return middle;
      }

      if (array[middle].id > id) {
        return search(array, id, start, middle - 1);
      } else {
        return search(array, id, middle + 1, end);
      }
    }

    const index = search(this.students, id, 0, this.students.length - 1);

    return index;
  }

  public getControls(): Control[] {
    return this.controls;
  }

  public getControlsByType(type: number): Control[] {

    const controls: Control[] = [];

    for (let i = 0; i < this.controls.length; i++) {
      if (this.controls[i].tipo === type) {
        controls.push(this.controls[i]);
      }
    }

    return controls;
  }

  public getDocuments(): Document[] {
    return this.documents;
  }

  public getDocumentsByStudentId(id: number): Document[] {

    const documents: Document[] = [];

    for (let i = 0; i < this.documents.length; i++) {
      if (this.documents[i].idAlumno === id) {
        documents.push(this.documents[i]);
      }
    }
    return documents;
  }

  public getDocumentIndexById(id: number): number {
    function search(array: Document[], id: any, start: number, end: number): number {
      if (start > end) {
        return -1;
      }

      const middle = Math.floor((start + end) / 2);

      if (array[middle].id == id) {
        return middle;
      }

      if (array[middle].id > id) {
        return search(array, id, start, middle - 1);
      } else {
        return search(array, id, middle + 1, end);
      }
    }

    const index = search(this.documents, id, 0, this.documents.length - 1);

    return index;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getUserById(id: number): User | undefined {
    function search(array: User[], id: any, start: number, end: number): User | undefined {
      if (start > end) {
        return;
      }

      const middle = Math.floor((start + end) / 2);

      if (array[middle].idUsuario == id) {
        return array[middle];
      }

      if (array[middle].idUsuario > id) {
        return search(array, id, start, middle - 1);
      } else {
        return search(array, id, middle + 1, end);
      }
    }
    const user = search(this.users, id, 0, this.users.length - 1);

    return user;
  }

  public getUserIndexById(id: number): number {
    function search(array: User[], id: any, start: number, end: number): number {
      if (start > end) {
        return -1;
      }

      const middle = Math.floor((start + end) / 2);

      if (array[middle].idUsuario == id) {
        return middle;
      }

      if (array[middle].idUsuario > id) {
        return search(array, id, start, middle - 1);
      } else {
        return search(array, id, middle + 1, end);
      }
    }

    const index = search(this.users, id, 0, this.students.length - 1);

    return index;
  }

  public deleteUserById(id: number): number {
    let i = 0;
    for (i = 0; this.users.length; i++) {
      if (this.users[i].idUsuario === id) {
        this.users.splice(i, 1);
        break;
      }
    }

    return i;
  }

  public deleteAllStudents() {
    this.students = [];
  }

  public deleteAllDocuments() {
    this.documents = [];
  }
}

export default CustomServer;
