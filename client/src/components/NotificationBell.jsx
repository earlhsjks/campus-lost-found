import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Package, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from './ui';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on load and every 10 seconds
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
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);

    if (!notification.isRead) {
      try {
        await api.put(`/notification/${notification._id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              {unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[70px] left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:-right-2 sm:w-96 bg-card rounded-xl shadow-2xl border border-border z-[100] overflow-hidden origin-top-right"
          >
            {/* Header */}
            <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
              <h3 className="font-display font-bold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge variant="primary">{unreadCount} New</Badge>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Notifications List */}
            <motion.div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center text-muted-foreground font-medium text-sm"
                >
                  <div className="text-4xl mb-2">✨</div>
                  You're all caught up!
                </motion.div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((note, idx) => (
                    <motion.div
                      key={note._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={`/item/${note.relatedItemId}`}
                        onClick={() => handleNotificationClick(note)}
                        className={`block p-4 transition-all duration-200 hover:bg-muted/50 ${
                          !note.isRead ? 'bg-accent/5' : 'bg-background'
                        }`}
                      >
                        <div className="flex gap-3 items-start">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`mt-1 rounded-full p-1.5 flex-shrink-0 ${
                              !note.isRead
                                ? 'bg-accent text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {!note.isRead ? (
                              <Package className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                !note.isRead
                                  ? 'font-semibold text-foreground'
                                  : 'font-medium text-muted-foreground'
                              }`}
                            >
                              {note.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 font-medium mt-1 uppercase tracking-wider">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}