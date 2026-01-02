import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    photoUrl: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        required: true
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    passwordHash: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ email: 1, authProvider: 1 });

export const User = mongoose.model<UserDocument>('User', UserSchema);
