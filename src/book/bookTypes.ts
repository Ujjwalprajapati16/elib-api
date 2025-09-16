import type { User } from "../user/userTypes.ts";

export interface Book {
    _id: string;
    title: string;
    author: User;
    description: string;
    genre: string;
    coverImage: string;
    file: string;
    createdAt: Date;
    updatedAt: Date;
}