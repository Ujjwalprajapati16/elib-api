import mongoose from "mongoose";
import type { User } from "../types/userTypes.ts";

const userSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "author"],
        default: "user"
    }
}, {
    timestamps: true
});

export default mongoose.model<User>("User", userSchema);
