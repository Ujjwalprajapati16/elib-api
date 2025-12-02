import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config.ts";

export interface AuthRequest extends Request {
    userId?: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return next(createHttpError(401, "Unauthorized: No token provided"));
        }

        // Expect format: "Bearer <token>"
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return next(createHttpError(400, "Invalid Authorization header format"));
        }

        let decoded: string | JwtPayload;
        try {
            decoded = jwt.verify(token, config.jwt_secret);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return next(createHttpError(401, "Token expired"));
            }
            if (err instanceof jwt.JsonWebTokenError) {
                return next(createHttpError(403, "Invalid token"));
            }
            return next(createHttpError(500, "Token verification failed"));
        }

        // Attach user ID if available
        const _req = req as AuthRequest;
        if (typeof decoded === "object" && "sub" in decoded) {
            _req.userId = decoded.sub as string;
        } else {
            return next(createHttpError(403, "Invalid token payload"));
        }

        next();
    } catch (error) {
        next(createHttpError(500, (error as Error).message || "Authentication middleware error"));
    }
};

export default authenticate;
