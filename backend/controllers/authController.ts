import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_fallback';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, licensePlate } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const newUser = new User({ name, email, passwordHash: hashed, role: role || 'user', licensePlate });
        await newUser.save();

        const payload = { id: newUser._id, role: newUser.role, email: newUser.email, name: newUser.name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ message: 'User registered successfully', token, user: payload });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        const payload = { id: user._id, role: user.role, email: user.email, name: user.name };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ message: 'Login successful', token, user: payload });
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};
