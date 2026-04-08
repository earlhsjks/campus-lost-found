import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications on load and every 30 seconds
    useEffect(() => {
        if (!user) return;

        const fetchAlerts = async () => {
            try {
                const res = await api.get('/notification');
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            } catch (err) {
                console.error(`Could not fetch notifications: ${err}`);
            }
        };

        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [user]);

    // Close dropdown if user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        setIsOpen(false); // Close dropdown

        // If it's unread, tell the backend to mark it as read
        if (!notification.isRead) {
            try {
                await api.put(`/notifications/${notification._id}/read`);
                // Update local state instantly so the red badge count drops
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev =>
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
            } catch (err) {
                console.error("Failed to mark as read");
            }
        }
    };

    if (!user) return null; // Don't show the bell if not logged in

    return (
        <div className="relative" ref={dropdownRef}>
            {/* The Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors focus:outline-none"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* The Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-xl border-2 border-muted z-50 overflow-hidden">
                    <div className="p-4 bg-muted border-b-2 border-gray-100 flex justify-between items-center">
                        <h3 className="font-extrabold text-foreground">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs font-bold text-primary">{unreadCount} New</span>}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 font-medium text-sm">
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((note) => (
                                <Link
                                    key={note._id}
                                    to={`/item/${note.relatedItemId}`} // Jumps right to the matched item!
                                    onClick={() => handleNotificationClick(note)}
                                    className={`block p-4 border-b border-gray-50 transition-colors hover:bg-gray-50 ${!note.isRead ? 'bg-blue-50/50' : 'bg-white'}`}
                                >
                                    <div className="flex gap-3 items-start">
                                        <div className={`mt-1 rounded-full p-1.5 ${!note.isRead ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                            {!note.isRead ? <Package className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!note.isRead ? 'font-bold text-foreground' : 'font-medium text-gray-600'}`}>
                                                {note.message}
                                            </p>
                                            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}