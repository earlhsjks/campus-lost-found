const Session = require('./models/Session');
const User = require('./models/User');

const protect = async (req, res, next) => {
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
    next();
};

module.exports = protect;
