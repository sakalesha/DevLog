import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    parentId: string | null; // null for root categories, ObjectId/string for subcategories
    userId: string;
    color?: string; // Optional hex color code for badge/accent
    icon?: string; // Optional Lucide icon name
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        parentId: { type: String, default: null },
        userId: { type: String, required: true },
        color: { type: String, default: '#6366F1' },
        icon: { type: String, default: 'Folder' },
    },
    {
        timestamps: true,
    }
);

// Index on userId and parentId for fast querying of a user's tree
CategorySchema.index({ userId: 1, parentId: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
