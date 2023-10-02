import { StatusCodes } from "../utils/constant.js";

class UnauthenticatedError extends Error {
    protected statusCode;
    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.Unauthorized401;
    }
}

export default UnauthenticatedError;
