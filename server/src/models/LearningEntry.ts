import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningEntry extends Document {
    userId: string;
    date: Date;
    topic: string;
    category: 'Frontend' | 'Backend' | 'Fullstack' | 'DevOps' | 'DSA' | 'System Design' | 'Cloud' | 'Other';
    content: string;
    keyTakeaway: string;
    timeSpent: {
        amount: number;
        unit: 'minutes' | 'hours';
    };
    challengeId: string; // 'none' or ObjectId string
    dayNumber: number;
    tags: string[];
    status: 'draft' | 'published';
    views: number;
    createdAt: Date;
    updatedAt: Date;
}

const LearningEntrySchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
        topic: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'DSA', 'System Design', 'Cloud', 'Other'],
        },
        content: { type: String, required: true }, // Rich text HTML
        keyTakeaway: { type: String, required: true },
        timeSpent: {
            amount: { type: Number, required: true },
            unit: { type: String, required: true, enum: ['minutes', 'hours'] },
        },
        challengeId: { type: String, required: true, default: 'none' }, // Can be an ObjectId if referenced
        dayNumber: { type: Number, required: true },
        tags: [{ type: String }],
        status: {
            type: String,
            required: true,
            enum: ['draft', 'published'],
            default: 'published',
        },
        views: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ILearningEntry>('LearningEntry', LearningEntrySchema);
