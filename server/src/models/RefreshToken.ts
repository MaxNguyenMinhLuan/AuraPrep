import mongoose, { Document, Schema } from 'mongoose';
import { IRefreshToken } from '../types';

export interface RefreshTokenDocument extends Omit<IRefreshToken, '_id'>, Document {}

const RefreshTokenSchema = new Schema<RefreshTokenDocument>({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    replacedByToken: {
        type: String,
        default: null
    },
    userAgent: {
        type: String
    },
    ipAddress: {
        type: String
    }
}, {
    timestamps: true
});

// TTL index to automatically delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model<RefreshTokenDocument>('RefreshToken', RefreshTokenSchema);
