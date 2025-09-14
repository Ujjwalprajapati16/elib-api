import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel.ts";
import { uploadImage } from "../utils/uploadImage.ts";
import { uploadFile } from "../utils/uploadFile.ts";
import { deleteLocalFile } from "../utils/deleteLocalFile.ts";
import { getDirname } from "../utils/dirname.ts";
import type { AuthRequest } from "../middlewares/authenticate.ts";
import bookRouter from "./bookRouter.ts";

const __dirname = getDirname(import.meta.url);

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    // Validate required fields
    if (!title || !genre) {
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
        });

        // Populate author details excluding sensitive fields
        await newBook.populate("author", "-password -__v -createdAt -updatedAt");

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
    const { title, genre } = req.body;
    const { Bookid } = req.params;

    // Validate Book ID
    if (!Bookid) {
        return next(createHttpError(400, "Book ID is required."));
    }

    let coverImagePath: string | null = null;
    let bookFilePath: string | null = null;

    try {
        // Find the book
        const book = await bookModel.findById(Bookid);
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        // Ensure the logged-in user is the author
        if (book.author.toString() !== (req as AuthRequest).userId) {
            return next(createHttpError(403, "Forbidden: You are not the author of this book."));
        }

        // Handle uploaded files
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        let coverImageUrl = book.coverImage;
        let fileUrl = book.file;

        // If new cover image uploaded
        if (files?.coverImage?.[0]) {
            const coverImage = files.coverImage[0];
            coverImagePath = path.resolve(__dirname, "../../public/data/uploads", coverImage.filename);

            const coverImageUpload = await uploadImage(
                coverImagePath,
                coverImage.filename,
                coverImage.mimetype
            );
            coverImageUrl = coverImageUpload.secure_url;
        }

        // If new book file uploaded
        if (files?.file?.[0]) {
            const bookFile = files.file[0];
            bookFilePath = path.resolve(__dirname, "../../public/data/uploads", bookFile.filename);

            const bookFileUpload = await uploadFile(bookFilePath, bookFile.filename);
            fileUrl = bookFileUpload.secure_url;
        }

        // Update book fields
        if (title) book.title = title;
        if (genre) book.genre = genre;
        book.coverImage = coverImageUrl;
        book.file = fileUrl;

        await book.save();
        await book.populate("author", "-password -__v -createdAt -updatedAt");

        res.status(200).json({
            message: "Book updated successfully",
            book,
        });
    } catch (err) {
        return next(createHttpError(500, (err as Error).message || "Failed to update book."));
    } finally {
        // Delete local temp files if they exist
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
        // todo: add pagination later
        const book = await bookModel.find();
        res.status(200).json({
            message: "Books listed successfully",
            books: book,
        });
    } catch (error) {
        return next(createHttpError(500, (error as Error).message || "Failed to list books."));
    }
}

export { createBook, updateBook, listBooks };
