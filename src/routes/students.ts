import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import { AddInformationRequestBody, instanceOfAddInformationRequestBody } from '../data/addInformationRequest';
import { AddStudentRequestBody, instanceOfAddStudentRequestBody } from '../data/addStudentRequest';
import { instanceOfRegisterStudentRequestBody, RegisterStudentRequestBody } from '../data/registerStudentRequest';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';
import { getNextRegistrationNumber } from '../util/sql';

const students = express();

students.get('/students', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  connection.query('SELECT * FROM alumnos', (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        queryStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      result
    });
  });
});

students.get('/student/:id', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  connection.query(format('SELECT * FROM alumnos WHERE id = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        queryStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }
    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      result
    });
  });
});

students.get('/student/documents/:id', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  connection.query(format('SELECT * FROM documentos WHERE idAlumno = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        queryStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      queryStatusCode: 0,
      result
    });
  });
});

students.post('/students', verifyLoggedIn, verifyUser, async (request: Request, response: Response) => {
  if (instanceOfAddStudentRequestBody(request.body)) {
    const alumno = request.body as AddStudentRequestBody;
    const informacionAlumno = JSON.stringify({
      direccion: alumno.direccion,
      colonia: alumno.colonia,
      localidad: alumno.localidad,
      grado: alumno.grado,
      grupo: alumno.grupo,
      calificaciones: [],
      reportes: [],
      estudioSoc: {}
    });

    const date = new Date();
    let year = '';
    if (date.getMonth() < 6) {
      year = (date.getFullYear() - 1).toString().substring(2);
    } else {
      year = date.getFullYear().toString().substring(2);
    }

    const nextNumber = await getNextRegistrationNumber(alumno.anioEntrada);

    const matricula = `${`${alumno.anioEntrada}`.substring(2)}01${nextNumber}`;

    const query = format(`INSERT INTO alumnos VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [matricula, alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, alumno.telefono, informacionAlumno]);

    connection.query(query, (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }

      if (result.affectedRows === 1) {
        return response.status(200).json({
          requestStatus: 'SUCCESS',
          registerStatusCode: 0,
          insertId: result.insertId
        });
      } else {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }
    });

  } else {
    return response.status(400).json({
      requestStatus: 'ERROR',
      registerStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
});

students.post('/student', verifyLoggedIn, async (request: Request, response: Response) => {
  if (instanceOfRegisterStudentRequestBody(request.body)) {
    const alumno = request.body as RegisterStudentRequestBody;
    const informacionAlumno = JSON.stringify({
      direccion: alumno.direccion,
      colonia: alumno.colonia,
      localidad: alumno.localidad,
      grado: alumno.grado,
      grupo: alumno.grupo,
      calificaciones: [],
      reportes: [],
      estudioSoc: {
        cantidadMiembros: alumno.cantidadMiembros,
        miembrosFamilia: alumno.miembrosFamilia,
        tipoFamilia: alumno.tipoFamilia,
        totalMiembrosTrabajan: alumno.totalMiembrosTrabajan,
        alimentacion: alumno.alimentacion,
        medicamentos: alumno.medicamentos,
        transporte: alumno.transporte,
        gasolina: alumno.gasolina,
        educacion: alumno.educacion,
        abono: alumno.abono,
        celulares: alumno.celulares,
        servicioMedico: alumno.servicioMedico,
        guarderia: alumno.guarderia,
        agua: alumno.agua,
        gasCilindro: alumno.gasCilindro,
        energiaElectrica: alumno.energiaElectrica,
        telefonoInternet: alumno.telefonoInternet,
        cable: alumno.cable,
        otros: alumno.otros,
        totalEgresos: alumno.totalEgresos,
        estadoVivienda: alumno.estadoVivienda,
        materialVivienda: alumno.materialVivienda,
      }
    });

    const date = new Date();
    let year = '';
    if (date.getMonth() < 6) {
      year = (date.getFullYear() - 1).toString().substring(2);
    } else {
      year = date.getFullYear().toString().substring(2);
    }

    const nextNumber = await getNextRegistrationNumber();

    const matricula = `${year}01${nextNumber}`;

    const query = format(`INSERT INTO alumnos VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [matricula, alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, alumno.telefono, informacionAlumno]);

    connection.query(query, async (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }

      if (result.affectedRows === 1) {
        return response.status(200).json({
          requestStatus: 'SUCCESS',
          registerStatusCode: 0,
          insertId: result.insertId
        });
      } else {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }
    });
  } else {
    return response.status(400).json({
      requestStatus: 'ERROR',
      registerStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
});

students.put('/students/add-information/:id', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  if (instanceOfAddInformationRequestBody(request.body)) {
    connection.query(format('SELECT * FROM alumnos WHERE id = ?', [request.params.id]), (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          updateStatusCode: 1,
          error: {
            message: 'Internal server error'
          }
        });
      }

      if (result.length === 1) {
        const body = request.body as AddInformationRequestBody;

        const query = format('INSERT INTO documentos VALUES (NULL, ?, ?, ?, CURDATE())', [request.params.id, body.type, body.information]);

        connection.query(query, (error: MysqlError, result: any) => {
          if (error) {
            return response.status(500).json({
              requestStatus: 'ERROR',
              updateStatusCode: 1,
              error: {
                message: 'Internal server error'
              }
            });
          }

          if (result.affectedRows === 1) {
            return response.status(200).json({
              requestStatus: 'SUCCESS',
              updateStatusCode: 0
            });
          } else {
            return response.status(500).json({
              requestStatus: 'ERROR',
              updateStatusCode: 1,
              error: {
                message: 'Internal server error'
              }
            });
          }

        });
      } else {
        return response.status(200).json({
          requestStatus: 'SUCCESS',
          updateStatusCode: 1
        });
      }
    });
  } else {
    return response.status(400).json({
      requestStatus: 'ERROR',
      updateStatusCode: 1,
      error: {
        message: 'Invalid request body'
      }
    });
  }
});


students.delete('/students/:id', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  connection.query(format('UPDATE alumnos SET estado = 1 WHERE id = ?', [request.params.id]), (error: MysqlError, result: any) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        deletionStatusCode: 1,
        error: {
          message: 'Internal server error'
        }
      });
    }

    if (result.affectedRows === 1) {

    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        deletionStatusCode: 1
      });
    }
  });
});

export default students;
