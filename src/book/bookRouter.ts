import express from "express";
import { createBook } from "./bookController.ts";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: {
        fileSize: 30 * 1024 * 1024 // 30MB limit -> 3e7
    }
});

// routes
bookRouter.post("/add",
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 }
    ]),
    createBook
);

export default bookRouter;