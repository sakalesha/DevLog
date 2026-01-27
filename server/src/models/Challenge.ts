import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
    name: string;
    description: string;
    startDate: Date;
    duration: number; // in days
    category: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps' | 'DSA' | 'System Design' | 'Cloud' | 'Other' | 'Java' | 'JavaScript' | 'React' | 'Database' | 'AI/ML';
    status: 'active' | 'completed' | 'abandoned';
    userId: string; // For now simplified, later logic reference to User model
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true },
        duration: { type: Number, required: true },
        category: {
            type: String,
            required: true,
            enum: ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'DSA', 'System Design', 'Cloud', 'Other', 'Java', 'JavaScript', 'React', 'Database', 'AI/ML'],
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'completed', 'abandoned'],
            default: 'active',
        },
        userId: { type: String, required: true }, // Placeholder for auth
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);
