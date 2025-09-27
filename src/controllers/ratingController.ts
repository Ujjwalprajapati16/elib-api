import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.ts";
import createHttpError from "http-errors";
import ratingModel from "../models/ratingModel.ts";

const addRating = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { BookId } = req.params;
    const { rating, comment } = req.body;
    const user = (req as AuthRequest).userId;

    if(!BookId || !rating || !comment) {
        return next(createHttpError(400, "All fields are required."));
    }

    try {
        await ratingModel.create({ book: BookId, user, rating, comment });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to add rating."));
    }

    res.status(200).json({ message: 'Rating added successfully' });
}

const deleteRating = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { BookId, ratingId } = req.params;
    const user = (req as AuthRequest).userId;

    if(!BookId || !ratingId) {
        return next(createHttpError(400, "All fields are required."));
    }

    try {
        await ratingModel.deleteOne({ book: BookId, user, _id: ratingId });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to delete rating."));
    }

    res.status(200).json({ message: 'Rating deleted successfully' });
}

export { addRating, deleteRating }