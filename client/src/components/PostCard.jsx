import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, MessageSquare, Tag, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button, Badge, Card, CardContent } from './ui';

export default function PostCard({ item }) {
  const { user, setShowLoginModal } = useAuth();
  const navigate = useNavigate();
  
  // --- UI STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { type, title, description, image, status, attributes, createdAt } = item;

  // --- 🛠️ HELPER: RELATIVE TIME ---
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
  
  // Payload fix for immediate login recognition
  const currentUserId = user?.userId || user?.id;
  const isMyPost = currentUserId && item.reportedBy?.userId === currentUserId;
  const relativeTime = formatRelativeTime(createdAt);
  const locationName = item.locationId?.name || "Campus Grounds";

  // --- 🚀 CORE LOGIC: SUBMIT CLAIM ---
  const handleClaimSubmit = async () => {
    setIsLoading(true);
    setErrorMessage(""); // Clear old errors
    
    try {
      const commentText = isLost ? 'I found this!' : "That's mine!";
      
      // 1. Create the official claim
      await api.post(`/claim/create/${item._id}`, { proof: commentText });
      
      // 2. Post the public comment/notification
      await api.post(`/item/comments/${item._id}`, { text: commentText });
      
      // 3. Success! Close modal and go to details
      setShowConfirmModal(false);
      navigate(`/item/${item._id}`);
    } catch (error) {
      console.error('Claim Error:', error);
      // Capture the specific error message from your backend bouncer
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
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
              <div className="flex items-center gap-1 text-muted-foreground text-xs font-bold uppercase tracking-tight">
                <Clock className="w-3.5 h-3.5" /> {relativeTime}
              </div>
            </div>

            {/* Content Link */}
            <Link to={`/item/${item._id}`} className="block group/link">
              <h3 className="font-display font-bold text-2xl mb-2 text-foreground group-hover/link:text-accent transition-colors leading-tight">
                {title}
              </h3>
              <p className="text-muted-foreground mb-4 font-medium leading-relaxed line-clamp-2">
                {description}
              </p>
              {image && (
                <div className="w-full max-h-96 bg-muted rounded-lg mb-4 overflow-hidden border border-border flex items-center justify-center">
                  <img src={image} alt={title} className="w-full h-auto max-h-96 object-contain" />
                </div>
              )}
            </Link>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs tracking-wider">
                <MapPin className="w-4 h-4 text-accent" /> {locationName}
              </div>

              {isOpen && !isMyPost && (
                <Button
                  onClick={() => user ? setShowConfirmModal(true) : setShowLoginModal(true)}
                  variant="primary" size="md" className="w-full sm:w-auto font-bold"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {isLost ? 'I Found This' : "That's Mine!"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- 🚨 CONFIRMATION & ERROR MODAL --- */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if(!isLoading) setShowConfirmModal(false); setErrorMessage(""); }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border-2 border-border p-6 rounded-2xl shadow-2xl"
            >
              <button 
                onClick={() => { setShowConfirmModal(false); setErrorMessage(""); }} 
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`flex items-center gap-3 mb-4 ${errorMessage ? 'text-red-500' : 'text-accent'}`}>
                {errorMessage ? <ShieldAlert className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                <h2 className="font-display font-bold text-xl uppercase tracking-tighter">
                  {errorMessage ? 'Action Blocked' : 'Confirm Claim'}
                </h2>
              </div>

              <p className="text-muted-foreground font-medium mb-6 leading-relaxed">
                {errorMessage ? (
                  "We couldn't process your claim for the following reason:"
                ) : (
                  <>You are claiming ownership of <span className="text-foreground font-bold">"{title}"</span>. This will notify the original poster to coordinate a return.</>
                )}
              </p>

              {/* Error Message Box */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMessage}
                </motion.div>
              )}

              <div className="flex gap-3 mt-2">
                <Button 
                  variant="ghost" className="flex-1" 
                  onClick={() => { setShowConfirmModal(false); setErrorMessage(""); }}
                  disabled={isLoading}
                >
                  {errorMessage ? 'Close' : 'Cancel'}
                </Button>
                
                {!errorMessage && (
                  <Button 
                    variant="primary" className="flex-1 font-bold" 
                    onClick={handleClaimSubmit} disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Yes, Confirm'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}