import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel.ts";
import bcrypt from "bcrypt";
import { config } from "../config/config.ts";
import jwt from "jsonwebtoken";
import { create } from "domain";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    // Validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // Database call
    try {
        const user = await userModel.findOne({ email: email });
        if (user) {
            const error = createHttpError(400, "User already exists");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Database error"));
    }

    let token = "";

    try {
        // Password -> Hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Business Logic
        const newUser = await userModel.create({ name, email, password: hashedPassword });

        // Token generation
        token = jwt.sign({ sub: newUser._id, email: newUser.email }, config.jwt_secret, { expiresIn: "7d" });
    } catch (error) {
        return next(createHttpError(500, "Database error"));
    }

    // Response
    res.json({ accessToken: token });
}


export { createUser };