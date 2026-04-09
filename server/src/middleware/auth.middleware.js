const Session = require('../models/Session');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.session_token;
        
        if (!token) {
            return res.status(401).json({ message: 'Not authorized - No token found' });
        }

        const session = await Session.findOne({ token });
        
        if (!session) {
            return res.status(401).json({ message: 'Invalid session - Please log in again' });
        }

        // Check expiration
        if (session.expiresAt && session.expiresAt < new Date()) {
            await Session.deleteOne({ _id: session._id });
            return res.status(401).json({ message: 'Session expired' });
        }

        const user = await User.findById(session.userId).select('-password'); // 🔒 Safety: Don't pass the password hash around
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // 🎯 Success: Attach user data to the request
        req.user = user;
        req.session = session;
        next();
    } catch (error) {
        console.error("AUTH MIDDLEWARE ERROR:", error);
        return res.status(500).json({ message: 'Internal Server Error in Auth Middleware' });
    }
};

module.exports = { protect };