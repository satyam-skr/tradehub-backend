class ApiError extends Error {
    statusCode: number;
    data: any;           // you can type this more strictly if you know the shape
    success: boolean;
    errors: any[];       // array of errors

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: any[] = [],
        stack?: string
    ) {
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.data = null
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError };