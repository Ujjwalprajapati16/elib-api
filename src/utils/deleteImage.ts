import cloudinary from "../config/cloudinary.ts";

export const deleteImage = async (imagePath: string) => {
    try {
        const coverFileSplits = imagePath.split("/");
        const publicId =
            coverFileSplits.at(-2) +
            "/" +
            coverFileSplits.at(-1)?.split(".").at(0); // remove extension

        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
    } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
    }
};