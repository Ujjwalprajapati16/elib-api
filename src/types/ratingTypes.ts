import type { Book } from "./bookTypes.ts";
import type { User } from "./userTypes.ts";

export interface Rating {
    _id: string;
    book: Book;
    user: User;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}