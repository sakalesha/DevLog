import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find({ userId: (req as any).user._id }).sort({ createdAt: 1 });
        res.json(categories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, parentId, color, icon } = req.body;
        const category = new Category({
            name,
            parentId: parentId || null,
            color: color || '#6366F1',
            icon: icon || 'Folder',
            userId: (req as any).user._id,
        });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const { name, parentId, color, icon } = req.body;
        if (name !== undefined) category.name = name;
        if (parentId !== undefined) category.parentId = parentId || null;
        if (color !== undefined) category.color = color;
        if (icon !== undefined) category.icon = icon;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// Helper for recursive deletion of child categories
const deleteCategoryChildren = async (parentId: string, userId: string) => {
    const children = await Category.find({ parentId, userId });
    for (const child of children) {
        await deleteCategoryChildren(child._id.toString(), userId);
        await child.deleteOne();
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const userId = (req as any).user._id;
        const categoryId = category._id.toString();

        // Recursively delete all nested subcategories
        await deleteCategoryChildren(categoryId, userId);
        await category.deleteOne();

        res.json({ message: 'Category and all nested subcategories removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
