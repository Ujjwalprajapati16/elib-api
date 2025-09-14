import cloudinary from "../config/cloudinary.ts";

export const deleteFile = async (filePath: string) => {
    try {
        const fileSplits = filePath.split("/");
        const publicId =
            fileSplits.at(-2) + "/" + fileSplits.at(-1); // keep extension (e.g., .pdf)

        if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
        }
    } catch (err) {
        console.error("Failed to delete file from Cloudinary:", err);
    }
};
