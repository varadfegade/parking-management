import express from 'express';
import { getSlots, bookSlot, adminRegisterSlot, forceUnpark, userHistory } from '../controllers/parkingController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/slots/:facilityId', getSlots);

// Apply protect middleware to the rest
router.use(protect as any);

router.post('/book/:slotId', bookSlot as any);
router.get('/history', userHistory as any);

// Admin only
router.post('/unpark/:slotId', forceUnpark as any);
router.post('/register/:slotId', adminOnly as any, adminRegisterSlot as any);

export default router;
