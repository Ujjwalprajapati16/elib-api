import express from "express";
import { addRating, deleteRating } from "../controllers/ratingController.ts";
import authenticate from "../middlewares/authenticate.ts";

const ratingRouter = express.Router();

ratingRouter.post("/:BookId",authenticate, addRating);
ratingRouter.delete("/:BookId/:ratingId",authenticate, deleteRating);

export default ratingRouter;