import { NextFunction, Request, Response } from "express";
import {
	BadRequestError,
	InternalServerError,
	UnauthenticatedError,
} from "../errors/main.error.js";
import { StatusCodes } from "../utils/constant.js";

const errorHandlerMiddleware = (
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	console.log("Error catch with middleware => ", err);
	if (err instanceof InternalServerError) {
		res.status(err.statusCode).send({ msg: err.message });
	} else if (err instanceof BadRequestError) {
		res.status(err.statusCode).send({ msg: err.message });
	} else if (err instanceof UnauthenticatedError) {
		res.status(err.statusCode).send({ msg: err.message });
	} else {
		res.status(StatusCodes.InternalServerError500).send({ err });
	}

	return;
};

export default errorHandlerMiddleware;
