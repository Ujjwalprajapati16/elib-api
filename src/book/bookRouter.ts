import express from "express";
import { createBook } from "./bookController.ts";

const bookRouter = express.Router();

// routes
bookRouter.post("/add", createBook);

export default bookRouter;