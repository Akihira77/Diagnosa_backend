import { NextFunction, Request, Response } from "express";
import {
	BadRequestError,
	InternalServerError,
	UnauthenticatedError,
} from "../errors/main.error.js";

const errorHandlerMiddleware = async (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	if (err instanceof InternalServerError) {
		res.status(err.statusCode).send({ msg: err.message });
	} else if (err instanceof BadRequestError) {
		res.status(err.statusCode).send({ msg: err.message });
	} else if (err instanceof UnauthenticatedError) {
		res.status(err.statusCode).send({ msg: err.message });
	}

	return;
};

export default errorHandlerMiddleware;
