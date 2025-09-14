import cloudinary from "../config/cloudinary.ts";

export const uploadFile = async (filePath: string, filename?: string) => {
    try {
        const options: any = {
            resource_type: "raw",
            folder: "book-pdfs",
            format: "pdf",
        };

        if (filename) {
            options.filename_override = filename;
        }

        return await cloudinary.uploader.upload(filePath, options);
    } catch (err) {
        throw new Error("Failed to upload book file to Cloudinary.");
    }
};
