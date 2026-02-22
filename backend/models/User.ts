import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    name: string; // Admin's name or User's name
    licensePlate?: string;
    createdAt: Date;
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    licensePlate: {
        type: String,
        trim: true,
        uppercase: true
    }
}, {
    timestamps: true
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
