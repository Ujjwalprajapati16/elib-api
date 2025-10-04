import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/authenticate.ts";
import createHttpError from "http-errors";
import ratingModel from "../models/ratingModel.ts";
import mongoose from "mongoose";

const addRating = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { BookId } = req.params;
    const { rating, comment } = req.body;
    const user = (req as AuthRequest).userId;

    if (!BookId || !rating || !comment) {
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

    if (!BookId || !ratingId) {
        return next(createHttpError(400, "All fields are required."));
    }

    try {
        await ratingModel.deleteOne({ book: BookId, user, _id: ratingId });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to delete rating."));
    }

    res.status(200).json({ message: 'Rating deleted successfully' });
}

const getRatingByBookId = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { BookId } = req.params;

    try {
        const ratings = await ratingModel
            .find({ book: BookId })
            .sort({ rating: -1 }); // highest first

        res.status(200).json(ratings);
    } catch (error) {
        return next(
            createHttpError(500, (error as Error).message || "Failed to fetch ratings.")
        );
    }
};

const getRatingByAuthorId = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { AuthorId } = req.params;

    try {
        const authorObjectId = new mongoose.Types.ObjectId(AuthorId);

        const ratings = await ratingModel.aggregate([
            {
                $addFields: {
                    book: {
                        $cond: [
                            { $eq: [{ $type: "$book" }, "string"] },
                            { $toObjectId: "$book" },
                            "$book"
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },
            { $match: { "book.author": authorObjectId } },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "reviewer"
                }
            },
            { $unwind: "$reviewer" },
            {
                $project: {
                    _id: 1,
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    "book._id": 1,
                    "book.title": 1,
                    "reviewer._id": 1,
                    "reviewer.name": 1,
                    "reviewer.email": 1
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return res.status(200).json({
            message: "All ratings for author's books fetched successfully",
            totalRatings: ratings.length,
            ratings
        });

    } catch (error: any) {
        return next(
            createHttpError(500, error.message || "Failed to fetch ratings for author's books.")
        );
    }
};

export { addRating, deleteRating, getRatingByBookId, getRatingByAuthorId };