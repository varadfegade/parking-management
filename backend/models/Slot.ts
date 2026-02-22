import mongoose, { Document, Schema } from 'mongoose';

export interface ISlot extends Document {
    facilityId: mongoose.Types.ObjectId;
    slotNumber: string;
    row: number;
    col: number;
    type: 'standard' | 'vip' | 'disabled';
    isOccupied: boolean;
    currentSessionId?: mongoose.Types.ObjectId;
}

const slotSchema = new Schema<ISlot>({
    facilityId: {
        type: Schema.Types.ObjectId,
        ref: 'Facility',
        required: true
    },
    slotNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    row: {
        type: Number,
        required: true
    },
    col: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['standard', 'vip', 'disabled'],
        default: 'standard'
    },
    isOccupied: {
        type: Boolean,
        default: false
    },
    currentSessionId: {
        type: Schema.Types.ObjectId,
        ref: 'Session'
    }
}, {
    timestamps: true
});

// Ensure slot numbers are unique only within a specific facility
slotSchema.index({ facilityId: 1, slotNumber: 1 }, { unique: true });

const Slot = mongoose.model<ISlot>('Slot', slotSchema);
export default Slot;
