import app from '../server/src/app';
import connectDB from '../server/src/config/database';

// Initialize Database
connectDB();

// Export the Express app
export default app;
