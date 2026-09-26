import User from './user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { name, email, number, password } = req.body;
        if (!name || !email || !number || !password) {
            return res.status(400).json({ error: 'Name, email, number, and password are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, number, password: hashedPassword });

        const userResponse = newUser.toJSON();
        delete userResponse.password;

        res.status(201).json({
            message: 'Account created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during registration' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '48h' }
        );

        const userResponse = user.toJSON();
        delete userResponse.password;

        return res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: error.message
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userResponse = user.toJSON();
        delete userResponse.password;
        userResponse.phone = userResponse.number;

        return res.status(200).json({ user: userResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch current user' });
    }
};

export const updateCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const allowedFields = ['name', 'email', 'number', 'phone'];
        const updates = {};

        for (const field of allowedFields) {
            if (field === 'phone') {
                if (req.body.phone !== undefined || req.body.number !== undefined) {
                    updates.number = req.body.number ?? req.body.phone;
                }
                continue;
            }

            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            const userResponse = user.toJSON();
            delete userResponse.password;
            userResponse.phone = userResponse.number;
            return res.status(200).json({ user: userResponse });
        }

        await user.update(updates);

        const userResponse = user.toJSON();
        delete userResponse.password;
        userResponse.phone = userResponse.number;

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: userResponse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update current user' });
    }
};