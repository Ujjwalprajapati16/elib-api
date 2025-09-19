import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "../models/bookModel.ts";
import { uploadImage } from "../utils/uploadImage.ts";
import { uploadFile } from "../utils/uploadFile.ts";
import { deleteLocalFile } from "../utils/deleteLocalFile.ts";
import { getDirname } from "../utils/dirname.ts";
import type { AuthRequest } from "../middlewares/authenticate.ts";
import { deleteImage } from "../utils/deleteImage.ts";
import { deleteFile } from "../utils/deleteFile.ts";
import mongoose from "mongoose";

const __dirname = getDirname(import.meta.url);

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;

    // Validate required fields
    if (!title || !genre || !description) {
        return next(createHttpError(400, "Title and genre are required."));
    }

    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    // Ensure cover image exists
    if (!files?.coverImage?.[0]) {
        return next(createHttpError(400, "Cover image is required."));
    }

    const coverImage = files.coverImage[0];
    const coverImagePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        coverImage.filename
    );

    const bookFile = files.file?.[0];
    const bookFilePath = bookFile
        ? path.resolve(__dirname, "../../public/data/uploads", bookFile.filename)
        : null;

    try {
        // Upload cover image to cloud storage
        const coverImageUpload = await uploadImage(
            coverImagePath,
            coverImage.filename,
            coverImage.mimetype
        );

        // Upload book file if provided
        let bookFileUpload = null;
        if (bookFilePath && bookFile) {
            bookFileUpload = await uploadFile(bookFilePath, bookFile.filename);
        }

        const _req = req as AuthRequest;
        if (!_req.userId) {
            return next(
                createHttpError(401, "Unauthorized: User ID missing in request.")
            );
        }

        // Create new book entry in database
        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: coverImageUpload.secure_url,
            file: bookFileUpload?.secure_url || null,
            description,
        });

        // Populate author details excluding sensitive fields
        await newBook.populate("author", "name");

        res.status(201).json({
            message: "Book created successfully",
            book: newBook,
        });
    } catch (err) {
        next(
            createHttpError(500, (err as Error).message || "Failed to create book.")
        );
    } finally {
        // Delete local temporary files regardless of success or failure
        await deleteLocalFile(coverImagePath);
        if (bookFilePath) {
            await deleteLocalFile(bookFilePath);
        }
    }
};


const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre, description } = req.body;
    const { Bookid } = req.params;

    if (!Bookid) {
        return next(createHttpError(400, "Book ID is required."));
    }

    let coverImagePath: string | null = null;
    let bookFilePath: string | null = null;

    try {
        const book = await bookModel.findById(Bookid);
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        if (book.author.toString() !== (req as AuthRequest).userId) {
            return next(createHttpError(403, "Forbidden: You are not the author of this book."));
        }

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        let coverImageUrl = book.coverImage;
        let fileUrl = book.file;

        // Replace cover image if uploaded
        if (files?.coverImage?.[0]) {
            const coverImage = files.coverImage[0];
            coverImagePath = path.resolve(__dirname, "../../public/data/uploads", coverImage.filename);

            const coverImageUpload = await uploadImage(
                coverImagePath,
                coverImage.filename,
                coverImage.mimetype
            );

            // Delete old cover image from Cloudinary only if it exists
            if (book.coverImage) {
                await deleteImage(book.coverImage);
            }

            coverImageUrl = coverImageUpload.secure_url;
        }

        // Replace book file if uploaded
        if (files?.file?.[0]) {
            const bookFile = files.file[0];
            bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFile.filename);

            const bookFileUpload = await uploadFile(bookFilePath, bookFile.filename);

            // Delete old file from Cloudinary only if it exists
            if (book.file) {
                await deleteFile(book.file);
            }

            fileUrl = bookFileUpload.secure_url;
        }

        // Update fields
        if (title) book.title = title;
        if (genre) book.genre = genre;
        if (description) book.description = description;
        book.coverImage = coverImageUrl;
        book.file = fileUrl;

        await book.save();
        await book.populate("author", "name");

        res.status(200).json({
            message: "Book updated successfully",
            book,
        });
    } catch (err) {
        return next(createHttpError(500, (err as Error).message || "Failed to update book."));
    } finally {
        // Always clean local temp files if they exist
        if (coverImagePath) {
            await deleteLocalFile(coverImagePath);
        }
        if (bookFilePath) {
            await deleteLocalFile(bookFilePath);
        }
    }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse query params with defaults
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Calculate skip
        const skip = (page - 1) * limit;

        // Fetch books with pagination
        const books = await bookModel
            .find()
            .populate("author", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Count total books
        const totalBooks = await bookModel.countDocuments();

        res.status(200).json({
            message: "Books listed successfully",
            books,
            pagination: {
                totalBooks,
                currentPage: page,
                totalPages: Math.ceil(totalBooks / limit),
                pageSize: limit,
            },
        });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to list books."));
    }
};

const bookDeatils = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Bookid } = req.params;
        if (!Bookid) {
            return next(createHttpError(400, "Book ID is required."));
        }
        const book = await bookModel.findById(Bookid).populate("author", "name");
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        // update views count
        book.views += 1;
        await book.save();

        res.status(200).json({
            message: "Book details fetched successfully",
            book,
        });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to get book details."));
    }
}

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { Bookid } = req.params;
        if (!Bookid) {
            return next(createHttpError(400, "Book ID is required."));
        }

        const book = await bookModel.findOne({ _id: Bookid });
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        // Ensure the logged-in user is the author
        if (book.author.toString() !== (req as AuthRequest).userId) {
            return next(createHttpError(403, "Forbidden: You are not the author of this book."));
        }

        // delete from cloudinary
        if (book.coverImage) {
            await deleteImage(book.coverImage);
        }
        if (book.file) {
            await deleteFile(book.file);
        }

        // Delete book from database
        await bookModel.deleteOne({ _id: Bookid });
        res.status(200).json({
            message: "Book deleted successfully",
        });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to delete book."));
    }
}

// update like count
const updateLike = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { Bookid } = req.params;
        if (!Bookid) {
            return next(createHttpError(400, "Book ID is required."));
        }

        if (!mongoose.Types.ObjectId.isValid(Bookid)) {
            return next(createHttpError(400, "Invalid Book ID format."));
        }

        const book = await bookModel.findById(Bookid);
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        const userId = new mongoose.Types.ObjectId(req.userId);

        const hasLiked = book.likes.some((id) => id.equals(userId));

        if (hasLiked) {
            book.likes = book.likes.filter((id) => !id.equals(userId));
        } else {
            book.likes.push(userId);
        }

        await book.save();

        res.status(200).json({
            message: hasLiked ? "Book unliked successfully" : "Book liked successfully",
            likesCount: book.likes.length,
            book,
        });
    } catch (error) {
        return next(
            createHttpError(500, (error as Error).message || "Failed to update like count.")
        );
    }
}
export { createBook, updateBook, listBooks, bookDeatils, deleteBook, updateLike };
