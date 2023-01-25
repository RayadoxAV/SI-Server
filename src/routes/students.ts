import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import { instanceOfRegisterStudentRequestBody, RegisterStudentRequestBody } from '../data/registerStudentRequest';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';

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

students.post('/students', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
  if (instanceOfRegisterStudentRequestBody(request.body)) {
    const alumno = request.body as RegisterStudentRequestBody;
    const informacionAlumno = JSON.stringify({
      direccion: alumno.direccion,
      colonia: alumno.colonia,
      localidad: alumno.localidad,
      grado: alumno.grado,
      grupo: alumno.grupo,
      promedio: alumno.promedio,
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
    });
    const query = format(`INSERT INTO alumnos VALUES (NULL, '00000000', ?, ?, ?, ?, ?, ?, ?, 0);`, [alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, alumno.telefono, informacionAlumno]);

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

students.post('/student', verifyLoggedIn, (request: Request, response: Response) => {
  if (instanceOfRegisterStudentRequestBody(request.body)) {
    const alumno = request.body as RegisterStudentRequestBody;
    const informacionAlumno = JSON.stringify({
      direccion: alumno.direccion,
      colonia: alumno.colonia,
      localidad: alumno.localidad,
      grado: alumno.grado,
      grupo: alumno.grupo,
      promedio: alumno.promedio,
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
    });
    const query = format(`INSERT INTO alumnos VALUES (NULL, '00000000', ?, ?, ?, ?, ?, ?, ?, 0);`, [alumno.nombreAlumno, alumno.pApellido, alumno.sApellido, alumno.fechaNac, alumno.curp, alumno.telefono, informacionAlumno]);

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
