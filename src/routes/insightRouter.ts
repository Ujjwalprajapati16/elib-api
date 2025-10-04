import express from "express";
import { averageRating, highestAvgRatedBook, recentRating } from "../controllers/insightController.ts";

const insightRouter = express.Router();

insightRouter.get("/averageRating/:authorId", averageRating);
insightRouter.get("/heighestRatedBook/:authorId", highestAvgRatedBook);
insightRouter.get("/recentRating/:authorId", recentRating);


export default insightRouter;