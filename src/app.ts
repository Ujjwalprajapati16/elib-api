import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.ts';
import userRouter from './routes/userRouter.ts';
import bookRouter from './routes/bookRouter.ts';
import cors from 'cors';
import { config } from './config/config.ts';
import ratingRouter from './routes/ratingRoutes.ts';

const app = express();
app.use(cors({
    origin: config.frontend_domain,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the elib APIs' });
});

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/rate", ratingRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;