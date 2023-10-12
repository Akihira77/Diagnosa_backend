import { StatusCodes } from "../utils/constant.js";

class InternalServerError extends Error {
	readonly statusCode: number;
	constructor(message: string) {
		super(message);
		this.statusCode = StatusCodes.InternalServerError500;
	}
}

export default InternalServerError;
