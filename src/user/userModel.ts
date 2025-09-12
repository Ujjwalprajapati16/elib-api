import mongoose from "mongoose";
import type { User } from "./userTypes.ts";

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
    }
}, {
    timestamps: true
});

export default mongoose.model<User>("User", userSchema);
