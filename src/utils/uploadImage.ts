import cloudinary from "../config/cloudinary.ts";

export const uploadImage = async (filePath: string, filename: string, mimeType: string) => {
    try {
        const options: any = {
            filename_override: filename,
            folder: "book-covers",
        };

        if (mimeType) {
            options.format = mimeType.split("/").at(-1);
        }

        return await cloudinary.uploader.upload(filePath, options);
    } catch (err) {
        throw new Error("Failed to upload image to Cloudinary.");
    }
};
