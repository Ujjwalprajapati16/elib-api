import type { User } from "./userTypes.ts";

export interface Book {
    _id: string;
    title: string;
    author: User;
    description: string;
    genre: string;
    coverImage: string;
    file: string;
    views: number;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}