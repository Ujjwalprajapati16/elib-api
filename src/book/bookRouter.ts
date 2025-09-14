import express from "express";
import { createBook } from "./bookController.ts";
import multer from "multer";
import path from "node:path";
import { getDirname } from "../utils/dirname.ts";
const __dirname = getDirname(import.meta.url);

const bookRouter = express.Router();

const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// routes
bookRouter.post(
    "/add",
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

export default bookRouter;
