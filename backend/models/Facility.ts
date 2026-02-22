import mongoose, { Document, Schema } from 'mongoose';

export interface IFacility extends Document {
    adminId: mongoose.Types.ObjectId;
    name: string; // Defaults to Admin's name or custom
    rows: number;
    cols: number;
    // We could store total slots here or calculate it
    createdAt: Date;
    updatedAt: Date;
}

const facilitySchema = new Schema<IFacility>({
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One admin, one facility for simplicity
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    rows: {
        type: Number,
        required: true,
        min: 1
    },
    cols: {
        type: Number,
        required: true,
        min: 1
    }
}, {
    timestamps: true
});

const Facility = mongoose.model<IFacility>('Facility', facilitySchema);
export default Facility;
