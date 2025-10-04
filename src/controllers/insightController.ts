import type { NextFunction, Response, Request } from "express";
import ratingModel from "../models/ratingModel.ts";
import createHttpError from "http-errors";
import mongoose from "mongoose";

const averageRating = async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;

    try {
        const authorObjectId = new mongoose.Types.ObjectId(authorId);

        const result = await ratingModel.aggregate([
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },
            {
                $match: { "book.author": authorObjectId }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            message: "Average rating fetched successfully",
            averageRating: result[0]?.averageRating || 0,
            totalRatings: result[0]?.totalRatings || 0
        });
    } catch (error: any) {
        return next(createHttpError(500, error.message || "Failed to get average rating."));
    }
};

const highestAvgRatedBook = async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;
    try {
        const authorObjectId = new mongoose.Types.ObjectId(authorId);

        const result = await ratingModel.aggregate([
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },
            {
                $match: { "book.author": authorObjectId }
            },
            {
                $group: {
                    _id: "$book._id",
                    averageRating: { $avg: "$rating" }
                }
            },
            {
                $sort: { averageRating: -1 }
            },
            {
                $limit: 1
            }
        ]);

        return res.status(200).json({
            message: "Highest average rated book fetched successfully",
            highestAvgRatedBook: result[0]?._id || "",
            averageRating: result[0]?.averageRating || 0
        });
    } catch (error: any) {
        return next(createHttpError(500, error.message || "Failed to get highest average rated book."));
    }
};

const recentRating = async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;

    try {
        const authorObjectId = new mongoose.Types.ObjectId(authorId);

        const result = await ratingModel.aggregate([
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
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
                $project: {
                    _id: 0,
                    bookTitle: "$book.title",
                    rating: 1,
                    comment: 1,
                    createdAt: 1,
                    reviewerName: "$reviewer.name",
                    reviewerEmail: "$reviewer.email"
                }
            }
        ]);

        return res.status(200).json({
            message: "Most recent rating fetched successfully",
            recentRating: result[0] || null
        });

    } catch (error: any) {
        return next(createHttpError(500, error.message || "Failed to get most recent rating."));
    }
};

export { averageRating, highestAvgRatedBook, recentRating };