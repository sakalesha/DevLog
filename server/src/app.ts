import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import challengeRoutes from './routes/challengeRoutes';
import entryRoutes from './routes/entryRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/entries', entryRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
