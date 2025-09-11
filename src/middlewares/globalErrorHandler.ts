import type { NextFunction, Request, Response } from "express";
import type { HttpError } from "http-errors";
import { config } from "../config/config.ts";


const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        status: 'error',
        statusCode,
        errorStack: config.env === 'development' ? err.stack : undefined,
        message: err.message || 'Internal Server Error',
    });
}

export default globalErrorHandler;