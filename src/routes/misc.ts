import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAdmin, verifyLoggedIn } from '../middlewares/authMiddleware';
import CustomServer from '../server/server';
import { MysqlError, format } from 'mysql';
import Logger, { LogType } from '../util/logger';
import connection from '../db/connection';
import axios from 'axios';
import bcrypt from 'bcrypt';

const misc = express();

async function getLatestGithubRelease() {
  const latestReleaseURL = 'https://api.github.com/repos/RayadoxAV/Sib-Admin/releases/latest';
  
  const response = await axios.get(latestReleaseURL);

  if (response.status === 200) {
    return response.data;
  } else {
    return undefined;
  }

}

async function getSignature(assets: any[], version: string) {
// sib-admin_1.0.1_x64_en-US.msi.zip
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];

    if (asset.name === `sib-admin_${version}_x64_en-US.msi.zip.sig`) {
      const signature = await axios.get(asset.browser_download_url);
      
      return signature.data;
    }
  }

  return '';
}

function getURL(assets: any[], version: string) {
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    
    if (asset.name === `sib-admin_${version}_x64_en-US.msi.zip`) {
      return asset.browser_download_url;
    }
  }

  return '';
}

misc.get('/releases/sib-admin/:platform/:current_version', async (request: Request, response: Response) => {
  const platform = request.params.platform;
  const currentVersion = request.params.current_version;

  const release = await getLatestGithubRelease();

  if (release) {
    const latestVersion = release.tag_name.substring(1);

    const [latestMajor, latestMinor, latestPatch] = latestVersion.split('.');
    const [currentMajor, currentMinor, currentPatch] = currentVersion.split('.');

    // console.log(latestVersion);

    if (latestMajor === currentMajor && latestMinor === currentMinor && latestPatch === currentPatch) {
      return response.status(204).json({});
    } else {
    const responseBody = {
      version: release.tag_name,
      notes: release.body,
      pub_date: release.published_at,
      platforms: {
        'windows-x86_64': {
          signature: await getSignature(release.assets, release.tag_name.substring(1)),
          url: getURL(release.assets, release.tag_name.substring(1))
        }
      }
    };

    response.status(200).json(responseBody);

    }

  } else {
    response.status(204).json({});
  }

  // response.status(200).json({
  //   ok: true
  // });
});

misc.post('/validate_token', (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _: string | jwt.JwtPayload | undefined) => {
    if (error) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Invalid token'
        }
      });
    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: true
      });
    }
  });
});

misc.post('/validate_user_token', (request: Request, response: Response) => {
  const { token } = request.body;

  jwt.verify(token, process.env.SEED!!, (error: jwt.VerifyErrors | null, _: string | jwt.JwtPayload | undefined) => {
    if (error) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Invalid token'
        }
      });
    }

    const payload: any = jwt.decode(token);

    if (!payload.user) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        isTokenValid: false,
        error: {
          message: 'Unauthorized'
        }
      });
    }

    return response.status(200).json({
      requestStatus: 'SUCCESS',
      isTokenValid: true
    });
  });
});

misc.post('/promote_all', verifyLoggedIn, verifyAdmin, async (request: Request, response: Response) => {
  const students = CustomServer.instance.getStudents();
  for (let i = 0; i < students.length; i++) {
    const currentStudent = students[i];

    if (currentStudent.informacion.grado < 3) {
      const grado = currentStudent.informacion.grado + 1;

      const informacion = { ...currentStudent.informacion };
      informacion.grado = grado;

      const query = format('UPDATE alumnos SET informacion = ? WHERE id = ?', [JSON.stringify(informacion), currentStudent.id,]);

      try {
        await connection.query(query);
        currentStudent.informacion.grado = grado;
      } catch (error: any) {
        Logger.log(`Fatal error ${error}`, LogType.ERROR);
        return response.status(200).json({
          requestStatus: 'ERROR',
          actionStatusCode: 1
        });
      }

    } else {
      const query = format('UPDATE alumnos SET estado = 1 WHERE id = ?', [currentStudent.id]);
      try {
        await connection.query(query);
        currentStudent.estado = 1;
      } catch (error: any) {
        Logger.log(`Fatal error ${error}`, LogType.ERROR);
        return response.status(200).json({
          requestStatus: 'ERROR',
          actionStatusCode: 1
        });
      }
    }
  }

  CustomServer.instance.ioServer.emit('update-element', { type: 0, list: CustomServer.instance.getStudents() });

  return response.status(200).json({
    requestStatus: 'SUCCESS',
    actionStatusCode: 0
  });
});


misc.post('/change_code', verifyLoggedIn, verifyAdmin, (request: Request, response: Response) => {
  const newCode = request.body[0];

  const query = format('INSERT INTO codigos VALUES (0, ?);', [bcrypt.hashSync(newCode, 10)]);

  connection.query(query, (error: MysqlError, result: any) => {
    if (error) {
      return response.status(500).json({
        requestStatus: 'ERROR',
        actionStatusCode: 1,
        error: {
          message: 'Internal server error',
          error: error
        }
      });
    }

    if (result.affectedRows === 1) {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        actionStatusCode: 0
      });
    } else {
      return response.status(200).json({
        requestStatus: 'SUCCESS',
        actionStatusCode: 1
      });
    }
  });

});


/* DANGEROUS */

misc.post('/delete_students', verifyLoggedIn, verifyAdmin, async (request: Request, response: Response) => {
  try {
    const deleteStudentsQuery = format('DELETE FROM alumnos;', [])
    await connection.query(deleteStudentsQuery);

    const deleteDocumentsQuery = format('DELETE FROM documentos;', []);
    await connection.query(deleteDocumentsQuery);

    CustomServer.instance.deleteAllStudents();
    CustomServer.instance.ioServer.emit('remove-element', { type: 0, list: CustomServer.instance.getStudents() });
    CustomServer.instance.ioServer.emit('remove-element', { type: 2, list: CustomServer.instance.getDocuments() });


    return response.status(200).json({
      requestStatus: 'SUCCESS',
      actionStatusCode: 0
    });

  } catch (error) {
    return response.status(500).json({
      requestStatus: 'ERROR',
      actionStatusCode: 1,
      error: {
        message: 'Internal server error'
      }
    });
  }
});

export default misc;
