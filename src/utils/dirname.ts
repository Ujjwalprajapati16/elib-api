import path from "node:path";
import { fileURLToPath } from "node:url";

export const getDirname = (metaUrl: string) => {
    const __filename = fileURLToPath(metaUrl);
    return path.dirname(__filename);
};
