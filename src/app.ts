import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.ts';

const app = express();

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the elib APIs' });
});

// Global error handler
app.use(globalErrorHandler);

export default app;