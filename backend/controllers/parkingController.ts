import { Request, Response } from 'express';
import Slot from '../models/Slot';
import Session from '../models/Session';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSlots = async (req: Request, res: Response) => {
    try {
        const { facilityId } = req.params;
        if (!facilityId) return res.status(400).json({ message: 'Facility ID is required' });

        const slots = await Slot.find({ facilityId }).populate('currentSessionId');
        res.status(200).json(slots);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const bookSlot = async (req: AuthRequest, res: Response) => {
    try {
        const slotId = req.params.slotId as string;
        const { vehiclePlate } = req.body;
        const userId = req.user?.id;

        if (!vehiclePlate) return res.status(400).json({ message: 'Vehicle plate is required' });

        const slot = await Slot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.isOccupied) return res.status(400).json({ message: 'Slot is already occupied' });

        const newSession = new Session({ slotId: slot._id, userId, vehiclePlate, status: 'active' });
        await newSession.save();

        slot.isOccupied = true;
        slot.currentSessionId = newSession._id as any;
        await slot.save();

        res.status(200).json({ message: 'Slot booked successfully', slot, session: newSession });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const adminRegisterSlot = async (req: AuthRequest, res: Response) => {
    try {
        const slotId = req.params.slotId as string;
        const { vehiclePlate } = req.body;
        const userId = req.user?.id; // The admin doing the action

        if (!vehiclePlate) return res.status(400).json({ message: 'Vehicle plate is required' });

        const slot = await Slot.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });
        if (slot.isOccupied) return res.status(400).json({ message: 'Slot is already occupied' });

        const newSession = new Session({ slotId: slot._id, userId, vehiclePlate, status: 'active' });
        await newSession.save();

        slot.isOccupied = true;
        slot.currentSessionId = newSession._id as any;
        await slot.save();

        res.status(200).json({ message: 'Admin register (booking) successful', slot, session: newSession });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const forceUnpark = async (req: AuthRequest, res: Response) => {
    try {
        const slotId = req.params.slotId as string;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const slot = await Slot.findById(slotId);
        if (!slot || !slot.isOccupied || !slot.currentSessionId) {
            return res.status(400).json({ message: 'Slot is currently not occupied' });
        }

        const session = await Session.findById(slot.currentSessionId);
        if (!session) return res.status(404).json({ message: 'Active session not found' });

        // Ensure caller is Admin OR the owner of the session
        if (userRole !== 'admin' && session.userId?.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to unpark this vehicle' });
        }

        session.endTime = new Date();
        const durationHours = Math.abs(session.endTime.getTime() - session.startTime.getTime()) / 36e5;
        session.cost = Math.ceil(durationHours * 50); // ₹50 per hour mock price
        session.status = 'completed';
        await session.save();

        slot.isOccupied = false;
        slot.currentSessionId = null as any;
        await slot.save();

        res.status(200).json({ message: 'Vehicle unparked successfully', session, slot });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const userHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized access' });

        const history = await Session.find({ userId }).populate('slotId').sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
