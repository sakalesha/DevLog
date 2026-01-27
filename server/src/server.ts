import app from './app';
import connectDB from './config/database';
import dotenv from 'dotenv';
import path from 'path';

// Parse .env from root of server directory if not already loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
