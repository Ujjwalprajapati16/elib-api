import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const createUser = (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }
    // Business Logic
    // Response
    res.json({ message: "User Craeted" });
}


export { createUser };