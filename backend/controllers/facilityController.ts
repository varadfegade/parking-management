import { Request, Response } from 'express';
import Facility from '../models/Facility';
import Slot from '../models/Slot';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// Admin: Setup or Update Facility
export const setupFacility = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        const { name, rows, cols, customSlots } = req.body;

        if (!adminId || !name || !rows || !cols) {
            return res.status(400).json({ message: 'Name, rows, and cols are required' });
        }

        // Find existing facility for this admin
        let facility = await Facility.findOne({ adminId });

        if (facility) {
            // Update existing
            facility.name = name;
            facility.rows = rows;
            facility.cols = cols;
            await facility.save();

            // For simplicity in this mockup, we delete all existing slots and recreate them.
            // In a production app, we would selectively add/remove slots to preserve active sessions.
            await Slot.deleteMany({ facilityId: facility._id });
        } else {
            // Create new
            facility = new Facility({ adminId, name, rows, cols });
            await facility.save();
        }

        // Generate slots
        let slotsToCreate: any[] = [];

        if (customSlots && Array.isArray(customSlots)) {
            // Use Admin's interactive design
            slotsToCreate = customSlots.map((slot: any) => ({
                facilityId: facility._id,
                slotNumber: slot.slotNumber,
                row: slot.row,
                col: slot.col,
                type: slot.type,
                isOccupied: false
            }));
        } else {
            // Fallback auto-generation
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const rowLetter = String.fromCharCode(65 + r);
                    const slotNumber = `${rowLetter}-${c + 1}`;

                    let type = 'standard';
                    if (r === 0) type = 'vip';
                    else if (c === 0) type = 'disabled';

                    slotsToCreate.push({
                        facilityId: facility._id,
                        slotNumber,
                        row: r,
                        col: c,
                        type,
                        isOccupied: false
                    });
                }
            }
        }

        await Slot.insertMany(slotsToCreate);

        res.status(200).json({ message: 'Facility setup successful', facility });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// User: Join Facility by Admin Name
export const getFacilityByName = async (req: Request, res: Response) => {
    try {
        const { adminName } = req.params;

        // Find the admin user by name
        const adminUser = await User.findOne({ name: { $regex: new RegExp(`^${adminName}$`, 'i') }, role: 'admin' });

        if (!adminUser) {
            return res.status(404).json({ message: 'No facility found for this Admin name' });
        }

        const facility = await Facility.findOne({ adminId: adminUser._id });
        if (!facility) {
            return res.status(404).json({ message: 'Admin has not set up a facility yet' });
        }

        res.status(200).json(facility);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
