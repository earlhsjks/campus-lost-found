import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, MessageSquare, Tag, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Badge, Card, CardContent } from './ui';

export default function PostCard({ item }) {
  const { user, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 🚨 New State

  const { type, title, description, image, status, attributes, createdAt } = item;

  // --- RELATIVE TIME HELPER ---
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSecs = Math.floor((now - date) / 1000);
    if (diffInSecs < 60) return "just now";
    const diffInMins = Math.floor(diffInSecs / 60);
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLost = type === 'lost';
  const isOpen = status === 'open';
  const currentUserId = user?.userId || user?.id;
  const isMyPost = currentUserId && item.reportedBy?.userId === currentUserId;
  const relativeTime = formatRelativeTime(createdAt);

  // --- THE CLAIM LOGIC ---
  const handleClaimSubmit = async () => {
    setIsLoading(true);
    try {
      const commentText = isLost ? 'I found this!' : "That's mine!";
      await api.post(`/claim/create/${item._id}`, { proof: commentText });
      await api.post(`/item/comments/${item._id}`, { text: commentText });
      navigate(`/item/${item._id}`);
    } catch (error) {
      console.error('Failed to claim item:', error);
      alert(error.response?.data?.message || 'Failed to claim item.');
    } finally {
      setIsLoading(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`group ${!isOpen ? 'opacity-70' : ''}`}>
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-2">
                <Badge variant={isLost ? 'primary' : 'success'}>
                  {isLost ? '🔍 Lost' : '📦 Found'}
                </Badge>
                {!isOpen && <Badge variant="secondary">{status}</Badge>}
              </div>
              <div className="text-muted-foreground text-xs font-bold uppercase">
                <Clock className="w-3.5 h-3.5 inline mr-1" /> {relativeTime}
              </div>
            </div>

            {/* Link Wrap */}
            <Link to={`/item/${item._id}`} className="block group/link">
              <h3 className="font-display font-bold text-2xl mb-2 group-hover/link:text-accent transition-colors">
                {title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
              {image && (
                <div className="w-full max-h-96 bg-muted rounded-lg mb-4 overflow-hidden border flex items-center justify-center">
                  <img src={image} alt={title} className="w-full h-auto max-h-96 object-contain" />
                </div>
              )}
            </Link>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase">
                <MapPin className="w-4 h-4 text-accent" /> {item.locationId?.name || "Campus"}
              </div>

              {isOpen && !isMyPost && (
                <Button
                  onClick={() => user ? setShowConfirmModal(true) : setShowLoginModal(true)}
                  variant="primary" size="md" className="font-bold"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {isLost ? 'I Found This' : "That's Mine!"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🚨 CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border-2 border-border p-6 rounded-2xl shadow-2xl"
            >
              <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4 text-accent">
                <AlertCircle className="w-8 h-8" />
                <h2 className="font-display font-bold text-xl uppercase tracking-tight">Confirm Action</h2>
              </div>

              <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                You are claiming that this <span className="text-foreground font-bold">"{title}"</span> belongs to you. 
                This will notify the reporter and start a conversation. Are you sure?
              </p>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1 font-bold" onClick={handleClaimSubmit} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Yes, Confirm'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}