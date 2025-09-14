import type { NextFunction, Request, Response } from "express";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // implementation for creating a book
    res.json({ message: "Book created" });
}

export { createBook };