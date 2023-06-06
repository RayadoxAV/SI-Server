import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import { AddInformationRequestBody, instanceOfAddInformationRequestBody } from '../data/addInformationRequest';
import { AddStudentRequestBody, instanceOfAddStudentRequestBody } from '../data/addStudentRequest';
import { instanceOfRegisterStudentRequestBody, RegisterStudentRequestBody } from '../data/registerStudentRequest';
import { instanceOfAddSocioeconomicStudyRequestBody, AddSocioeconomicRequestBody } from '../data/addSocioeconomicStudy';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';
import { getNextRegistrationNumber } from '../util/sql';
import CustomServer from '../server/server';
import { Student } from '../data/student';
import { Document } from '../data/document';
import Logger, { LogType } from '../util/logger';
import bcrypt, { hashSync } from 'bcrypt';
import { instanceOfEditStudentRequestBody } from '../data/editStudentRequest';

const students = express();

students.get('/students', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getStudents()
  });
  // connection.query('SELECT * FROM alumnos', (error: MysqlError, result: any[]) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }

  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     result
  //   });
  // });
});

students.get('/student/:id', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  // return response.status(500).json({});

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getStudentById(Number.parseInt(request.params.id))
  });
  // connection.query(format('SELECT * FROM alumnos WHERE id = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }
  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     result
  //   });
  // });
});

students.get('/student/documents/:id', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  // return response.status(500).json({});

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    queryStatusCode: 0,
    result: CustomServer.instance.getDocumentsByStudentId(Number.parseInt(request.params.id))
  });

  // connection.query(format('SELECT * FROM documentos WHERE idAlumno = ?', [request.params.id]), (error: MysqlError, result: any[]) => {
  //   if (error) {
  //     return response.status(500).json({
  //       requestStatus: 'ERROR',
  //       queryStatusCode: 1,
  //       error: {
  //         message: 'Internal server error'
  //       }
  //     });
  //   }

  //   return response.status(200).json({
  //     requestStatus: 'SUCCESS',
  //     queryStatusCode: 0,
  //     result
  //   });
  // });
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

    const newPassword = bcrypt.hashSync(`${`${alumno.curp}`.substring(0, 4)}${matricula}`, 10);

    const query = format(`INSERT INTO alumnos VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [matricula, alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, newPassword, alumno.telefono, informacionAlumno]);

    connection.query(query, (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          registerStatusCode: 1,
          error: {
            message: 'Internal server error',
            error: error
          }
        });
      }

      if (result.affectedRows === 1) {

        const newStudent: Student = {
          id: result.insertId,
          matricula: matricula,
          nombres: alumno.nombreAlumno,
          pApellido: alumno.pApellido,
          sApellido: alumno.sApellido,
          fechaNac: alumno.fechaNac,
          CURP: alumno.curp,
          telefono: alumno.telefono,
          informacion: JSON.parse(informacionAlumno),
          estado: 0
        }

        CustomServer.instance.getStudents().push(newStudent);

        CustomServer.instance.ioServer.emit('add-element', { type: 0, list: CustomServer.instance.getStudents() });

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
            message: 'Internal server error',

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

    const newPassword = bcrypt.hashSync(alumno.password, 10);

    const query = format(`INSERT INTO alumnos VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);`, [matricula, alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, newPassword, alumno.telefono, informacionAlumno]);

    connection.query(query, async (error: MysqlError, result: any) => {
      if (error) {
        return response.status(500).json({
          requestStatus: 'ERROR',
          StatusCode: 1,
          error: {
            message: 'Internal server error',
            error: error
          }
        });
      }

      if (result.affectedRows === 1) {

        const newStudent: Student = {
          id: result.insertId,
          matricula: matricula,
          nombres: alumno.nombreAlumno,
          pApellido: alumno.pApellido,
          sApellido: alumno.sApellido,
          fechaNac: alumno.fechaNac,
          CURP: alumno.curp,
          telefono: alumno.telefono,
          informacion: JSON.parse(informacionAlumno),
          estado: 0
        };

        CustomServer.instance.getStudents().push(newStudent);

        CustomServer.instance.ioServer.emit('add-element', { type: 0, list: CustomServer.instance.getStudents() })

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

students.put('/student/:id', verifyLoggedIn, verifyUser, async (request: Request, response: Response) => {
  if (instanceOfEditStudentRequestBody(request.body)) {
    const updatedInformation = request.body as AddStudentRequestBody;

    const student = CustomServer.instance.getStudentById(Number.parseInt(request.params.id));
    if (student) {

      const updatedStudent = { ...student };

      updatedStudent.nombres = updatedInformation.nombreAlumno;
      updatedStudent.pApellido = updatedInformation.pApellido;
      updatedStudent.sApellido = updatedInformation.sApellido;
      updatedStudent.fechaNac = `${updatedInformation.fechaNac}`;
      updatedStudent.CURP = updatedInformation.curp;
      updatedStudent.telefono = updatedInformation.telefono;
      updatedStudent.informacion.direccion = updatedInformation.direccion;
      updatedStudent.informacion.colonia = updatedInformation.colonia;
      updatedStudent.informacion.localidad = updatedInformation.localidad;
      updatedStudent.informacion.grado = updatedInformation.grado;
      updatedStudent.informacion.grupo = updatedInformation.grupo;

      const query = format('UPDATE alumnos SET nombres = ?, pApellido = ?, sApellido = ?, fechaNac = ?, CURP = ?, telefono = ?, informacion = ? WHERE id = ?', [updatedStudent.nombres, updatedStudent.pApellido, updatedStudent.sApellido, updatedStudent.fechaNac, updatedStudent.CURP, updatedStudent.telefono, JSON.stringify(updatedStudent.informacion), student.id]);

      connection.query(query, (error: MysqlError, result: any) => {
        if (error) {
          return response.status(500).json({
            requestStatus: 'ERROR',
            updateStatusCode: 1,
            error: {
              message: 'Internal server error',
              error: error
            }
          });
        }

        if (result.affectedRows === 1) {
          const index = CustomServer.instance.getStudentIndexById(student.id);
          CustomServer.instance.getStudents()[index] = updatedStudent;

          CustomServer.instance.ioServer.emit('update-element', { type: 0, list: CustomServer.instance.getStudents() });

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
      return response.status(400).json({
        requestStatus: 'ERROR',
        updateStatusCode: 1,
        error: {
          message: 'Invalid request params'
        }
      });
    }
    // console.log(a.lumno, updatedInformation);

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

students.put('/students/add-information/:id', verifyLoggedIn, verifyUser, async (request: Request, response: Response) => {

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

        connection.query(query, async (error: MysqlError, result: any) => {
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
            try {
              const insertedDocument = await connection.query('SELECT * FROM documentos WHERE id = ?', [result.insertId]);

              const newDocument: Document = {
                id: result.insertId,
                idAlumno: Number.parseInt(request.params.id),
                tipo: body.type,
                informacion: JSON.parse(body.information),
                fecha: insertedDocument[0].fecha
              };

              CustomServer.instance.getDocuments().push(newDocument);

              CustomServer.instance.ioServer.emit('add-element', { type: 2, list: CustomServer.instance.getDocuments() })

              return response.status(200).json({
                requestStatus: 'SUCCESS',
                updateStatusCode: 0
              });
            } catch (error: any) {
              Logger.log(`Fatal error ${error}`, LogType.ERROR);

            }
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

students.put('/students/add-soc-study/:id', verifyLoggedIn, verifyAdmin, async (request: Request, response: Response) => {
  if (instanceOfAddSocioeconomicStudyRequestBody(request.body)) {
    const student = CustomServer.instance.getStudentById(Number.parseInt(request.params.id));
    const body = request.body;
    if (student) {
      const study = {
        cantidadMiembros: body.cantidadMiembros,
        miembrosFamilia: body.miembrosFamilia,
        tipoFamilia: body.tipoFamilia,
        totalMiembrosTrabajan: body.totalMiembrosTrabajan,
        alimentacion: body.alimentacion,
        medicamentos: body.medicamentos,
        transporte: body.transporte,
        gasolina: body.gasolina,
        educacion: body.educacion,
        abono: body.abono,
        celulares: body.celulares,
        servicioMedico: body.servicioMedico,
        guarderia: body.guarderia,
        agua: body.agua,
        gasCilindro: body.gasCilindro,
        energiaElectrica: body.energiaElectrica,
        telefonoInternet: body.telefonoInternet,
        cable: body.cable,
        otros: body.otros,
        totalEgresos: body.totalEgresos,
        estadoVivienda: body.estadoVivienda,
        materialVivienda: body.materialVivienda
      };
      const informacionAlumno = student.informacion;
      // @ts-ignore
      informacionAlumno.estudioSoc = study;

      const query = format('UPDATE alumnos SET informacion = ? WHERE id = ?', [JSON.stringify(informacionAlumno), request.params.id]);

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
          const studentIndex = CustomServer.instance.getStudentIndexById(Number.parseInt(request.params.id));

          // @ts-ignore
          CustomServer.instance.getStudents()[studentIndex].informacion.estudioSoc = study;

          CustomServer.instance.ioServer.emit('update-element', { type: 0, list: CustomServer.instance.getStudents() });

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

    }
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
      const studentIndex = CustomServer.instance.getStudentIndexById(Number.parseInt(request.params.id));
      CustomServer.instance.getStudents()[studentIndex].estado = 1;

      CustomServer.instance.ioServer.emit('update-element', { type: 0, index: studentIndex, element: CustomServer.instance.getStudents()[studentIndex] })

      return response.status(200).json({
        requestStatus: 'SUCCESS',
        deletionStatusCode: 0
      });
    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        deletionStatusCode: 1
      });
    }
  });
});

export default students;
