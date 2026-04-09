const Comment = require('../models/Comment');
const Session = require('../models/Session');
const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification'); 

// 1. Fetch all messages for an item
const getItemComments = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find comments and sort by createdAt ascending (oldest at the top, newest at the bottom)
        const comments = await Comment.find({ itemId: id }).sort({ createdAt: 1 });
        
        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Failed to load coordination chat." });
    }
};

// 2. Add a new message to an item
const addComment = async (req, res) => {
    try {
        const { id } = req.params; // The item ID from the URL
        const { text } = req.body; // The message text from React

        // --- AUTHENTICATION CHECK ---
        // Reusing your exact session logic to prove who is sending this!
        const token = req.cookies?.session_token;
        if (!token) return res.status(401).json({ message: "Unauthorized: Please log in." });

        const session = await Session.findOne({ token });
        if (!session || (session.expiresAt && session.expiresAt < new Date())) {
            return res.status(401).json({ message: "Unauthorized: Session expired." });
        }

        const user = await User.findById(session.userId);
        if (!user) return res.status(401).json({ message: "Unauthorized: User not found." });
        // -----------------------------

        // Create the comment in MongoDB
        const newComment = await Comment.create({
            itemId: id,
            senderId: user._id,
            senderName: user.name,
            text: text
        });

        // Get the item to find the owner
        const item = await Item.findById(id);
        if (item && item.reportedBy?.userId) {
            // Only create notification if the commenter is NOT the post owner
            if (!item.reportedBy.userId.equals(user._id)) {
                await Notification.create({
                    recipientId: item.reportedBy.userId,
                    type: 'new_comment',
                    message: `${user.name} commented on your ${item.type} item: "${item.title}"`,
                    relatedItemId: id
                });
            }
        }

        // Send the newly created comment back to React so it instantly appears in the UI
        res.status(201).json(newComment);
        
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Failed to send message." });
    }
};

module.exports = {
    getItemComments,
    addComment
};