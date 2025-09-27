import type { NextFunction, Request, Response } from "express";

const addRating = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Rating added successfully' });
    // todo: add rating
}

const deleteRating = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Rating deleted successfully' });
    // todo: delete rating
}

export { addRating, deleteRating }