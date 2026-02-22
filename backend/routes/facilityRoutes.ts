import express from 'express';
import { setupFacility, getFacilityByName } from '../controllers/facilityController';
import { protect, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/setup', protect as any, adminOnly as any, setupFacility as any);
router.get('/admin/:adminName', getFacilityByName);

export default router;
