import app from '../server/src/app';
import connectDB from '../server/src/config/database';

export default async (req: any, res: any) => {
    await connectDB();
    app(req, res);
};
