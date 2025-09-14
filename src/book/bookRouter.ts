import express from "express";
import { createBook, listBooks, updateBook } from "./bookController.ts";
import multer from "multer";
import path from "node:path";
import { getDirname } from "../utils/dirname.ts";
import authenticate from "../middlewares/authenticate.ts";
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
    authenticate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook
);

bookRouter.patch(
    "/update/:Bookid",
    authenticate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    updateBook
)

bookRouter.get("/", listBooks);

export default bookRouter;
