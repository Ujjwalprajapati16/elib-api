import mongoose from "mongoose";
import type { Book } from "../types/bookTypes.ts";

const bookSchema = new mongoose.Schema<Book>({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model<Book>("Book", bookSchema);