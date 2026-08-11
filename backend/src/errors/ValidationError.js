import AppError from "./AppError.js";

class ValidationError extends AppError {
    constructor(message = "Invalid request data.") {
        super(message, 400);
    }
}

export default ValidationError;
