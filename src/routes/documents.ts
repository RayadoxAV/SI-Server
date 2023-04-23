import express, { Request, Response } from 'express';
import { format, MysqlError } from 'mysql';
import connection from '../db/connection';
import { verifyAdmin, verifyLoggedIn, verifyUser } from '../middlewares/authMiddleware';

const documents = express();

documents.get('/documents', verifyLoggedIn, verifyUser, (request: Request, response: Response) => {
	connection.query('SELECT * FROM documentos', (error: MysqlError, result: any) => {
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

export default documents;
