export default function errorMiddleware(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.statusCode || 500;

    const response = {
        success: false,
        message: statusCode === 500 && process.env.NODE_ENV === "production" ? "Internal server error." : error.message,
    };

    if (process.env.NODE_ENV !== "production") {
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
}
