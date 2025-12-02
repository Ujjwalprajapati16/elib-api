import cloudinary from "../config/cloudinary.ts";
import type { UploadApiOptions } from "cloudinary";

export const uploadImage = async (filePath: string, filename: string, mimeType: string) => {
    try {
        const options: UploadApiOptions = {
            filename_override: filename,
            folder: "book-covers",
            resource_type: "image", 
        };

        if (mimeType) {
            const format = mimeType.split("/").at(-1);
            
            if (format) {
                options.format = format;
            }
        }

        return await cloudinary.uploader.upload(filePath, options);
    } catch (err) {;
        throw new Error((err as Error).message || "Failed to upload image to Cloudinary.");
    }
};