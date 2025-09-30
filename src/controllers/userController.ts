import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "../models/userModel.ts";
import bcrypt from "bcrypt";
import { config } from "../config/config.ts";
import jwt from "jsonwebtoken";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role } = req.body;
    // Validation
    if (!name || !email || !password || !role) {
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
        const newUser = await userModel.create({ name, email, password: hashedPassword, role });

        // Token generation
        token = jwt.sign({ sub: newUser._id, email: newUser.email, role: newUser.role }, config.jwt_secret, { expiresIn: "7d" });
    } catch (error) {
        return next(createHttpError(500, "Database error"));
    }

    // Response
    res.status(201).json({ accessToken: token, user: { name, email, role } });
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    let user;

    // Database call
    try {
        user = await userModel.findOne({ email: email });
        if (!user) {
            const error = createHttpError(404, "User not found");
            return next(error);
        }
    } catch (error) {
        return next(createHttpError(500, "Database error"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = createHttpError(401, "Invalid credentials");
        return next(error);
    }

    // Token generation
    const token = jwt.sign({ sub: user._id, email: user.email, role: user.role }, config.jwt_secret, { expiresIn: "7d" });

    res.status(200).json({ accessToken: token, user: { name: user.name, email: user.email, role: user.role }});// Response
}


export { createUser, loginUser };