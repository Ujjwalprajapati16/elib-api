import mongoose from "mongoose";
import { config } from "./config.ts";

const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected successfully");
        });
        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });
        await mongoose.connect(config.mongo_uri);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectDB;