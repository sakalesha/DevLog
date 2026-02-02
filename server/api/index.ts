import app from '../src/app';
import connectDB from '../src/config/database';

export default async (req: any, res: any) => {
    await connectDB();
    app(req, res);
};
