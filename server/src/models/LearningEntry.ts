import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningEntry extends Document {
    userId: string;
    date: Date;
    topic: string;
    category: string;
    categoryId?: string;
    categoryPath?: string[];
    content: string;
    keyTakeaway: string;
    timeSpent: {
        amount: number;
        unit: 'minutes' | 'hours';
    };
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
            default: 'General',
        },
        categoryId: { type: String, default: null },
        categoryPath: [{ type: String }],
        content: { type: String, required: true }, // Rich text HTML
        keyTakeaway: { type: String, required: true },
        timeSpent: {
            amount: { type: Number, required: true },
            unit: { type: String, required: true, enum: ['minutes', 'hours'] },
        },
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

