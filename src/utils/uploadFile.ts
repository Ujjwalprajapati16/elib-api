import cloudinary from "../config/cloudinary.ts";
import type { UploadApiOptions } from "cloudinary";

export const uploadFile = async (filePath: string, filename?: string) => {
    try {
        const options: UploadApiOptions = {
            resource_type: "raw",
            folder: "book-pdfs",
            format: "pdf",
        };

        if (filename) {
            options.filename_override = filename;
        }

        return await cloudinary.uploader.upload(filePath, options);
    } catch (error) {
        // Robust error handling: Check if 'error' is actually an Error object
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(message || "Failed to upload book file to Cloudinary.");
    }
};