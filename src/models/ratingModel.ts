import mongoose from "mongoose";
import type { Rating } from "../types/ratingTypes.ts";

const ratingSchema = new mongoose.Schema<Rating>({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    }
});

export default mongoose.model("Rating", ratingSchema);