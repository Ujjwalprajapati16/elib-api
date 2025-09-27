import express from "express";
import { addRating, deleteRating } from "../controllers/ratingController.ts";
import authenticate from "../middlewares/authenticate.ts";

const ratingRouter = express.Router();

ratingRouter.post("/:id",authenticate, addRating);
ratingRouter.delete("/:id",authenticate, deleteRating);

export default ratingRouter;