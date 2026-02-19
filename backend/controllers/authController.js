const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, disabilityType, role } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({
            name, email, password, disabilityType, role
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        // Always respond with success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate a secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save({ validateBeforeSave: false });

        // Build reset URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        // Send password reset email via Brevo
        try {
            await sendPasswordResetEmail({
                toEmail: user.email,
                toName: user.name,
                resetUrl,
            });
            console.log(`[Auth] Reset email sent to ${email}`);
        } catch (emailError) {
            console.error('[Auth] Email send failed:', emailError.message);
            // Clear the token since email didn't send
            user.resetPasswordToken   = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Could not send reset email. Please try again.' });
        }

        res.json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('[Auth] Forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

module.exports = { registerUser, loginUser, forgotPassword };
