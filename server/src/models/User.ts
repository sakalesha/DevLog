import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define interface extending mongoose Document
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // Optional because we might not select it by default
    avatar?: string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: 'https://picsum.photos/seed/default/100/100',
    },
}, {
    timestamps: true,
});

// Matches user-entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password as string);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
