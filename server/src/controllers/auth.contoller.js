const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exist.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            name, email, password: hashedPassword
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                email: user.email,
                password: user.password,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: `Server error: ${err}` })
    };
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required.' })
        };

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        };

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(409).json({ message: 'Incorrect email or password.' })
        };

        await Session.deleteMany({ userId: user._id });

        const token = uuidv4();
        await Session.create({ userId: user._id, token, expiresAt: new Date(Date.now() + 3600 * 1000) });

        res.cookie('session_token', token, { httpOnly: true, maxAge: 3600 * 1000 });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        return res.status(500).json({ message: `Server error: ${err}` })
    }
};

const logout = async (req, res) => {
    const token = req.cookies.session_token;
    if (!token) return res.status(401).json({ message: 'No token provided' });

    await Session.deleteOne({ token });
    res.clearCookie('session_token');

    res.json({ message: 'Logged out successfully' });
};

module.exports = {
    register,
    login,
    logout
};