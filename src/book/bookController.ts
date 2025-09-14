import type { NextFunction, Request, Response } from "express";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel.ts";
import { uploadImage } from "../utils/uploadImage.ts";
import { uploadFile } from "../utils/uploadFile.ts";
import { deleteLocalFile } from "../utils/deleteLocalFile.ts";
import { getDirname } from "../utils/dirname.ts";
const __dirname = getDirname(import.meta.url);

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, genre } = req.body;

    if (!title || !genre) {
        return next(createHttpError(400, "Title and genre are required."));
    }

    const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
    };

    if (!files?.coverImage?.[0]) {
        return next(createHttpError(400, "Cover image is required."));
    }

    const coverImage = files.coverImage[0];
    const coverImagePath = path.resolve(__dirname, "../../public/data/uploads", coverImage.filename);

    const bookFile = files.file?.[0];
    const bookFilePath = bookFile
        ? path.resolve(__dirname, "../../public/data/uploads", bookFile.filename)
        : null;

    try {
        // Upload cover image
        const coverImageUpload = await uploadImage(coverImagePath, coverImage.filename, coverImage.mimetype);

        // Upload book file (optional)
        let bookFileUpload = null;
        if (bookFilePath && bookFile) {
            bookFileUpload = await uploadFile(bookFilePath, bookFile.filename);
        }

        // Save to DB
        const newBook = await bookModel.create({
            title,
            genre,
            author: "68c469f6be6ba5884101d9ee",
            coverImage: coverImageUpload.secure_url,
            file: bookFileUpload?.secure_url || null,
        });

        await newBook.populate("author", "-password -__v -createdAt -updatedAt");

        res.status(201).json({
            message: "Book created successfully",
            book: newBook,
        });
    } catch (err) {
        next(createHttpError(500, (err as Error).message || "Failed to create book."));
    } finally {
        // cleanup local temp files
        await deleteLocalFile(coverImagePath);
        if (bookFilePath) {
            await deleteLocalFile(bookFilePath);
        }
    }
};

export { createBook };
