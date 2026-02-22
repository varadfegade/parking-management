import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    userId?: mongoose.Types.ObjectId;
    slotId: mongoose.Types.ObjectId;
    vehiclePlate: string;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'completed' | 'cancelled';
    cost?: number;
}

const sessionSchema = new Schema<ISession>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    slotId: {
        type: Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    },
    vehiclePlate: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    cost: {
        type: Number
    }
}, {
    timestamps: true
});

const Session = mongoose.model<ISession>('Session', sessionSchema);
export default Session;
