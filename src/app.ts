import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.ts';
import userRouter from './user/userRouter.ts';

const app = express();
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the elib APIs' });
});

app.use("/api/users", userRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;