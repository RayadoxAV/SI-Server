import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';
import CustomServer from '../server/server';

const documents = express();

documents.get('/documents', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {

	return response.status(200).json({
		requestStatus: 'SUCCESS',
		queryStatusCode: 0,
		result: CustomServer.instance.getDocuments()
	});

	// connection.query('SELECT * FROM documentos', (error: MysqlError, result: any) => {
	// 	if (error) {
	// 		return response.status(500).json({
	// 			requestStatus: 'ERROR',
	// 			queryStatusCode: 1,
	// 			error: {
	// 				message: 'Internal server error'
	// 			}
	// 		});
	// 	}

	// 	return response.status(200).json({
	// 		requestStatus: 'SUCCESS',
	// 		queryStatusCode: 0,
	// 		result
	// 	});
	// });
});

documents.delete('/document/:id', verifyLoggedIn, verifyUser, async (request: Request, response: Response) => {
	const id = request.params.id;

	if (id) {
		connection.query(format('DELETE FROM documentos WHERE id = ?', [id]), (error: MysqlError, result: any) => {
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
				const documentIndex = CustomServer.instance.getDocumentIndexById(Number.parseInt(id));
				CustomServer.instance.getDocuments().splice(documentIndex, 1);

				CustomServer.instance.ioServer.emit('remove-element', { type: 2, list: CustomServer.instance.getDocuments() });

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
	} else {
		return response.status(400).json({
      requestStatus: 'ERROR',
      registerStatusCode: 1,
      error: {
        message: 'Invalid request'
      }
    });
	}
});

export default documents;
