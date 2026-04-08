const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Session = require('../models/Session');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User with this email already exist.' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            name, email, password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            id: user._id,
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role
        });

    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err}` })
    };
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required.' })
        };

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        };

        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(409).json({ success: false, message: 'Incorrect email or password.' })
        };

        await Session.deleteMany({ userId: user._id });

        const token = uuidv4();
        await Session.create({ userId: user._id, token, expiresAt: new Date(Date.now() + 3600 * 1000) });

        res.cookie('session_token', token, { httpOnly: true, maxAge: 3600 * 1000 });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: `Server error: ${err}` })
    }
};

const logout = async (req, res) => {
    const token = req.cookies.session_token;
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    await Session.deleteOne({ token });
    res.clearCookie('session_token');

    res.json({ success: true, message: 'Logged out successfully' });
};

const me = async (req, res) => {
    const token = req.cookies?.session_token;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const session = await Session.findOne({ token });
    if (!session) {
        return res.status(401).json({ message: 'Invalid session' });
    }

    if (session.expiresAt && session.expiresAt < new Date()) {
        await Session.deleteOne({ _id: session._id });
        return res.status(401).json({ message: 'Session expired' });
    }

    const user = await User.findById(session.userId);
    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.session = session;

    res.status(200).json({
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    })
}

module.exports = {
    register,
    login,
    logout,
    me
};