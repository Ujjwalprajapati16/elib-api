import express from "express";
import { addRating, deleteRating, getRatingByBookId, getRatingByAuthorId } from "../controllers/ratingController.ts";
import authenticate from "../middlewares/authenticate.ts";

const ratingRouter = express.Router();

ratingRouter.post("/:BookId",authenticate, addRating);
ratingRouter.delete("/:BookId/:ratingId",authenticate, deleteRating);

ratingRouter.get("/book/:BookId", authenticate, getRatingByBookId);
ratingRouter.get("/author/:AuthorId", authenticate, getRatingByAuthorId);

export default ratingRouter;