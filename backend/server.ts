import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

import authRoutes from './routes/authRoutes';
import parkingRoutes from './routes/parkingRoutes';
import facilityRoutes from './routes/facilityRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/facility', facilityRoutes);

app.get('/', (req, res) => {
    res.send('Smart Parking API is running... Modular Root Structure');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
