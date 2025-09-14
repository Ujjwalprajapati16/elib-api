import fs from "node:fs";

export const deleteLocalFile = async (filePath: string) => {
    try {
        await fs.promises.unlink(filePath);
    } catch (err) {
        console.warn(`Failed to delete local file: ${filePath}`, err);
    }
};
