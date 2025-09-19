import type { Types } from "mongoose";
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
    likes: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}