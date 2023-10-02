class CustomAPIError extends Error {
    constructor(message: string, protected statusCode: number) {
        super(message);
    }
}

export default CustomAPIError;
